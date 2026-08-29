import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('@regression:claim manifest has one matching test for every unique claim', async () => {
  const claims = JSON.parse(await readFile(resolve(process.cwd(), '.factory/claims.json'), 'utf8')) as { id: string; test: string }[];
  expect(new Set(claims.map(claim => claim.id)).size).toBe(claims.length);
  const sources = `${await readFile(resolve(process.cwd(), 'tests/claims.spec.ts'), 'utf8')}\n${await readFile(resolve(process.cwd(), 'tests/quality.spec.ts'), 'utf8')}`;
  for (const claim of claims) {
    expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    expect(sources.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
  }
});

test('@regression:review-1 copy uses concrete wording and a valid catalog line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan meals for each person');
  await expect(page.getByText('Works offline after your first visit.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Manage people', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Plan individual and shared meals' })).toBeVisible();
  await expect(page.getByText('Leave a small prep task for later.')).toBeVisible();

  const readme = await readFile(resolve(process.cwd(), 'README.md'), 'utf8');
  const readmeText = readme.replace(/\s+/g, ' ');
  for (const removed of ['Plan meals by person, not guesswork', 'offline-first PWA', 'separate IndexedDB store', 'exit lifecycle']) {
    expect(readme).not.toContain(removed);
  }
  expect(readmeText).toContain('Name the people in your kitchen. Put meals in their lanes.');
  expect(readmeText).toContain('The test suite checks the demo, exports, imports, shared meals, prep labels,');

  const catalog = (await readFile(resolve(process.cwd(), '.factory/catalog-description.txt'), 'utf8')).trim();
  expect(catalog.length).toBeLessThanOrEqual(120);
  expect(catalog).toMatch(/^Plan\b/);
});

test('@regression:review-2 describes the full claim test scope accurately', async () => {
  const readme = await readFile(resolve(process.cwd(), 'README.md'), 'utf8');
  expect(readme).toContain('## Claims tested');
  expect(readme).not.toContain('## Claims checked in the demo');
});

for (const route of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
  test(`@regression:accessibility ${route} has no serious or critical axe violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(route);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as Window & { axe: typeof axe }).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
      return result.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
    });
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test.describe('dark scheme accessibility', () => {
  test.use({ colorScheme: 'dark' });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    test(`@regression:accessibility ${route} has no serious or critical dark-scheme axe violations`, async ({ page }) => {
      await page.goto(route);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => {
        const result = await (window as Window & { axe: typeof axe }).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
        return result.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
      });
      expect(violations).toEqual([]);
    });
  }
});

test('@regression:mobile keyboard path keeps the board reachable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  expect(await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeInViewport();
  await page.locator('button[data-meal="m1"]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Meal name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('@regression:all reported 390px controls meet the 44px touch-target minimum', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const target of [page.locator('.add-cell').first(), page.getByRole('button', { name: 'Reset demo' })]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('@regression:every visible 390px interactive target is at least 44px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    await page.goto(route);
    const tooSmall = await page.locator('a, button, input:not([type="file"]), select, textarea, [role="button"], [tabindex="0"]').evaluateAll(elements => elements
      .filter(element => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0 && box.bottom >= 0;
      })
      .map(element => {
        const box = element.getBoundingClientRect();
        return { label: (element.getAttribute('aria-label') || element.textContent || element.tagName).trim(), width: box.width, height: box.height };
      })
      .filter(target => target.width < 44 || target.height < 44));
    expect(tooSmall, route).toEqual([]);
  }
});

test('@regression:visible Export JSON label is its accessible name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Export JSON', exact: true })).toHaveAccessibleName('Export JSON');
  await expect(page.getByRole('button', { name: 'Manage people', exact: true })).toHaveAccessibleName('Manage people');
});

test('@regression:all populated meal slips pass axe label-content-name-mismatch', async ({ page }) => {
  await page.goto('/demo');
  const slips = page.locator('button[data-meal]');
  await expect(slips).toHaveCount(15);
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const result = await (window as Window & { axe: typeof axe }).axe.run('.meal-board', {
      runOnly: { type: 'rule', values: ['label-content-name-mismatch'] }
    });
    return result.violations;
  });
  expect(violations).toEqual([]);
});

test('@regression:all populated meal-slip names contain visible text in order', async ({ page }) => {
  await page.goto('/demo');
  const slips = page.locator('button[data-meal]');
  await expect(slips).toHaveCount(15);
  for (let index = 0; index < await slips.count(); index += 1) {
    const slip = slips.nth(index);
    const visibleText = await slip.locator('.slip-top, strong, .prep').allInnerTexts();
    await expect(slip).toHaveAccessibleName(`${visibleText.join(' ')} Edit meal`);
  }
});

test('@regression:cancel and close dismiss an invalid meal form with pointer input at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Meal name')).toBeFocused();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByRole('button', { name: 'Close meal form' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

const dialogSchemes: ('light' | 'dark')[] = ['light', 'dark'];
for (const colorScheme of dialogSchemes) {
  test.describe(`meal dialog ${colorScheme} accessibility`, () => {
    test.use({ colorScheme });
    test(`@regression:open meal dialog has no serious or critical axe violations in ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/demo');
      await page.getByRole('button', { name: 'Add a meal' }).click();
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => {
        const result = await (window as Window & { axe: typeof axe }).axe.run('#meal-dialog', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
        return result.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
      });
      expect(violations).toEqual([]);
      const tooSmall = await page.locator('#meal-dialog input:not([type="hidden"]), #meal-dialog select, #meal-dialog textarea, #meal-dialog button').evaluateAll(elements => elements.map(element => {
        const box = element.getBoundingClientRect();
        return { name: element.getAttribute('aria-label') || element.getAttribute('name') || element.tagName, width: box.width, height: box.height };
      }).filter(target => target.width < 44 || target.height < 44));
      expect(tooSmall).toEqual([]);
    });
  });
}

