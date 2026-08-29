import { chromium, request as playwrightRequest } from '@playwright/test';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://family-meal-lanes.sociobot.in';
const out = '.factory/polish-3-evidence';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
const check = (name, passed, detail) => {
  results.push({ name, passed, detail });
  if (!passed) throw new Error(`${name}: ${detail}`);
};

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', webRequest => requests.push(webRequest.url()));

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  check('F-1-3 first-screen headline', await page.getByRole('heading', { level: 1, name: 'Plan meals for each person' }).isVisible(), page.url());
  check('first-screen audience', await page.getByText('For households with different meals, so everyone can see what is theirs and what they share.').isVisible(), 'audience sentence visible');
  check('first-screen action', await page.getByRole('link', { name: 'Try it with sample data' }).isVisible(), 'primary action visible');
  check('first-screen facts', await page.locator('.facts li').count() === 3, 'three facts visible');
  check('F-1-4 control wording', await page.getByRole('button', { name: 'Manage people', exact: true }).isVisible(), 'visible and accessible names match');
  check('F-1-5 section heading', await page.getByRole('heading', { level: 2, name: 'Plan individual and shared meals' }).isVisible(), page.url());
  check('F-1-6 offline wording', await page.getByText('Works offline after your first visit.').isVisible(), page.url());
  check('F-1-7 prep wording', await page.getByText('Leave a small prep task for later.').isVisible(), page.url());
  check('F-3-2 concrete weekly-board wording', await page.getByText('It shows one weekly meal board on this device.').isVisible(), page.url());
  check('F-3-3 scope-boundary wording', await page.getByText('It does not store recipes, order groceries, score nutrition, or check allergens.').isVisible(), page.url());
  check('F-3-4 public provenance removed', await page.getByText('Original illustration generated for this product.').count() === 0, 'landing footer');
  check('F-3-6 payment roles', await page.getByText('Sociobot opens the payment page. Dodo processes the payment.').isVisible(), page.url());
  check('mobile home fit', await page.locator('body').evaluate(body => body.scrollWidth <= innerWidth), '390x844');
  await page.screenshot({ path: `${out}/live-first-screen-mobile.png`, fullPage: false });
  await page.screenshot({ path: `${out}/live-home-full-mobile.png`, fullPage: true });

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor({ state: 'visible' });
  check('one-click query demo', page.url() === `${base}/?demo=1`, page.url());
  check('demo title', await page.title() === 'Demo — Family Meal Lanes', await page.title());
  check('demo canonical', await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/demo`, 'canonical URL');
  check('demo banner', await page.getByText('Demo — sample data, nothing is saved').isVisible(), page.url());
  check('demo reset and exit actions', await page.getByRole('button', { name: 'Reset demo' }).isVisible() && await page.getByRole('link', { name: 'Start for real' }).isVisible(), 'both actions visible');
  check('sample visible on first screen', await page.getByText('Lemon chicken tray bake').first().evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= innerHeight;
  }), '390x844');
  const ids = await page.locator('button[data-meal]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('data-meal')))]);
  check('F-1-11 six sample meals', ids.length === 6, `${ids.length} distinct meals`);
  await page.screenshot({ path: `${out}/live-demo-after-one-click-mobile.png`, fullPage: false });

  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill('Polish 3 reset probe');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Polish 3 reset probe').waitFor({ state: 'detached' });
  check('demo reset', await page.getByText('Polish 3 reset probe').count() === 0, 'probe removed');
  await page.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await page.getByLabel('Meal name').fill('Polish 3 exit probe');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor({ state: 'detached' });
  check('demo exit isolation', await page.getByText('Polish 3 exit probe').count() === 0 && await page.getByText('Lemon chicken tray bake').count() === 0, 'real store has no demo meals');
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  check('demo reseeds after exit', await page.getByText('Polish 3 exit probe').count() === 0 && await page.getByText('Lemon chicken tray bake').first().isVisible(), 'clean sample restored');
  const databaseNames = await page.evaluate(async () => (await indexedDB.databases()).map(database => database.name).sort());
  check('separate demo and real stores', databaseNames.includes('family-meal-lanes:demo') && databaseNames.includes('family-meal-lanes:real'), JSON.stringify(databaseNames));
  check('demo request privacy', requests.every(url => new URL(url).origin === base), JSON.stringify(requests.filter(url => new URL(url).origin !== base)));
  check('console and page errors', errors.length === 0, JSON.stringify(errors));
  await context.close();

  const workflowContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const workflowPage = await workflowContext.newPage();
  await workflowPage.goto(`${base}/`, { waitUntil: 'networkidle' });
  await workflowPage.getByRole('button', { name: 'Manage people' }).click();
  await workflowPage.getByRole('button', { name: 'Add person' }).click();
  await workflowPage.locator('input[name="lane-name"]').last().fill('Ari');
  await workflowPage.getByRole('button', { name: 'Save people' }).click();
  await workflowPage.getByRole('rowheader', { name: 'Ari' }).waitFor({ state: 'visible' });
  await workflowPage.getByRole('button', { name: 'Add a meal', exact: true }).click();
  await workflowPage.getByLabel('Meal name').fill('Bean chilli');
  await workflowPage.locator('#meal-dialog select[name="day"]').selectOption('1');
  await workflowPage.locator('#meal-dialog select[name="laneId"]').selectOption({ label: 'Ari' });
  await workflowPage.getByRole('button', { name: 'Save meal' }).click();
  let ariRow = workflowPage.locator('tbody tr').filter({ has: workflowPage.getByRole('rowheader', { name: 'Ari' }) });
  await ariRow.locator('td').nth(1).getByText('Bean chilli').waitFor({ state: 'visible' });
  await workflowPage.reload({ waitUntil: 'networkidle' });
  ariRow = workflowPage.locator('tbody tr').filter({ has: workflowPage.getByRole('rowheader', { name: 'Ari' }) });
  check('F-3-1 meal survives reload', await ariRow.locator('td').nth(1).getByText('Bean chilli').isVisible(), 'Tuesday in Ari lane');
  await ariRow.locator('td').nth(1).getByRole('button', { name: /Bean chilli/ }).click();
  await workflowPage.locator('#meal-dialog select[name="day"]').selectOption('2');
  await workflowPage.getByRole('button', { name: 'Save meal' }).click();
  ariRow = workflowPage.locator('tbody tr').filter({ has: workflowPage.getByRole('rowheader', { name: 'Ari' }) });
  await ariRow.locator('td').nth(1).getByText('Bean chilli').waitFor({ state: 'detached' });
  await ariRow.locator('td').nth(2).getByText('Bean chilli').waitFor({ state: 'visible' });
  check('F-3-1 old cell empty', await ariRow.locator('td').nth(1).getByText('Bean chilli').count() === 0, 'Tuesday empty');
  check('F-3-1 new cell updated', await ariRow.locator('td').nth(2).getByText('Bean chilli').isVisible(), 'Wednesday in Ari lane');
  await workflowPage.screenshot({ path: `${out}/live-meal-create-edit-desktop.png`, fullPage: false });
  await workflowPage.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  check('privacy title', await workflowPage.title() === 'Privacy — Family Meal Lanes', await workflowPage.title());
  check('route focus', await workflowPage.getByRole('heading', { level: 1 }).evaluate(element => element === document.activeElement), 'privacy h1 focused');
  await workflowPage.goBack();
  await workflowPage.waitForFunction(() => document.activeElement?.textContent === 'Plan meals for each person');
  check('Back restores route focus', await workflowPage.getByRole('heading', { level: 1, name: 'Plan meals for each person' }).evaluate(element => element === document.activeElement), 'home h1 focused');
  await workflowContext.close();

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`${base}/`, { waitUntil: 'networkidle' });
  await desktopPage.screenshot({ path: `${out}/live-first-screen-desktop.png`, fullPage: false });
  await desktopContext.close();

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
  await offlinePage.reload({ waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  check('offline reload', await offlinePage.getByText('Lemon chicken tray bake').first().isVisible(), 'sample board visible offline');
  await offlinePage.screenshot({ path: `${out}/live-demo-offline-mobile.png`, fullPage: false });
  await offlineContext.close();

  for (const colorScheme of ['light', 'dark']) {
    const axeContext = await browser.newContext({ colorScheme, bypassCSP: true, viewport: { width: 390, height: 844 } });
    const axePage = await axeContext.newPage();
    for (const route of ['/', '/?demo=1', '/privacy', '/terms']) {
      await axePage.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      await axePage.addScriptTag({ content: axe.source });
      const violations = await axePage.evaluate(async () => {
        const report = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
        return report.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
      });
      check(`axe ${colorScheme} ${route}`, violations.length === 0, JSON.stringify(violations));
    }
    await axeContext.close();
  }

  const notFoundContext = await browser.newContext({ viewport: { width: 390, height: 844 }, bypassCSP: true });
  const notFoundPage = await notFoundContext.newPage();
  const missingUrl = `${base}/missing-polish-3-${Date.now()}`;
  const notFoundResponse = await notFoundPage.goto(missingUrl, { waitUntil: 'networkidle' });
  check('F-1-1 HTTP 404', notFoundResponse?.status() === 404, String(notFoundResponse?.status()));
  check('F-1-1 skeleton', await notFoundPage.locator('header, nav, main, footer').count() === 4, 'header/nav/main/footer present');
  check('F-1-1 legal links', await notFoundPage.getByRole('link', { name: 'Privacy' }).last().getAttribute('href') === '/privacy' && await notFoundPage.getByRole('link', { name: 'Terms' }).getAttribute('href') === '/terms', 'privacy and terms present');
  check('F-1-2 direct wording', await notFoundPage.getByRole('heading', { level: 1, name: 'Page not found' }).isVisible(), await notFoundPage.title());
  check('404 metadata', await notFoundPage.locator('link[rel="canonical"]').getAttribute('href') === `${base}/404.html`, 'canonical URL');
  check('404 public provenance removed', await notFoundPage.getByText('Original illustration generated for this product.').count() === 0, missingUrl);
  check('404 mobile fit', await notFoundPage.locator('body').evaluate(body => body.scrollWidth <= innerWidth), '390x844');
  await notFoundPage.addScriptTag({ content: axe.source });
  const notFoundViolations = await notFoundPage.evaluate(async () => {
    const report = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    return report.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
  });
  check('axe 404', notFoundViolations.length === 0, JSON.stringify(notFoundViolations));
  await notFoundPage.screenshot({ path: `${out}/live-404-mobile.png`, fullPage: true });
  await notFoundContext.close();

  const api = await playwrightRequest.newContext();
  for (const route of ['/', '/demo', '/privacy', '/terms', '/robots.txt', '/sitemap.xml', '/manifest.webmanifest']) {
    const response = await api.get(`${base}${route}`);
    check(`live route ${route}`, response.status() === 200, String(response.status()));
  }
  const crawlContext = await browser.newContext();
  const crawlPage = await crawlContext.newPage();
  const links = new Set();
  for (const route of ['/', '/?demo=1', '/privacy', '/terms']) {
    await crawlPage.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    for (const href of await crawlPage.locator('a[href]').evaluateAll(elements => elements.map(element => element.href))) links.add(href);
  }
  for (const href of links) {
    const response = await api.get(href, { maxRedirects: href.startsWith('https://api.sociobot.in/') ? 0 : 5 });
    const passed = href.startsWith('https://api.sociobot.in/') ? response.status() === 303 : response.status() === 200;
    check(`link ${href}`, passed, String(response.status()));
  }
  await crawlContext.close();
  const checkout = await api.get('https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout', { maxRedirects: 0 });
  check('checkout redirect', checkout.status() === 303 && /^https:\/\/checkout\.dodopayments\.com\/session\//.test(checkout.headers().location || ''), `${checkout.status()} ${checkout.headers().location}`);
  await api.dispose();
} finally {
  await browser.close();
  await writeFile(`${out}/live-checks.json`, `${JSON.stringify(results, null, 2)}\n`);
}

console.log(JSON.stringify({ passed: results.length, results }, null, 2));
