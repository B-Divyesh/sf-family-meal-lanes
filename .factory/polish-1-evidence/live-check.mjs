import { chromium } from '@playwright/test';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://family-meal-lanes.sociobot.in';
const out = '.factory/polish-1-evidence';
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
  page.on('request', request => requests.push(request.url()));

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  check('F-1-3 headline', await page.getByRole('heading', { level: 1, name: 'Plan meals for each person' }).isVisible(), page.url());
  check('F-1-4 control wording', await page.getByRole('button', { name: 'Manage people', exact: true }).isVisible(), 'visible and accessible names match');
  check('F-1-5 section heading', await page.getByRole('heading', { level: 2, name: 'Plan individual and shared meals' }).isVisible(), page.url());
  check('F-1-6 offline wording', await page.getByText('Works offline after your first visit.').isVisible(), page.url());
  check('F-1-7 prep wording', await page.getByText('Leave a small prep task for later.').isVisible(), page.url());
  check('mobile home fit', await page.locator('body').evaluate(body => body.scrollWidth <= innerWidth), '390x844');
  await page.screenshot({ path: `${out}/live-home-mobile.png`, fullPage: true });

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor({ state: 'visible' });
  check('one-click query demo', page.url() === `${base}/?demo=1`, page.url());
  check('demo banner', await page.getByText('Demo — sample data, nothing is saved').isVisible(), page.url());
  check('sample visible on first screen', await page.getByText('Lemon chicken tray bake').first().evaluate(element => {
    const rect = element.getBoundingClientRect(); return rect.top >= 0 && rect.bottom <= innerHeight;
  }), '390x844');
  const ids = await page.locator('button[data-meal]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('data-meal')))]);
  check('F-1-11 six sample meals', ids.length === 6, `${ids.length} distinct meals`);
  await page.screenshot({ path: `${out}/live-demo-mobile.png` });

  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Live reset probe');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Live reset probe').waitFor({ state: 'detached' });
  check('demo reset', await page.getByText('Live reset probe').count() === 0, 'probe removed');
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Live exit probe');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByText('Demo — sample data, nothing is saved').waitFor({ state: 'detached' });
  check('demo exit isolation', await page.getByText('Live exit probe').count() === 0 && await page.getByText('Lemon chicken tray bake').count() === 0, 'real store is empty');

  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.getByRole('heading', { level: 1, name: 'Your meal plan stays on this device' }).waitFor({ state: 'visible' });
  check('privacy title', await page.title() === 'Privacy — Family Meal Lanes', await page.title());
  check('route focus', await page.getByRole('heading', { level: 1 }).evaluate(element => element === document.activeElement), 'privacy h1 focused');
  check('privacy canonical', await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/privacy`, 'canonical URL');
  check('legal terms link', await page.getByRole('link', { name: 'Terms' }).last().getAttribute('href') === '/terms', 'footer link');
  await page.goto(`${base}/terms`, { waitUntil: 'networkidle' });
  check('terms title', await page.title() === 'Terms — Family Meal Lanes', await page.title());

  const externalRequests = requests.filter(url => new URL(url).origin !== base);
  check('demo request privacy', externalRequests.length === 0, JSON.stringify(externalRequests));
  check('console', errors.length === 0, JSON.stringify(errors));
  await context.close();

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
  await offlinePage.reload({ waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  check('offline reload', await offlinePage.getByText('Lemon chicken tray bake').first().isVisible(), 'sample board visible offline');
  await offlinePage.screenshot({ path: `${out}/live-demo-offline-mobile.png` });
  await offlineContext.close();

  for (const colorScheme of ['light', 'dark']) {
    const axeContext = await browser.newContext({ colorScheme, bypassCSP: true, viewport: { width: 390, height: 844 } });
    const axePage = await axeContext.newPage();
    for (const route of ['/', '/?demo=1', '/privacy', '/terms', '/404.html']) {
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

  const notFoundContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const notFoundPage = await notFoundContext.newPage();
  const notFoundResponse = await notFoundPage.goto(`${base}/missing-polish-1`, { waitUntil: 'networkidle' });
  check('F-1-1 HTTP 404', notFoundResponse?.status() === 404, String(notFoundResponse?.status()));
  check('F-1-1 skeleton', await notFoundPage.locator('header, nav, main, footer').count() === 4, 'header/nav/main/footer present');
  check('F-1-1 legal links', await notFoundPage.getByRole('link', { name: 'Privacy' }).last().getAttribute('href') === '/privacy' && await notFoundPage.getByRole('link', { name: 'Terms' }).getAttribute('href') === '/terms', 'privacy and terms present');
  check('F-1-2 404 wording', await notFoundPage.getByRole('heading', { level: 1, name: 'Page not found' }).isVisible(), await notFoundPage.title());
  check('404 metadata', await notFoundPage.locator('link[rel="canonical"]').getAttribute('href') === `${base}/404.html`, 'canonical URL');
  check('404 mobile fit', await notFoundPage.locator('body').evaluate(body => body.scrollWidth <= innerWidth), '390x844');
  await notFoundPage.screenshot({ path: `${out}/live-404-mobile.png`, fullPage: true });
  await notFoundContext.close();
} finally {
  await browser.close();
  await writeFile(`${out}/live-checks.json`, `${JSON.stringify(results, null, 2)}\n`);
}

console.log(JSON.stringify({ passed: results.length, results }, null, 2));
