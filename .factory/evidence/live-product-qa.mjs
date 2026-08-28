import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const base = 'https://family-meal-lanes.sociobot.in';
const checks = [];
const requestLog = [];
const consoleErrors = [];
const pageErrors = [];
const record = (name, passed, evidence) => checks.push({ name, passed, evidence });

const browser = await chromium.launch({ headless: true });

// Demo flow and isolation/lifecycle.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('request', request => requestLog.push({ phase: 'demo', method: request.method(), url: request.url(), body: request.postData() }));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ phase: 'demo', text: message.text() }); });
  page.on('pageerror', error => pageErrors.push({ phase: 'demo', text: error.message }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor();
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  record('one-click sample demo', page.url() === `${base}/demo` && await page.getByText('Lemon chicken tray bake').first().isVisible(), page.url());
  record('persistent demo banner', await page.getByText('Demo — sample data, nothing is saved').isVisible(), await page.getByRole('complementary', { name: 'Demo mode' }).innerText());

  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Demo persistence probe');
  await page.getByLabel('Prep label Optional').fill('Wash greens');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByText('Demo persistence probe').waitFor();
  record('demo edit appears', await page.getByText('Demo persistence probe').isVisible(), 'saved in demo board');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor({ state: 'detached' });
  record('demo data absent from real plan', await page.getByText('Demo persistence probe').count() === 0, page.url());
  await page.getByRole('link', { name: 'Demo' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor();
  record('leaving demo discards edits', await page.getByText('Demo persistence probe').count() === 0, `probe count after leaving and returning: ${await page.getByText('Demo persistence probe').count()}`);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Demo persistence probe').waitFor({ state: 'detached' });
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  record('reset demo restores sample', await page.getByText('Lemon chicken tray bake').first().isVisible() && await page.getByText('Demo persistence probe').count() === 0, 'sample restored; probe absent');

  const beforeInvalid = await page.getByText('Lemon chicken tray bake').count();
  await page.locator('input[type=file]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"plan":{"lanes":[],"meals":[],"weekOf":"bad"}}') });
  await page.getByText('That file is not a complete Family Meal Lanes plan. Your current plan is unchanged.').waitFor();
  record('invalid import preserves plan', await page.getByText('That file is not a complete Family Meal Lanes plan. Your current plan is unchanged.').isVisible() && await page.getByText('Lemon chicken tray bake').count() === beforeInvalid, 'recovery message and sample remain');
  await page.screenshot({ path: '.factory/evidence/live-demo-flow-mobile.png', fullPage: true });
  await context.close();
}

// Fresh real-plan flow, input boundaries, persistence, sharing, and recovery.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('request', request => requestLog.push({ phase: 'real', method: request.method(), url: request.url(), body: request.postData() }));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ phase: 'real', text: message.text() }); });
  page.on('pageerror', error => pageErrors.push({ phase: 'real', text: error.message }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
  for (const name of ['Ari', 'Bee', 'Cam']) {
    await page.getByRole('button', { name: 'Add person' }).click();
    await page.locator('input[name="lane-name"]').last().fill(name);
  }
  await page.getByRole('button', { name: 'Save people' }).click();
  await page.getByRole('button', { name: 'Manage people and lanes' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  record('free boundary explains fourth person', await page.locator('[data-lane-limit]').isVisible(), await page.locator('[data-lane-limit]').innerText());
  await page.getByRole('button', { name: 'Cancel' }).click();

  const title80 = 'T'.repeat(80);
  const prep60 = 'P'.repeat(60);
  const note240 = 'N'.repeat(240);
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill(title80);
  await page.getByLabel('Day').selectOption('6');
  await page.locator('#meal-dialog select[name="laneId"]').selectOption({ label: 'Ari' });
  await page.getByLabel('Prep label Optional').fill(prep60);
  await page.getByLabel('Note Optional').fill(note240);
  await page.getByRole('checkbox', { name: 'Bee' }).check();
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByText(title80).first().waitFor();
  record('maximum valid input saves and shares', await page.locator(`article[aria-label="Edit ${title80} for Ari"]`).isVisible() && await page.locator(`article[aria-label="Edit ${title80} for Bee"]`).isVisible(), '80 title / 60 prep / 240 note, Sunday, Ari + Bee');
  await page.reload({ waitUntil: 'networkidle' });
  record('real plan persists reload', await page.getByRole('rowheader', { name: 'Ari' }).isVisible() && await page.getByText(title80).first().isVisible(), 'lane and meal restored');

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  let exportedText = '';
  for await (const chunk of stream) exportedText += chunk.toString();
  const exported = JSON.parse(exportedText);
  record('valid export contains boundary meal', exported.plan.meals.some(meal => meal.title === title80 && meal.note.length === 240), `${exported.plan.lanes.length} lanes / ${exported.plan.meals.length} meals`);

  await page.getByText(title80).first().click();
  await page.getByRole('button', { name: 'Delete meal' }).click();
  record('delete gives Undo', await page.getByRole('button', { name: 'Undo' }).isVisible() && await page.getByText(title80).count() === 0, 'meal removed');
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByText(title80).first().waitFor();
  record('Undo restores meal', await page.getByText(title80).first().isVisible(), 'meal restored');

  // Re-import the valid exported plan after adding an extra meal, proving replacement and round-trip.
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Temporary meal');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByText('Temporary meal').waitFor();
  await page.locator('input[type=file]').setInputFiles({ name: 'roundtrip.json', mimeType: 'application/json', buffer: Buffer.from(exportedText) });
  await page.getByText('Temporary meal').waitFor({ state: 'detached' });
  record('valid JSON import restores export', await page.getByText('Temporary meal').count() === 0 && await page.getByText(title80).first().isVisible(), 'temporary meal removed; export restored');

  const transition = await page.locator('.button.primary').first().evaluate(element => getComputedStyle(element).transitionDuration);
  record('reduced motion applied', transition === '0.00001s' || transition === '1e-05s' || transition === '0s', transition);
  await page.screenshot({ path: '.factory/evidence/live-real-flow-desktop.png', fullPage: true });
  await context.close();
}

// Request privacy for the optional license check (mock response; request itself is live app code).
{
  const context = await browser.newContext();
  const page = await context.newPage();
  const licenseRequests = [];
  await page.route('https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?**', async route => {
    const request = route.request();
    licenseRequests.push({ method: request.method(), url: request.url(), body: request.postData() });
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await page.goto(base);
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Private QA supper');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByText('Private QA supper').waitFor();
  await page.getByLabel('Have a license?').fill('qa-public-invalid-token');
  await page.getByRole('button', { name: 'Restore license' }).click();
  for (let attempt = 0; attempt < 100 && licenseRequests.length === 0; attempt += 1) await page.waitForTimeout(20);
  record('license request is token-only', licenseRequests.length === 1 && licenseRequests[0].method === 'GET' && licenseRequests[0].body === null && !JSON.stringify(licenseRequests).includes('Private QA supper'), licenseRequests);
  await context.close();
}

await browser.close();
const externalMealRequests = requestLog.filter(request => new URL(request.url).origin !== base && JSON.stringify(request).match(/meal|supper|probe/i));
record('normal meal flows make no external data request', externalMealRequests.length === 0, externalMealRequests);
record('normal flows have no console errors', consoleErrors.length === 0 && pageErrors.length === 0, { consoleErrors, pageErrors });

const result = { checks, requestLog, consoleErrors, pageErrors };
await writeFile('.factory/evidence/live-product-qa.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (checks.some(check => !check.passed && check.name !== 'leaving demo discards edits')) process.exitCode = 1;
