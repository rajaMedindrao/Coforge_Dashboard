import {it} from 'vitest';
import {ACCOUNTS, currentInputs, figuresFrom, sumInputs, isOpen, identifiedUpside} from '../src/model/growth';

const r = (n: number, d = 1) => n.toFixed(d);

it('diag', () => {
  const lines: string[] = [];
  const show = (name: string, accounts: typeof ACCOUNTS) => {
    const f = figuresFrom(sumInputs(accounts.map(currentInputs)));
    lines.push(
      `${name.padEnd(26)} fy26 ${f.fy26Revenue} sec ${f.securedFy27} exp ${r(f.expectedFy27)} proj ${r(f.projected)} pg ${r(f.projectedGrowthPct, 2)} ytd ${r(f.ytdGrowthPct)} cov ${r(f.coverage, 2)} riw ${r(f.pipelineIfWon)} sow ${r(f.shareOfWalletPct)} win ${r(f.winRatePct)} risk ${r(f.renewalsAtRisk)} (${r(f.renewalsAtRiskPct)}%) large ${f.largeDealCount}/${f.largeDealTcv} wonYtd ${f.wonYtd} up ${identifiedUpside(accounts)}`,
    );
  };
  show('COMPANY', ACCOUNTS);
  for (const bu of ['banking', 'insurance', 'travel', 'healthcare']) {
    show(bu.toUpperCase(), ACCOUNTS.filter(a => a.buId === bu));
    for (const a of ACCOUNTS.filter(x => x.buId === bu)) {
      show('  ' + a.name, [a]);
      lines.push(`      open ${a.opportunities.filter(isOpen).length} total ${a.opportunities.length}`);
    }
  }
  console.log(lines.join('\n'));
});
