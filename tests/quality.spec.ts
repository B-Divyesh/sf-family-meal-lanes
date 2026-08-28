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

test('@regression:unavailable checkout is not advertised', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/\$12|Buy unlimited lanes|license/i)).toHaveCount(0);
  await expect(page.locator('a[href*="api.sociobot.in"]')).toHaveCount(0);
});
