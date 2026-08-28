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