test('@regression:route navigation focuses and announces the destination h1', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your meal plan stays on this device' })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Your meal plan stays on this device');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Plan meals for each person' })).toBeFocused();
});

test('@regression:each route has its own title, description, and canonical URL', async ({ page }) => {
  const routes = [
    { route: '/', title: 'Family Meal Lanes — plan meals by person' },
    { route: '/demo', title: 'Demo — Family Meal Lanes' },
    { route: '/privacy', title: 'Privacy — Family Meal Lanes' },
    { route: '/terms', title: 'Terms — Family Meal Lanes' }
  ];
  for (const { route, title } of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://family-meal-lanes.sociobot.in${route}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://family-meal-lanes.sociobot.in${route === '/' ? '/' : route}`);
  }
});

test('@regression:legal Board links open the board', async ({ page }) => {
  await page.goto('/privacy');
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Board' }).click();
  await expect(page).toHaveURL(/\/#board$/);
  await expect(page.getByRole('heading', { name: 'Who eats what' })).toBeVisible();
});

test('@regression:direct 404 has the site skeleton, metadata, legal links, and CSP-clean styling', async ({ page }) => {
  const notFound = await readFile(resolve(process.cwd(), 'public/404.html'), 'utf8');
  const consoleErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.route('**/not-a-page', route => route.fulfill({
    status: 404,
    contentType: 'text/html',
    headers: { 'Content-Security-Policy': "default-src 'self'; style-src 'self'" },
    body: notFound
  }));
  const response = await page.goto('/not-a-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main');
  await expect(page.getByRole('link', { name: 'Privacy' }).last()).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://family-meal-lanes.sociobot.in/404.html');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /not found/i);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href', '/404.css');
  expect(await page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor)).toBe('rgb(255, 247, 232)');
  expect(consoleErrors.filter(message => /Content Security Policy|inline style/i.test(message))).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth)).toBe(true);
  const tooSmall = await page.locator('a').evaluateAll(elements => elements.filter(element => {
    const box = element.getBoundingClientRect();
    return getComputedStyle(element).visibility !== 'hidden' && box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
  }).map(element => element.textContent?.trim()));
  expect(tooSmall).toEqual([]);
});

test('@regression:in-app unknown routes use a real not-found title and recovery page', async ({ page }) => {
  await page.goto('/unknown-preview-route');
  await expect(page).toHaveTitle('Page not found — Family Meal Lanes');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://family-meal-lanes.sociobot.in/404.html');
  await expect(page.getByRole('link', { name: 'Go to the meal board' })).toHaveAttribute('href', '/');
});

test('@claim:named-lanes saves a named lane through reload and offers it for shared meals', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage people' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  await page.locator('input[name="lane-name"]').last().fill('Ari');
  await page.getByRole('button', { name: 'Save people' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Ari' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Manage people' }).click();
  await expect(page.locator('input[name="lane-name"]').last()).toHaveValue('Ari');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await expect(page.locator('#meal-dialog select[name="laneId"]')).toContainText('Ari');
  await expect(page.locator('#meal-dialog').getByRole('checkbox', { name: 'Ari' })).toBeVisible();
});

