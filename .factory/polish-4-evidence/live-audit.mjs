import { chromium } from '@playwright/test';
import axe from 'axe-core';
import { writeFile } from 'node:fs/promises';

const base = 'https://family-meal-lanes.sociobot.in';
const socialImage = `${base}/social-card.webp`;
const routes = [
  { path: '/', title: 'Family Meal Lanes — plan meals by person', heading: 'Plan meals for each person', status: 200 },
  { path: '/demo', title: 'Demo — Family Meal Lanes', heading: 'Try a filled meal week', status: 200 },
  { path: '/privacy', title: 'Privacy — Family Meal Lanes', heading: 'Your meal plan stays on this device', status: 200 },
  { path: '/terms', title: 'Terms — Family Meal Lanes', heading: 'Terms for using this meal board', status: 200 },
  { path: '/missing-polish-4', title: 'Page not found — Family Meal Lanes', heading: 'Page not found', status: 404 }
];
const result = { routes: [], accessibility: [], demo: {}, offline: {}, errors: [], passed: true };
const browser = await chromium.launch({ headless: true });

function recordFailure(kind, evidence) {
  result.errors.push({ kind, evidence });
  result.passed = false;
}

for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript({ content: axe.source });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  const response = await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' });
  const csp = response?.headers()['content-security-policy'] || '';
  const unexpectedConsoleErrors = route.status === 404
    ? consoleErrors.filter(message => !/Failed to load resource: the server responded with a status of 404/i.test(message))
    : consoleErrors;
  const details = {
    path: route.path,
    status: response?.status(),
    title: await page.title(),
    heading: await page.getByRole('heading', { level: 1 }).textContent(),
    twitterImage: await page.locator('meta[name="twitter:image"]').getAttribute('content'),
    csp,
    noHorizontalOverflow: await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth),
    consoleErrors,
    unexpectedConsoleErrors,
    pageErrors
  };
  result.routes.push(details);
  if (details.status !== route.status || details.title !== route.title || details.heading?.trim() !== route.heading || details.twitterImage !== socialImage || !csp.includes("frame-ancestors 'self'") || !details.noHorizontalOverflow || unexpectedConsoleErrors.length || pageErrors.length) recordFailure('cold-route', details);
  if (route.path === '/') await page.screenshot({ path: '.factory/polish-4-evidence/live-home-mobile.png', fullPage: false });
  if (route.path === '/demo') await page.screenshot({ path: '.factory/polish-4-evidence/live-demo-mobile.png', fullPage: false });
  if (route.status === 404) await page.screenshot({ path: '.factory/polish-4-evidence/live-404-mobile.png', fullPage: false });
  await context.close();
}

for (const colorScheme of ['light', 'dark']) {
  for (const route of ['/','/demo','/privacy','/terms','/missing-polish-4']) {
    const context = await browser.newContext({ colorScheme, viewport: { width: 390, height: 844 } });
    await context.addInitScript({ content: axe.source });
    const page = await context.newPage();
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.filter(item => item.impact === 'serious' || item.impact === 'critical').map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
    result.accessibility.push({ route, colorScheme, violations });
    if (violations.length) recordFailure('axe', { route, colorScheme, violations });
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript({ content: axe.source });
  const page = await context.newPage();
  const origins = new Set();
  const consoleErrors = [];
  page.on('request', request => origins.add(new URL(request.url()).origin));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL(/\?demo=1$/);
  await page.getByText('Demo — sample data, nothing is saved').waitFor();
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByLabel('Meal name').fill('Polish four reset probe');
  const saveBox = await page.getByRole('button', { name: 'Save meal' }).boundingBox();
  await page.mouse.click(saveBox.x + saveBox.width / 2, saveBox.y + saveBox.height / 2);
  await page.getByText('Polish four reset probe').first().waitFor();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Polish four reset probe').waitFor({ state: 'detached' });
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByRole('heading', { name: 'Plan meals for each person' }).waitFor();
  const absentFromReal = await page.getByText('Polish four reset probe').count() === 0;
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  const absentFromNewDemo = await page.getByText('Polish four reset probe').count() === 0;
  const slips = page.locator('button[data-meal]');
  await slips.first().waitFor();
  const labelViolations = await page.evaluate(async () => (await window.axe.run('.meal-board', { runOnly: { type: 'rule', values: ['label-content-name-mismatch'] } })).violations.map(item => ({ id: item.id, nodes: item.nodes.length })));
  result.demo = {
    directUrl: page.url(),
    banner: await page.getByText('Demo — sample data, nothing is saved').isVisible(),
    sampleVisible: await page.getByText('Lemon chicken tray bake').first().isVisible(),
    resetRemovedProbe: true,
    absentFromReal,
    absentFromNewDemo,
    requestOrigins: [...origins],
    labelViolations,
    consoleErrors
  };
  if (!result.demo.banner || !result.demo.sampleVisible || !absentFromReal || !absentFromNewDemo || JSON.stringify([...origins]) !== JSON.stringify([base]) || labelViolations.length || consoleErrors.length) recordFailure('demo', result.demo);
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  result.offline = {
    banner: await page.getByText('Demo — sample data, nothing is saved').isVisible(),
    sampleVisible: await page.getByText('Lemon chicken tray bake').first().isVisible(),
    controlled: await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
  };
  if (!result.offline.banner || !result.offline.sampleVisible || !result.offline.controlled) recordFailure('offline', result.offline);
  await context.close();
}

await browser.close();
await writeFile('.factory/polish-4-evidence/live-audit.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
