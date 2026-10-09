import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.QA_URL ?? 'http://127.0.0.1:5182/sales-growth/';
const salesBase = new URL('../sales-performance/', base).href;
const output = '.qa/redesign';
fs.mkdirSync(output, {recursive: true});
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const errors = [];
let salesTableStyle;
let salesPalette;
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
const routes = [
  ['sales-company', 'page=sales'], ['company', 'page=growth'],
  ['sales-bu', 'page=sales&bu=banking'], ['bu', 'page=growth&bu=banking'],
  ['sales-subbu', 'page=sales&bu=banking&sub=corporate-banking'], ['subbu', 'page=growth&bu=banking&sub=corporate-banking'],
  ['account', 'page=growth&bu=banking&sub=corporate-banking&account=sterling-commercial-bank'],
];
try {
  for (const [name, query] of routes) {
    await page.goto(`${name.startsWith('sales') ? salesBase : base}?${query}`);
    assert.deepEqual(await page.locator('.tabs button').allTextContents(), name.startsWith('sales') ? ['Sales', 'Delivery'] : ['Account Growth']);
    await page.locator('.kpi-card canvas').first().waitFor();
    await page.waitForTimeout(200);
    const state = await page.evaluate(() => ({height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, cards: document.querySelectorAll('.kpi-row .kpi-card').length,
      clippedTitles: [...document.querySelectorAll('.kpi-row h3')].filter(e => e.scrollWidth > e.clientWidth).map(e => e.textContent),
      text: document.body.innerText}));
    console.log(name, JSON.stringify({...state, text: undefined}));
    if (!name.startsWith('sales')) {
      assert.equal(state.cards, 5); assert.ok(state.width <= 1440, `${name}: horizontal overflow`);
      assert.equal(await page.locator('[data-metric="largeDeals"]').count(), 0);
      assert.equal(await page.getByRole('columnheader', {name: 'Large deals', exact: true}).count(), 0);
      assert.deepEqual(state.clippedTitles, []); assert.doesNotMatch(state.text, /NaN|undefined|Infinity/);
    }
    const palette = await page.evaluate(() => Object.fromEntries(['--navy', '--muted', '--green', '--green-tint', '--amber', '--amber-tint', '--red', '--red-tint'].map(key => [key, getComputedStyle(document.documentElement).getPropertyValue(key)])));
    if (name === 'sales-company') {
      salesPalette = palette;
      salesTableStyle = await page.evaluate(() => ({paddingTop: getComputedStyle(document.querySelector('.comparison td')).paddingTop, paddingBottom: getComputedStyle(document.querySelector('.comparison td')).paddingBottom, spacing: getComputedStyle(document.querySelector('.comparison')).borderSpacing, valueFont: getComputedStyle(document.querySelector('.comparison td strong')).fontSize, noteFont: getComputedStyle(document.querySelector('.comparison td small')).fontSize}));
    }
    if (!name.startsWith('sales')) assert.deepEqual(palette, salesPalette, `${name}: Sales colour palette`);
    if (name === 'company') {
      assert.equal(await page.getByRole('button', {name: 'Company', exact: true}).count(), 1);
      const fills = await page.locator('.comparison .rag-cell').evaluateAll(cells => cells.map(c => getComputedStyle(c).backgroundColor));
      assert.ok(fills.every(fill => fill !== 'rgb(255, 255, 255)' && fill !== 'rgba(0, 0, 0, 0)'), 'continuous tinted metric cells');
    }
    if (name === 'account') {
      assert.equal(await page.locator('.account-context').count(), 0, 'bottom context boxes removed');
      assert.equal(await page.locator('.opportunity-group table').count(), 1, 'one ungrouped opportunity table');
      assert.equal(await page.locator('.group-label').count(), 0, 'type summary headings removed');
      assert.equal(await page.getByRole('columnheader', {name: 'Type', exact: true}).count(), 1);
      assert.equal(await page.getByRole('columnheader', {name: 'Main competitor', exact: true}).count(), 0);
      assert.doesNotMatch(await page.locator('.opportunity-group').innerText(), /[●○]/, 'plain-text stages');
      const tableStyle = await page.evaluate(() => ({paddingTop: getComputedStyle(document.querySelector('.opportunity-group .comparison td')).paddingTop, paddingBottom: getComputedStyle(document.querySelector('.opportunity-group .comparison td')).paddingBottom, spacing: getComputedStyle(document.querySelector('.opportunity-group .comparison')).borderSpacing, valueFont: getComputedStyle(document.querySelector('.opportunity-group .comparison td strong')).fontSize, noteFont: getComputedStyle(document.querySelector('.opportunity-group .comparison td small')).fontSize}));
      assert.deepEqual(tableStyle, salesTableStyle, 'opportunity table uses Sales spacing and typography');
    }
    await page.screenshot({path: `${output}/${name}.png`, fullPage: true});
  }
  await page.getByRole('row', {name: /Open Cloud & infrastructure takeover/}).click();
  await page.waitForURL(/opportunity=/);
  assert.equal(await page.locator('.drawer').count(), 0);
  assert.equal(await page.locator('.title-row .owner').count(), 0, 'opportunity subtitle removed');
  assert.equal(await page.locator('.opportunity-page .kpi-row .kpi-card').count(), 6);
  assert.match(await page.locator('.opportunity-page').innerText(), /illustrative/);
  assert.match(await page.locator('.opportunity-page').innerText(), /Competition[\s\S]*TCS/, 'competitors retained on opportunity detail');
  assert.equal(await page.locator('.opportunity-page .trend-bars:visible').count(), 0);
  await page.screenshot({path: `${output}/opportunity.png`, fullPage: true});
  const size = await page.evaluate(() => ({height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth}));
  assert.ok(size.width <= 1440, `opportunity: ${JSON.stringify(size)}`);
  await page.reload(); await page.locator('.opportunity-page').waitFor();
  await page.getByLabel('Opportunity', {exact: true}).selectOption(''); await page.locator('.growth-strip').waitFor();
  await page.getByRole('row', {name: /Open Commercial cards digital servicing/}).click();
  assert.match(await page.locator('.opportunity-page').innerText(), /Not yet active/);
  await page.screenshot({path: `${output}/potential.png`, fullPage: true});
  await page.getByRole('button', {name: 'Company', exact: true}).click();
  await page.getByRole('row', {name: 'Open Banking', exact: true}).click();
  await page.getByRole('row', {name: 'Open Corporate Banking', exact: true}).click();
  await page.getByRole('row', {name: 'Open Sterling Commercial Bank', exact: true}).click();
  await page.locator('.kpi-card h3').first().hover(); assert.ok(await page.locator('.kpi-card .tooltip').first().isVisible());
  assert.deepEqual(errors, []);
  await page.setViewportSize({width: 2880, height: 900});
  for (const [sales, growth] of [['sales-company', 'company'], ['sales-bu', 'bu'], ['sales-subbu', 'subbu']]) {
    const images = [sales, growth].map(name => fs.readFileSync(`${output}/${name}.png`).toString('base64'));
    await page.setContent(`<body style="margin:0;display:flex"><img width="1440" height="900" src="data:image/png;base64,${images[0]}"><img width="1440" height="900" src="data:image/png;base64,${images[1]}"></body>`);
    await page.screenshot({path: `${output}/compare-${growth}.png`});
  }
  console.log('Browser QA passed');
} finally {await browser.close();}
