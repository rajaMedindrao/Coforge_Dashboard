import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const output = fileURLToPath(new URL('../.qa/redesign/', import.meta.url));
fs.mkdirSync(output, {recursive: true});
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:1440,height:900}});
const base = process.env.QA_URL ?? 'http://127.0.0.1:5182/sales-growth/';
const failures=[]; const errors=[]; let checked=0;
page.on('pageerror', e=>errors.push(e.message));
const options = label => page.getByLabel(label,{exact:true}).locator('option').evaluateAll(opts=>opts.filter(o=>o.value).map(o=>({id:o.value,name:o.textContent})));
async function check(query,label) {
  await page.goto(base+'?'+new URLSearchParams({page:'growth',...query}));
  await page.locator('.kpi-row .kpi-card').first().waitFor();
  const state=await page.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('.kpi-row h3')].filter(e=>e.scrollWidth>e.clientWidth).map(e=>e.textContent),invalid:/NaN|undefined|Infinity/.test(document.body.innerText),longDiscussions:[...document.querySelectorAll('.discuss-col ul')].filter(ul => [...ul.children].reduce((lines,li) => lines + Math.ceil(li.getBoundingClientRect().height / parseFloat(getComputedStyle(li).lineHeight) - .05), 0) > 3).map(ul => ul.innerText),hintVisible:document.body.innerText.includes('Click a row to drill down')}));
  checked++; if(state.w>1440||state.clipped.length||state.invalid||state.longDiscussions.length||state.hintVisible) {failures.push({label,query,...state}); await page.screenshot({path:`${output}/failure-${failures.length}.png`,fullPage:true});}
}
try {
  await check({},'Company'); const bus=await options('Business unit');
  for(const bu of bus) {
    await check({bu:bu.id},bu.name); const subs=await options('Sub-business unit');
    for(const sub of subs) {
      await check({bu:bu.id,sub:sub.id},sub.name); const accounts=await options('Account');
      for(const account of accounts) {
        const query={bu:bu.id,sub:sub.id,account:account.id}; await check(query,account.name); const opps=await options('Opportunity');
        for(const opp of opps) await check({...query,opportunity:opp.id},opp.name);
      }
    }
  }
  console.log(JSON.stringify({checked,failures,errors},null,2));
  fs.writeFileSync(`${output}/all-views.json`,JSON.stringify({checked,failures,errors},null,2));
  if(failures.length||errors.length) process.exitCode=1;
} finally {await browser.close();}
