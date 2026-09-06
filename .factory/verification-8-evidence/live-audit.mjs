import { chromium } from '@playwright/test';
import axe from 'axe-core';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const base = 'https://family-meal-lanes.sociobot.in';
const builtRoot = '/tmp/family-meal-lanes-verify-8-FbZ8sw/dist';
const output = '.factory/verification-8-evidence/live-audit.json';
const results = { checks: [], routes: [], axe: [], requests: [], errors: [], hashes: [] };
const check = (name, passed, evidence) => results.checks.push({ name, passed: Boolean(passed), evidence });
const browser = await chromium.launch({ headless: true });

async function tapCenter(locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Control has no bounding box');
  await locator.page().mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

function watch(page, phase, allow404 = false) {
  page.on('console', message => {
    if (message.type() !== 'error') return;
    if (allow404 && /Failed to load resource: the server responded with a status of 404/i.test(message.text())) return;
    results.errors.push({ phase, type: 'console', text: message.text() });
  });
  page.on('pageerror', error => results.errors.push({ phase, type: 'pageerror', text: error.message }));
}

const routeExpectations = [
  ['/', 200, 'Family Meal Lanes — plan meals by person', 'Plan meals for each person'],
  ['/demo', 200, 'Demo — Family Meal Lanes', 'Try a filled meal week'],
  ['/privacy', 200, 'Privacy — Family Meal Lanes', 'Your meal plan stays on this device'],
  ['/terms', 200, 'Terms — Family Meal Lanes', 'Terms for using this meal board'],
  ['/missing-verification-8', 404, 'Page not found — Family Meal Lanes', 'Page not found']
];

// Cold route, metadata, skeleton, link and mobile layout checks.
for (const [path, status, title, heading] of routeExpectations) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  watch(page, `route:${path}`, status === 404);
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const route = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1Count: document.querySelectorAll('h1').length,
    h1: document.querySelector('h1')?.textContent?.trim(),
    header: Boolean(document.querySelector('header')),
    nav: Boolean(document.querySelector('nav')),
    main: Boolean(document.querySelector('main')),
    footer: Boolean(document.querySelector('footer')),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    smallTargets: [...document.querySelectorAll('a,button,input:not([type="file"]),select,textarea,[role="button"],[tabindex="0"]')]
      .filter(element => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0 && box.bottom >= 0;
      })
      .map(element => {
        const box = element.getBoundingClientRect();
        return { name: element.getAttribute('aria-label') || element.textContent?.trim(), width: box.width, height: box.height };
      }).filter(item => item.width < 44 || item.height < 44)
  }));
  const observed = { path, status: response?.status(), ...route };
  results.routes.push(observed);
  check(`route ${path} structure and metadata`, response?.status() === status && route.title === title && route.h1 === heading && route.h1Count === 1 && route.lang === 'en' && route.header && route.nav && route.main && route.footer && Boolean(route.description) && route.twitterImage === `${base}/social-card.webp`, observed);
  check(`route ${path} mobile fit and targets`, !route.overflow && route.smallTargets.length === 0, { overflow: route.overflow, smallTargets: route.smallTargets });
  if (path === '/') await page.screenshot({ path: '.factory/verification-8-evidence/first-read-phone.png', fullPage: false });
  if (path === '/demo') await page.screenshot({ path: '.factory/verification-8-evidence/demo-phone.png', fullPage: false });
  if (status === 404) await page.screenshot({ path: '.factory/verification-8-evidence/404-phone.png', fullPage: false });
  await context.close();
}

