import { expect, test } from '@playwright/test';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test.describe.configure({ mode: 'serial' });

async function prepareOfflineReload(page: import('@playwright/test').Page) {
  await page.goto('/demo');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.state === 'activated';
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(async () => {
    const appScript = document.querySelector<HTMLScriptElement>('script[type="module"]')?.src;
    return Boolean(appScript && await caches.match(appScript) && await caches.match('/index.html'));
  });
  await expect(page.getByRole('heading', { name: 'Try a filled meal week' })).toBeVisible();
}

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await prepareOfflineReload(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Try a filled meal week' })).toBeVisible();
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
});

test('@claim:demo-sandbox sample data is separate and discarded when starting for real', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeInViewport();
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Demo persistence probe');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByText('Demo persistence probe').first()).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo persistence probe')).toHaveCount(0);
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Demo exit probe');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Who eats what' })).toBeVisible();
  await expect(page.getByText('Lemon chicken tray bake')).toHaveCount(0);
  await page.goto('/demo');
  await expect(page.getByText('Demo persistence probe')).toHaveCount(0);
  await expect(page.getByText('Demo exit probe')).toHaveCount(0);
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
});

test('@claim:sample-six-meals opens the demo with exactly six distinct sample meals', async ({ page }) => {
  await page.goto('/?demo=1');
  const mealIds = await page.locator('button[data-meal]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('data-meal')))]);
  expect(mealIds).toHaveLength(6);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:json-export exports the visible meal plan as JSON', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const file = await download;
  const content = await file.createReadStream();
  let body = '';
  for await (const chunk of content!) body += chunk.toString();
  const exported = JSON.parse(body);
  expect(exported.plan.meals).toHaveLength(6);
  expect(exported.plan.meals[0].title).toBe('Lemon chicken tray bake');
});

test('@claim:json-import-safety imports a complete plan and rejects an incomplete replacement', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('/demo');
  await page.locator('input[type=file]').setInputFiles({
    name: 'complete-plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, plan: {
      lanes: [{ id: 'shared', name: 'Shared', color: 'blue' }],
      meals: [{ id: 'imported-1', day: 4, laneId: 'shared', title: 'Imported tomato soup', prep: 'Buy basil', sharedWith: [], note: 'Serve with toast.', createdAt: '2026-08-28T08:00:00.000Z' }],
      weekOf: '2026-08-24'
    }}))
  });
  await expect(page.getByText('Imported tomato soup').first()).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({
    name: 'broken-plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"lanes":[{"id":"shared","name":"Shared","color":"blue"}],"meals":[{"id":"bad","day":0,"laneId":"missing","title":"broken"}],"weekOf":"2026-08-24"}')
  });
  await expect(page.getByText('That file is not a complete Family Meal Lanes plan. Your current plan is unchanged.')).toBeVisible();
  await expect(page.getByText('Imported tomato soup').first()).toBeVisible();
  expect(pageErrors).toEqual([]);
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

test('@claim:shared-lanes shows a shared meal in every selected lane', async ({ page }) => {
  await page.goto('/demo');
  for (const lane of ['Shared', 'Mara', 'Jon', 'Kids']) {
    const row = page.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: lane }) });
    await expect(row.locator('button[data-meal="m1"]')).toBeVisible();
  }
});

test('@claim:prep-labels shows prep labels on meal slips', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('button[data-meal="m1"]').first().locator('.prep')).toHaveText('Prep: Chop vegetables');
});

test('@claim:print-plan prints the weekly meal board', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'print', { configurable: true, value: () => { document.documentElement.dataset.printed = 'true'; } });
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Print this weekly meal plan' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-printed', 'true');
});

test('@claim:free-export-import-print keeps all transfer tools available without a license', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'print', { configurable: true, value: () => { document.documentElement.dataset.printed = 'true'; } });
  });
  await page.goto('/');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:family-meal-lanes'))).toBeNull();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Free plan soup');
  await page.getByRole('button', { name: 'Save meal' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const exportedFile = await download;
  const stream = await exportedFile.createReadStream();
  let exportedBody = '';
  for await (const chunk of stream!) exportedBody += chunk.toString();
  expect(JSON.parse(exportedBody).plan.meals[0].title).toBe('Free plan soup');
  await page.locator('input[type=file]').setInputFiles({
    name: 'free-plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, plan: {
      lanes: [{ id: 'shared', name: 'Shared', color: 'blue' }],
      meals: [{ id: 'free-import', day: 1, laneId: 'shared', title: 'Free imported pasta', prep: '', sharedWith: [], note: '', createdAt: '2026-08-28T08:00:00.000Z' }],
      weekOf: '2026-08-24'
    }}))
  });
  await expect(page.getByText('Free imported pasta').first()).toBeVisible();
  await page.getByRole('button', { name: 'Print this weekly meal plan' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-printed', 'true');
});

test('@regression:undo-delete gives the promised recovery action', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('button[data-meal="m1"]').first().press('Enter');
  await page.getByRole('button', { name: 'Delete meal' }).click();
  await expect(page.getByRole('status')).toContainText('Meal removed.');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText('Lemon chicken tray bake').first()).toBeVisible();
});

test('@regression:service-worker-update installs a waiting worker and reloads the updated app asset', async ({ page }) => {
  const dist = resolve(process.cwd(), 'dist');
  const workerPath = resolve(dist, 'sw.js');
  const indexPath = resolve(dist, 'index.html');
  const originalWorker = await readFile(workerPath, 'utf8');
  const originalIndex = await readFile(indexPath, 'utf8');
  const scriptMatch = originalIndex.match(/src="(\/assets\/[^"]+\.js)"/);
  expect(scriptMatch).not.toBeNull();
  const originalAsset = scriptMatch![1];
  const testAsset = '/assets/update-regression.js';
  const testAssetPath = resolve(dist, `.${testAsset}`);

  try {
    await prepareOfflineReload(page);
    await writeFile(testAssetPath, `${await readFile(resolve(dist, `.${originalAsset}`), 'utf8')}\nwindow.__familyMealLanesUpdatedAsset = true;\n`);
    await writeFile(indexPath, originalIndex.replace(originalAsset, testAsset));
    const nextWorker = originalWorker
      .replace(/family-meal-lanes-[a-f0-9]+/, `family-meal-lanes-update-${Date.now()}`)
      .replace('const SHELL = [', `const SHELL = ["${testAsset}",`);
    await writeFile(workerPath, nextWorker);

    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
    await expect(page.getByText('An updated meal board is ready.')).toBeVisible();
    await expect.poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))).toBe(true);
    await page.getByRole('button', { name: 'Update now' }).click();
    await page.waitForFunction(() => Boolean((window as Window & { __familyMealLanesUpdatedAsset?: boolean }).__familyMealLanesUpdatedAsset));
  } finally {
    await writeFile(workerPath, originalWorker);
    await writeFile(indexPath, originalIndex);
    await unlink(testAssetPath).catch(() => undefined);
  }
});
