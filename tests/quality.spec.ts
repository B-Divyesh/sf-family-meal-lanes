import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

for (const route of ['/', '/demo', '/privacy', '/terms']) {
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
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
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
  await page.locator('article[aria-label="Edit Lemon chicken tray bake for Shared"]').focus();
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
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
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
});

test('@regression:route navigation focuses and announces the destination h1', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your meal plan stays on this device' })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Your meal plan stays on this device');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Plan meals by person, not guesswork' })).toBeFocused();
});

test('@regression:direct 404 is styled with a self-hosted stylesheet and is CSP clean', async ({ page }) => {
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
  await expect(page.getByRole('heading', { name: 'This paper slip is missing.' })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href', '/404.css');
  expect(await page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor)).toBe('rgb(255, 247, 232)');
  expect(consoleErrors.filter(message => /Content Security Policy|inline style/i.test(message))).toEqual([]);
});

test('@claim:named-lanes saves a named lane through reload and offers it for shared meals', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  await page.locator('input[name="lane-name"]').last().fill('Ari');
  await page.getByRole('button', { name: 'Save people' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Ari' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
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
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
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
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
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
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
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