// First read before scrolling, at desktop and phone sizes.
for (const [label, viewport] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  watch(page, `first-read:${label}`);
  await page.goto(base, { waitUntil: 'networkidle' });
  const h1 = page.getByRole('heading', { level: 1, name: 'Plan meals for each person' });
  const audience = page.getByText('For households with different meals, so everyone can see what is theirs and what they share.');
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const resultCopy = page.getByText('See a filled week. Nothing is saved.');
  const visible = await Promise.all([h1, audience, action, resultCopy].map(locator => locator.isVisible()));
  const inViewport = await Promise.all([h1, audience, action, resultCopy].map(locator => locator.evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= window.innerHeight;
  })));
  check(`${label} first read before scroll`, visible.every(Boolean) && inViewport.every(Boolean), { visible, inViewport, scrollY: await page.evaluate(() => scrollY) });
  if (label === 'desktop') await page.screenshot({ path: '.factory/verification-8-evidence/first-read-desktop.png', fullPage: false });
  await context.close();
}

// Fresh live demo, persistent label, reset, and strict isolation from a real-plan sentinel.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  watch(page, 'demo-isolation');
  page.on('request', request => results.requests.push({ phase: 'demo-isolation', method: request.method(), url: request.url(), body: request.postData() }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill('Real plan sentinel');
  await tapCenter(page.getByRole('button', { name: 'Save meal' }));
  await page.getByText('Real plan sentinel').first().waitFor();
  await page.waitForTimeout(200);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  const banner = page.getByText('Demo — sample data, nothing is saved');
  await banner.waitFor();
  const distinctMeals = await page.locator('button[data-meal]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('data-meal')))]);
  const sharedRows = {};
  for (const lane of ['Shared', 'Mara', 'Jon', 'Kids']) {
    sharedRows[lane] = await page.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: lane }) }).locator('button[data-meal="m1"]').isVisible();
  }
  check('one-click sample is populated and realistic', /\?demo=1$/.test(page.url()) && distinctMeals.length === 6 && Object.values(sharedRows).every(Boolean) && await page.locator('button[data-meal="m1"] .prep').first().getByText('Prep: Chop vegetables').isVisible(), { url: page.url(), distinctMeals, sharedRows });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  check('demo label remains visible while using sample', await banner.isVisible(), await banner.textContent());
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill('Demo reset probe');
  await tapCenter(page.getByRole('button', { name: 'Save meal' }));
  await page.getByText('Demo reset probe').first().waitFor();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Demo reset probe').waitFor({ state: 'detached' });
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  check('Reset demo restores only the sample', await page.getByText('Demo reset probe').count() === 0 && (await page.locator('button[data-meal]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('data-meal')))])).length === 6, 'probe absent; six sample meal ids');
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill('Demo exit probe');
  await tapCenter(page.getByRole('button', { name: 'Save meal' }));
  await page.getByText('Demo exit probe').first().waitFor();
  await page.waitForTimeout(200);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByRole('heading', { level: 1, name: 'Plan meals for each person' }).waitFor();
  const realKept = await page.getByText('Real plan sentinel').first().isVisible();
  const demoAbsent = await page.getByText('Demo exit probe').count() === 0 && await page.getByText('Lemon chicken tray bake').count() === 0;
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const reopenedClean = await page.getByText('Demo exit probe').count() === 0 && await page.getByText('Lemon chicken tray bake').first().isVisible();
  check('demo never changes real-plan data', realKept && demoAbsent && reopenedClean, { realKept, demoAbsent, reopenedClean });
  await context.close();
}

// Normal, invalid, boundary, persistence, export/import, deletion, keyboard, and reduced-motion paths.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  watch(page, 'normal-flow');
  page.on('request', request => results.requests.push({ phase: 'normal-flow', method: request.method(), url: request.url(), body: request.postData() }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Manage people' }).click();
  for (const name of ['Ari', 'Bee', 'Cam']) {
    await page.getByRole('button', { name: 'Add person' }).click();
    await page.locator('input[name="lane-name"]').last().fill(name);
  }
  await page.getByRole('button', { name: 'Save people' }).click();
  await page.getByRole('rowheader', { name: 'Cam' }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  check('named lanes survive reload', await page.getByRole('rowheader', { name: 'Ari' }).isVisible(), 'Ari lane visible after reload');
  await page.getByRole('button', { name: 'Manage people' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  check('free boundary keeps a visible recovery message', await page.getByRole('dialog').isVisible() && await page.locator('[data-lane-limit]').isVisible(), await page.locator('[data-lane-limit]').textContent());
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByRole('button', { name: 'Save meal' }).click();
  const invalidFocused = await page.getByLabel('Meal name').evaluate(element => document.activeElement === element);
  await page.getByRole('button', { name: 'Cancel' }).click();
  check('blank meal is blocked and Cancel recovers', invalidFocused && !(await page.getByRole('dialog').isVisible()), { invalidFocused });
  const title = 'T'.repeat(80);
  const prep = 'P'.repeat(60);
  const note = 'N'.repeat(240);
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill(title);
  await page.getByLabel('Day').selectOption('6');
  await page.locator('#meal-dialog select[name="laneId"]').selectOption({ label: 'Ari' });
  await page.getByLabel('Prep label Optional').fill(prep);
  await page.getByLabel('Note Optional').fill(note);
  await page.getByRole('checkbox', { name: 'Bee' }).check();
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByText(title).first().waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  check('maximum allowed meal fields persist and share', await page.getByText(title).first().isVisible() && await page.getByRole('rowheader', { name: 'Ari' }).isVisible() && await page.getByRole('rowheader', { name: 'Bee' }).isVisible(), '80-character title, 60-character prep, 240-character note, Sunday, Ari and Bee');
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const stream = await (await downloadReady).createReadStream();
  let exportedText = '';
  for await (const chunk of stream) exportedText += chunk.toString();
  const exported = JSON.parse(exportedText);
  check('JSON export is complete', exported.plan.meals.some(meal => meal.title === title && meal.prep.length === 60 && meal.note.length === 240), { lanes: exported.plan.lanes.length, meals: exported.plan.meals.length });
  await page.getByText(title).first().click();
  await page.getByRole('button', { name: 'Delete meal' }).click();
  await page.getByRole('button', { name: 'Undo' }).waitFor();
  const undoVisible = await page.getByRole('button', { name: 'Undo' }).isVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByText(title).first().waitFor();
  check('delete offers working Undo', undoVisible && await page.getByText(title).first().isVisible(), { undoVisible });
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill('Temporary meal');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByText('Temporary meal').first().waitFor();
  await page.locator('input[type="file"]').setInputFiles({ name: 'roundtrip.json', mimeType: 'application/json', buffer: Buffer.from(exportedText) });
  await page.getByText('Temporary meal').waitFor({ state: 'detached' });
  const validImported = await page.getByText('Temporary meal').count() === 0 && await page.getByText(title).first().isVisible();
  await page.locator('input[type="file"]').setInputFiles({ name: 'incomplete.json', mimeType: 'application/json', buffer: Buffer.from('{"lanes":[],"meals":[],"weekOf":"bad"}') });
  await page.getByText('That file is not a complete Family Meal Lanes plan. Your current plan is unchanged.').waitFor();
  const invalidMessage = await page.getByText('That file is not a complete Family Meal Lanes plan. Your current plan is unchanged.').isVisible();
  check('valid import replaces and invalid import preserves', validImported && invalidMessage && await page.getByText(title).first().isVisible(), { validImported, invalidMessage });
  const duration = await page.locator('.button.primary').first().evaluate(element => getComputedStyle(element).transitionDuration);
  check('reduced motion is respected', ['0s', '0.00001s', '1e-05s'].includes(duration), duration);
  await page.screenshot({ path: '.factory/verification-8-evidence/normal-flow-desktop.png', fullPage: true });
  await context.close();
}

// Keyboard focus order, route focus, and dialog focus management.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  watch(page, 'keyboard');
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outline }));
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => location.hash === '#main');
  await page.waitForTimeout(150);
  const skipTarget = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
  const slip = page.locator('button[data-meal="m1"]').first();
  await slip.waitFor();
  await slip.focus();
  await slip.press('Enter');
  await page.getByRole('dialog').waitFor();
  const dialogFocus = await page.getByLabel('Meal name').evaluate(element => document.activeElement === element);
  await page.keyboard.press('Escape');
  const focusReturned = await slip.evaluate(element => document.activeElement === element);
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await page.waitForFunction(() => location.pathname === '/privacy' && document.activeElement?.tagName === 'H1');
  const routeFocus = await page.getByRole('heading', { level: 1, name: 'Your meal plan stays on this device' }).evaluate(element => document.activeElement === element);
  const announcement = await page.locator('#route-announcer').textContent();
  await page.goBack();
  await page.waitForFunction(() => location.pathname === '/demo' && document.activeElement?.tagName === 'H1');
  const backFocus = await page.getByRole('heading', { level: 1, name: 'Try a filled meal week' }).evaluate(element => document.activeElement === element);
  check('keyboard, skip link, dialog, and route focus work', firstTab.text === 'Skip to meal plan' && firstTab.outline !== 'none' && ['MAIN', 'H1'].includes(skipTarget.tag) && dialogFocus && focusReturned && routeFocus && backFocus && announcement === 'Your meal plan stays on this device', { firstTab, skipTarget, dialogFocus, focusReturned, routeFocus, backFocus, announcement });
  await context.close();
}

// 200% text reflow and paid controls on the exact regression viewport.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  watch(page, 'text-200');
  await page.route('https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const controls = [page.getByRole('link', { name: 'Buy unlimited lanes for $12' }), page.getByLabel('Have a license?'), page.getByRole('button', { name: 'Restore license' })];
  const boxes = [];
  let focusable = true;
  for (const control of controls) {
    const box = await control.boundingBox();
    boxes.push(box);
    await control.focus();
    focusable &&= await control.evaluate(element => document.activeElement === element);
  }
  const widths = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, document: document.documentElement.scrollWidth }));
  await page.getByLabel('Have a license?').fill('verification-8-test-token');
  await page.getByRole('button', { name: 'Restore license' }).click();
  const restored = await page.getByText('Your unlimited-lanes license is active.').isVisible();
  check('390px phone reflows at 200% text', widths.body === 390 && widths.document === 390 && boxes.every(box => box && box.x >= 0 && box.x + box.width <= 390) && focusable && restored, { widths, boxes, focusable, restored });
  await page.screenshot({ path: '.factory/verification-8-evidence/text-200-phone.png', fullPage: true });
  await context.close();
}

