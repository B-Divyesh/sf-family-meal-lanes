import { test, expect } from '@playwright/test';

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(async () => Boolean(await caches.match(new URL('/assets/app.js', location.origin).href)));
  await page.waitForTimeout(750);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Plan meals by person, not guesswork' })).toBeVisible();
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
});

test('@claim:demo-sandbox sample data stays separate from a new plan', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Who eats what' })).toBeVisible();
  await expect(page.getByText('Lemon chicken tray bake')).toHaveCount(0);
});

test('@claim:json-export exports the visible meal plan as JSON', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export this weekly meal plan as JSON' }).click();
  const file = await download;
  const content = await file.createReadStream();
  let body = '';
  for await (const chunk of content!) body += chunk.toString();
  const exported = JSON.parse(body);
  expect(exported.plan.meals).toHaveLength(6);
  expect(exported.plan.meals[0].title).toBe('Lemon chicken tray bake');
});

test('@claim:local-only sends no meal plan data away from this device', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Test toast');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByText('Test toast')).toBeVisible();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:paid-unlock offers the hosted $12 unlimited-lanes checkout', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Buy unlimited lanes for $12' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout');
});
