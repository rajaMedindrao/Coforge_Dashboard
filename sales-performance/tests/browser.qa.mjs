// Browser QA: every view fits 1440×900 without scrolling, shows no placeholder values, and gets a screenshot.
// Usage: start the dev server (`npm run dev`), then `npm run qa`.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.QA_URL ?? 'http://127.0.0.1:5182/sales-performance';
const output = process.env.QA_OUTPUT ?? '.qa/screenshots';
fs.mkdirSync(output, {recursive: true});

const views = [
  ['sales-company', 'page=sales', 5, 4],
  ['sales-bu-banking', 'page=sales&bu=banking', 5, 2],
  ['sales-subbu-corporate-banking', 'page=sales&bu=banking&sub=corporate-banking', 5, 3],
  ['sales-person-sterling', 'page=sales&bu=banking&sub=corporate-banking&person=sterling-commercial-bank', 7, 5],
  ['sales-person-evergreen', 'page=sales&bu=insurance&sub=life-annuities&person=evergreen-life', 7, 5],
  ['sales-person-skybridge', 'page=sales&bu=travel&sub=airlines&person=skybridge-airways', 7, 5],
  ['sales-person-harbor', 'page=sales&bu=banking&sub=retail-banking&person=harbor-savings', 7, 4],
  ['delivery-company', 'page=delivery', 4, 4],
  ['delivery-bu-travel', 'page=delivery&bu=travel', 4, 2],
  ['delivery-subbu-airlines', 'page=delivery&bu=travel&sub=airlines', 4, 4],
  ['delivery-person-crew', 'page=delivery&bu=travel&sub=airlines&person=crew-scheduling-platform', 6, 4],
];

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text()));

try {
  for (const [name, query, cards, rows] of views) {
    await page.goto(`${base}/?${query}`);
    await page.locator('.kpi-card canvas').first().waitFor();
    await page.waitForTimeout(250);
    const state = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      cards: document.querySelectorAll('.kpi-card').length,
      charts: [...document.querySelectorAll('.kpi-card canvas')].filter(c => c.width > 0 && c.height > 0).length,
      rows: document.querySelectorAll('table tbody tr').length,
      emptyCells: [...document.querySelectorAll('td')].filter(td => td.innerText.trim() === '').length,
      clickableRows: document.querySelectorAll('tbody tr[tabindex]').length,
      pointerRows: [...document.querySelectorAll('tbody tr')].filter(tr => getComputedStyle(tr).cursor === 'pointer').length,
      hints: document.querySelectorAll('.hint').length,
      text: document.body.innerText,
    }));
    assert.ok(state.scrollHeight <= 900, `${name}: page is ${state.scrollHeight}px tall`);
    assert.ok(state.scrollWidth <= 1440, `${name}: page is ${state.scrollWidth}px wide`);
    assert.equal(state.cards, cards, `${name}: KPI cards`);
    assert.equal(state.charts, cards, `${name}: every card draws its chart`);
    assert.equal(state.rows, rows, `${name}: table rows`);
    assert.equal(state.emptyCells, 0, `${name}: no empty table cells`);
    if (name.includes('-person-')) {
      assert.equal(state.clickableRows + state.pointerRows + state.hints, 0, `${name}: last level is not clickable`);
    }
    assert.doesNotMatch(state.text, /—|NaN|Infinity|undefined|\bnull\b/, `${name}: no placeholder values`);
    await page.screenshot({path: `${output}/${name}.png`});
    console.log(`${name}: ${state.cards} cards, ${state.rows} rows, ${state.scrollHeight}px tall`);
  }

  // Drill-down by clicking rows, and the tooltip on hover.
  await page.goto(`${base}/?page=sales`);
  await page.locator('table tbody tr', {hasText: 'Travel'}).click();
  await page.locator('h1', {hasText: 'Travel'}).waitFor();
  await page.locator('table tbody tr', {hasText: 'Airlines'}).click();
  await page.locator('h1', {hasText: 'Airlines'}).waitFor();
  await page.locator('table tbody tr').first().click();
  await page.locator('h2', {hasText: 'Top 3 open deals'}).waitFor();
  await page.locator('.kpi-card h3').first().hover();
  assert.ok(await page.locator('.kpi-card .tooltip').first().isVisible(), 'tooltip shows on hover');
  await page.screenshot({path: `${output}/tooltip.png`});

  assert.deepEqual(errors, [], 'no browser errors');
  console.log('Browser QA passed');
} finally {
  await browser.close();
}