// Independent WCAG scans, including populated board label-in-name and open dialogs.
for (const colorScheme of ['light', 'dark']) {
  for (const [path] of routeExpectations) {
    const context = await browser.newContext({ colorScheme, viewport: { width: 390, height: 844 }, bypassCSP: true });
    await context.addInitScript({ content: axe.source });
    const page = await context.newPage();
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.filter(item => item.impact === 'serious' || item.impact === 'critical').map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
    results.axe.push({ colorScheme, path, state: 'page', violations });
    if (path === '/demo') {
      const labelViolations = await page.evaluate(async () => (await window.axe.run('.meal-board', { runOnly: { type: 'rule', values: ['label-content-name-mismatch'] } })).violations.map(item => ({ id: item.id, nodes: item.nodes.length })));
      results.axe.push({ colorScheme, path, state: 'populated labels', violations: labelViolations });
      await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
      const dialogViolations = await page.evaluate(async () => (await window.axe.run('#meal-dialog', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.filter(item => item.impact === 'serious' || item.impact === 'critical').map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
      results.axe.push({ colorScheme, path, state: 'meal dialog', violations: dialogViolations });
    }
    await context.close();
  }
}
check('axe scans are clean', results.axe.every(scan => scan.violations.length === 0), results.axe);

// Fresh service-worker context and offline reload.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  watch(page, 'offline');
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cachesBefore = await page.evaluate(() => caches.keys());
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  const offline = { controlled: await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), banner: await page.getByText('Demo — sample data, nothing is saved').isVisible(), sample: await page.getByText('Lemon chicken tray bake').first().isVisible(), cachesBefore };
  check('fresh demo reloads offline', offline.controlled && offline.banner && offline.sample && offline.cachesBefore.some(name => name.startsWith('family-meal-lanes-')), offline);
  await page.screenshot({ path: '.factory/verification-8-evidence/offline-phone.png', fullPage: false });
  await context.close();
}

// Crawl all product links and inspect the hosted checkout redirect.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  const hrefs = new Set();
  for (const path of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    for (const href of await page.locator('a[href]').evaluateAll(elements => elements.map(element => element.href))) hrefs.add(href);
  }
  const crawled = [];
  for (const href of hrefs) {
    if (href.startsWith(`${base}/`)) {
      const response = await context.request.get(href, { maxRedirects: 0 });
      crawled.push({ href, status: response.status() });
    }
  }
  const checkout = await context.request.get('https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout', { maxRedirects: 0 });
  const checkoutLocation = checkout.headers().location || '';
  const checkoutEvidence = { status: checkout.status(), destination: checkoutLocation ? `${new URL(checkoutLocation).origin}/session/[redacted]` : null };
  check('internal links and hosted checkout work', crawled.every(item => item.status === 200) && checkoutEvidence.status === 303 && /^https:\/\/checkout\.dodopayments\.com\/session\//.test(checkoutLocation), { crawled, checkout: checkoutEvidence });
  await context.close();
}

// Manifest/icon and live-to-candidate identity checks.
{
  const manifestResponse = await fetch(`${base}/manifest.webmanifest`);
  const manifest = await manifestResponse.json();
  const iconStatuses = [];
  for (const icon of manifest.icons) iconStatuses.push({ src: icon.src, status: (await fetch(`${base}${icon.src}`)).status, sizes: icon.sizes, purpose: icon.purpose || '' });
  check('manifest and install icons are complete', manifestResponse.status === 200 && manifest.display === 'standalone' && manifest.start_url.includes('?v=') && iconStatuses.some(icon => icon.sizes === '192x192' && icon.status === 200) && iconStatuses.some(icon => icon.sizes === '512x512' && icon.status === 200 && icon.purpose.includes('maskable')), { manifest, iconStatuses });
  const index = await readFile(`${builtRoot}/index.html`);
  const indexText = index.toString();
  const assets = ['index.html', 'sw.js', 'manifest.webmanifest', '404.html', '404.css', 'hero-risograph.webp', ...(indexText.match(/\/assets\/[^"']+\.(?:js|css)/g) || []).map(path => path.slice(1))];
  for (const asset of assets) {
    const local = await readFile(`${builtRoot}/${asset}`);
    const response = await fetch(`${base}/${asset}`);
    const live = Buffer.from(await response.arrayBuffer());
    const digest = bytes => createHash('sha256').update(bytes).digest('hex');
    results.hashes.push({ asset, status: response.status, local: digest(local), live: digest(live), matches: digest(local) === digest(live) });
  }
  check('live files match implementation candidate', results.hashes.every(item => item.status === 200 && item.matches), results.hashes);
}

const externalNormalRequests = results.requests.filter(request => ['demo-isolation', 'normal-flow'].includes(request.phase) && new URL(request.url).origin !== base);
check('normal meal use sends no data to another origin', externalNormalRequests.length === 0, externalNormalRequests);
check('live browser has no unexpected console or page errors', results.errors.length === 0, results.errors);

await browser.close();
results.summary = { total: results.checks.length, passed: results.checks.filter(item => item.passed).length, failed: results.checks.filter(item => !item.passed).length };
await writeFile(output, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.summary));
if (results.summary.failed) process.exitCode = 1;