test('@regression:build uses immutable hashed assets and real route rewrites', async () => {
  const dist = resolve(process.cwd(), 'dist');
  const index = await readFile(resolve(dist, 'index.html'), 'utf8');
  const worker = await readFile(resolve(dist, 'sw.js'), 'utf8');
  const config = JSON.parse(await readFile(resolve(dist, 'staticwebapp.config.json'), 'utf8')) as { routes: { route: string; headers?: Record<string, string> }[]; navigationFallback?: unknown };
  const asset = index.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0];
  expect(asset).toBeTruthy();
  expect(worker).toContain(asset!);
  expect(worker).toMatch(/const CACHE = 'family-meal-lanes-[a-f0-9]{12}'/);
  expect(config.navigationFallback).toBeUndefined();
  expect(config.routes.find(route => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
  expect(config.routes.map(route => route.route)).toEqual(expect.arrayContaining(['/demo', '/privacy', '/terms']));
});

test('@claim:paid-unlock offers a truthful hosted $12 checkout', async ({ page, request }) => {
  await page.goto('/');
  const checkout = page.getByRole('link', { name: 'Buy unlimited lanes for $12' });
  await expect(checkout).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout');
  const response = await request.get('https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout', { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
});

async function addPeople(page: import('@playwright/test').Page, names: string[]) {
  await page.getByRole('button', { name: 'Manage people' }).click();
  for (const name of names) {
    await page.getByRole('button', { name: 'Add person' }).click();
    await page.locator('input[name="lane-name"]').last().fill(name);
  }
  await page.getByRole('button', { name: 'Save people' }).click();
  await expect(page.getByRole('rowheader', { name: names.at(-1)! })).toBeVisible();
}

test('@claim:free-lane-limit keeps the visible free limit explanation in the people dialog', async ({ page }) => {
  await page.goto('/');
  await addPeople(page, ['Ari', 'Bee', 'Cam']);
  await page.getByRole('button', { name: 'Manage people' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-lane-limit]')).toHaveText('The free plan includes Shared plus three people. Restore a license or buy unlimited lanes to add another person.');
});

test('@claim:paid-unlimited-lanes a valid license permits a fifth lane', async ({ page }) => {
  let verifyRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?**', async route => {
    verifyRequests += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/');
  await addPeople(page, ['Ari', 'Bee', 'Cam']);
  await page.getByLabel('Have a license?').fill('valid-token');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('Your unlimited-lanes license is active.')).toBeVisible();
  await expect.poll(() => verifyRequests).toBe(1);
  await addPeople(page, ['Dana']);
  await expect(page.getByRole('rowheader', { name: 'Dana' })).toBeVisible();
});

test('@claim:license-invalid-cache relocks lanes and does not verify again within a day', async ({ page }) => {
  let verifyRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?**', async route => {
    verifyRequests += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) });
  });
  await page.goto('/');
  await page.getByLabel('Have a license?').fill('revoked-token');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('This license is not active. You can buy unlimited lanes or restore another license.')).toBeVisible();
  await expect.poll(() => verifyRequests).toBe(1);
  await page.reload();
  await expect(page.getByText('This license is not active. You can buy unlimited lanes or restore another license.')).toBeVisible();
  expect(verifyRequests).toBe(1);
  await addPeople(page, ['Ari', 'Bee', 'Cam']);
  await page.getByRole('button', { name: 'Manage people' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  await expect(page.locator('[data-lane-limit]')).toContainText('free plan includes Shared plus three people');
});

test('@claim:license-request-privacy sends only a token to Sociobot', async ({ page }) => {
  const observed: { method: string; url: string; body: string | null }[] = [];
  await page.route('https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?**', async route => {
    const request = route.request();
    observed.push({ method: request.method(), url: request.url(), body: request.postData() });
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Private family dinner');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByText('Private family dinner').first()).toBeVisible();
  await page.getByLabel('Have a license?').fill('private-token');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect.poll(() => observed).toHaveLength(1);
  expect(observed[0]).toEqual({ method: 'GET', url: 'https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?license=private-token', body: null });
  expect(JSON.stringify(observed)).not.toContain('Private family dinner');
});
