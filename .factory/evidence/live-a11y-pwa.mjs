import { chromium } from '@playwright/test';
import axe from 'axe-core';
import { writeFile } from 'node:fs/promises';

const base = 'https://family-meal-lanes.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = { axe: [], keyboard: {}, dialogTargets: [], offline: {}, errors: [] };

for (const colorScheme of ['light', 'dark']) {
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    const context = await browser.newContext({ colorScheme, viewport: { width: 390, height: 844 } });
    await context.addInitScript({ content: axe.source });
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') result.errors.push({ route, colorScheme, kind: 'console', text: message.text() }); });
    page.on('pageerror', error => result.errors.push({ route, colorScheme, kind: 'pageerror', text: error.message }));
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.filter(item => item.impact === 'serious' || item.impact === 'critical'));
    result.axe.push({ route, colorScheme, state: 'page', violations });
    if (route === '/demo') {
      await page.getByRole('button', { name: 'Add a meal' }).click();
      const dialogViolations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.filter(item => item.impact === 'serious' || item.impact === 'critical'));
      result.axe.push({ route, colorScheme, state: 'meal dialog', violations: dialogViolations });
      result.dialogTargets.push(...await page.locator('#meal-dialog input, #meal-dialog select, #meal-dialog textarea, #meal-dialog button, #meal-dialog label').evaluateAll(elements => elements.filter(element => {
        const box = element.getBoundingClientRect(); const style = getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.visibility !== 'hidden';
      }).map(element => {
        const box = element.getBoundingClientRect();
        return { tag: element.tagName, type: element.getAttribute('type'), label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: box.width, height: box.height };
      }).filter(item => item.width < 44 || item.height < 44)));
    }
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.getByText('Demo — sample data, nothing is saved').waitFor();
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  result.keyboard.firstTab = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outline, box: document.activeElement?.getBoundingClientRect().toJSON() }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  result.keyboard.skipTarget = await page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName }));
  const slip = page.locator('article[aria-label="Edit Lemon chicken tray bake for Shared"]');
  await slip.focus();
  await page.keyboard.press('Enter');
  result.keyboard.dialogInitialFocus = await page.evaluate(() => ({ name: document.activeElement?.getAttribute('name'), tag: document.activeElement?.tagName }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  result.keyboard.dialogEscapeClosed = !(await page.getByRole('dialog').isVisible());
  result.keyboard.returnedToOpener = await slip.evaluate(element => document.activeElement === element);
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await page.waitForTimeout(300);
  result.keyboard.routeFocus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), tag: document.activeElement?.tagName }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const failedRequests = [];
  const consoleErrors = [];
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cacheNames = await page.evaluate(() => caches.keys());
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Lemon chicken tray bake').first().waitFor();
  result.offline = { title: await page.title(), sampleVisible: await page.getByText('Lemon chicken tray bake').first().isVisible(), cacheNames, failedRequests, consoleErrors };
  await page.screenshot({ path: '.factory/evidence/live-offline-mobile.png', fullPage: false });
  await context.close();
}

await browser.close();
await writeFile('.factory/evidence/live-a11y-pwa.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
