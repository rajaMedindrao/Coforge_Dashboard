import {describe, expect, it} from 'vitest';
import {BUSINESS_UNITS} from '../../sales-performance/src/data/staticData';
import {money, round1, signedPct} from '../../sales-performance/src/model/format';
import {
  AS_OF,
  COMPETITORS,
  GROWTH_ACCOUNTS,
  MARKET_GROWTH,
  OPPORTUNITY_TYPES,
  PRODUCTS,
  SERVICE_LINES,
  SNAPSHOTS,
  type Opportunity,
  type OpportunityType,
} from '../src/data/growthData';
import {
  ACCOUNTS,
  GROWTH_TARGET_PCT,
  LARGE_DEAL_TCV,
  PERIOD_END,
  TAKEOVER_WINDOW_END,
  TTM_START,
  currentInputs,
  expectedContractValue,
  expectedFy27Revenue,
  figuresFrom,
  fy27RevenueIfWon,
  growthBridge,
  growthFigures,
  growthSeries,
  identifiedUpside,
  isActive,
  isOpen,
  largeDeals,
  monthsThroughMarch2027,
  pipelineBy,
  renewalAtRisk,
  sumInputs,
  ttmRevenue,
  walletSplit,
  whiteSpace,
  type GrowthAccount,
} from '../src/model/growth';
import {GROWTH_COMPANY} from '../src/model/growthHierarchy';
import {GROWTH_METRICS} from '../src/model/growthMetrics';
import {growthTalkingPoints} from '../src/model/growthTalkingPoints';

const near = (actual: number, expected: number, tolerance = 0.05) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

const opp = (partial: Partial<Opportunity> & Pick<Opportunity, 'type' | 'annualValue' | 'expectedClose'>): Opportunity => ({
  id: 't',
  name: 'Test',
  serviceLine: 'Data & AI',
  status: 'Active',
  stage: 'Proposal',
  tcv: 12000,
  winPct: 40,
  plannedMarginPct: 30,
  competitors: ['TCS'],
  dealTeam: ['A Person'],
  ...partial,
});

const ofType = (accounts: readonly GrowthAccount[], type: OpportunityType) =>
  accounts.flatMap(a => a.opportunities.filter(o => isOpen(o) && o.type === type));

describe('formulas', () => {
  it('counts months from the start month through March 2027', () => {
    expect(monthsThroughMarch2027(2026 * 12 + 10)).toBe(5); // Nov 2026 → Mar 2027
    expect(monthsThroughMarch2027(2027 * 12 + 2)).toBe(1); // Mar 2027
    expect(monthsThroughMarch2027(2027 * 12 + 3)).toBe(0); // Apr 2027
  });

  it('recognises FY27 revenue if won for new work and for a renewal', () => {
    // Close 30 Oct 2026 → revenue starts Nov 2026 → 5 months.
    const expansion = opp({type: 'Expansion', annualValue: 1200, expectedClose: '2026-10-30'});
    expect(fy27RevenueIfWon(expansion)).toBeCloseTo(500, 5);
    expect(expectedFy27Revenue(expansion)).toBeCloseTo(200, 5);
    expect(expectedContractValue(expansion)).toBeCloseTo(4800, 5);

    // Close in or after Mar 2027 contributes nothing.
    expect(fy27RevenueIfWon(opp({type: 'Cross-sell', annualValue: 2400, expectedClose: '2027-03-01'}))).toBe(0);
    expect(fy27RevenueIfWon(opp({type: 'Cross-sell', annualValue: 2400, expectedClose: '2027-06-30'}))).toBe(0);

    // Renewal: month after the contract end, not the expected close.
    const renewal = opp({
      type: 'Renewal',
      annualValue: 3600,
      expectedClose: '2026-12-18',
      winPct: 70,
      renewal: {currentAnnualValue: 3750, contractEnd: '2027-01-31', status: 'Proposal submitted'},
    });
    expect(fy27RevenueIfWon(renewal)).toBeCloseTo(600, 5);
    expect(expectedFy27Revenue(renewal)).toBeCloseTo(420, 5);
  });

  it('excludes Potential opportunities from expected value and from renewals at risk', () => {
    const potential = opp({type: 'Expansion', status: 'Potential', stage: undefined, winPct: undefined, annualValue: 2000, expectedClose: '2027-06-30'});
    expect(expectedFy27Revenue(potential)).toBe(0);
    expect(expectedContractValue(potential)).toBe(0);
    expect(fy27RevenueIfWon(potential)).toBe(0);
    const renewal = opp({
      type: 'Renewal',
      status: 'Potential',
      stage: undefined,
      winPct: undefined,
      annualValue: 1000,
      expectedClose: '2026-12-01',
      renewal: {currentAnnualValue: 1000, contractEnd: '2026-12-31', status: 'Identified'},
    });
    expect(renewalAtRisk(renewal)).toBe(0);
  });

  it('sums amounts before dividing, so ratios are never an average of ratios', () => {
    const combined = figuresFrom(
      sumInputs([
        {fy26Revenue: 1000, ytdRevenue: 200, priorYtdRevenue: 100, ttmRevenue: 1000, itSpend: 2000, securedFy27: 900, pipelineIfWon: 400, expectedFy27: 100, largeDealCount: 1, largeDealTcv: 10000, wonYtd: 100, priorWonYtd: 50, wonTtm: 100, lostTtm: 300, renewalsAtRisk: 50},
        {fy26Revenue: 1000, ytdRevenue: 100, priorYtdRevenue: 200, ttmRevenue: 500, itSpend: 4000, securedFy27: 800, pipelineIfWon: 200, expectedFy27: 50, largeDealCount: 0, largeDealTcv: 0, wonYtd: 0, priorWonYtd: 0, wonTtm: 900, lostTtm: 100, renewalsAtRisk: 200},
      ]),
    );
    // YTD growth is (200+100)/(100+200) − 1 = 0, not the average of +100% and −50%.
    expect(combined.ytdGrowthPct).toBeCloseTo(0, 5);
    // Win rate is (100+900)/(400+1000) = 71.4%, not the average of 25% and 90%.
    expect(combined.winRatePct).toBeCloseTo(1000 / 14, 5);
    expect(combined.shareOfWalletPct).toBeCloseTo((1500 / 6000) * 100, 5);
    expect(combined.coverage).toBeCloseTo(600 / (2300 - 1700), 5);
  });

  it('shows Target secured once secured revenue meets the FY27 target', () => {
    const secured = figuresFrom({
      fy26Revenue: 1000, ytdRevenue: 500, priorYtdRevenue: 400, ttmRevenue: 1000, itSpend: 2000, securedFy27: 1200,
      pipelineIfWon: 300, expectedFy27: 100, largeDealCount: 0, largeDealTcv: 0, wonYtd: 10, priorWonYtd: 10, wonTtm: 10, lostTtm: 10, renewalsAtRisk: 0,
    });
    expect(secured.targetSecured).toBe(true);
    expect(secured.coverage).toBe(0);
    expect(GROWTH_METRICS.find(m => m.key === 'pipelineCoverage')!.display(secured)).toBe('Target secured');
  });
});

describe('roll-ups', () => {
  const company = growthFigures(ACCOUNTS, 2);
  const bu = (id: string) => growthFigures(ACCOUNTS.filter(a => a.buId === id), 2);

  it('matches the stated company and BU totals', () => {
    expect(ACCOUNTS).toHaveLength(20);
    expect(company.fy26Revenue).toBe(56000);
    expect(company.target).toBe(64400);
    expect(company.securedFy27).toBe(55000);
    expect(money(company.fy26Revenue)).toBe('$56.0M');
    expect(money(company.target)).toBe('$64.4M');
    expect(money(company.securedFy27)).toBe('$55.0M');
    expect(money(company.projected)).toBe('$63.0M');
    expect(signedPct(company.projectedGrowthPct)).toBe('+12.5%');

    expect(bu('banking').fy26Revenue).toBe(19000);
    expect(bu('insurance').fy26Revenue).toBe(14000);
    expect(bu('travel').fy26Revenue).toBe(13000);
    expect(bu('healthcare').fy26Revenue).toBe(10000);
    expect(signedPct(bu('banking').projectedGrowthPct)).toBe('+9.0%');
    expect(signedPct(bu('insurance').projectedGrowthPct)).toBe('+13.0%');
    expect(signedPct(bu('travel').projectedGrowthPct)).toBe('+16.0%');
    expect(signedPct(bu('healthcare').projectedGrowthPct)).toBe('+14.0%');
  });

  it('builds the company totals only by summing account inputs', () => {
    const fromAccounts = figuresFrom(sumInputs(ACCOUNTS.map(currentInputs)));
    expect(fromAccounts.projected).toBeCloseTo(company.projected, 5);
    expect(fromAccounts.pipelineIfWon).toBeCloseTo(
      ACCOUNTS.flatMap(a => a.opportunities.filter(isActive)).reduce((t, o) => t + fy27RevenueIfWon(o), 0),
      5,
    );
    expect(fromAccounts.expectedFy27).toBeCloseTo(
      ACCOUNTS.flatMap(a => a.opportunities.filter(isActive)).reduce((t, o) => t + expectedFy27Revenue(o), 0),
      5,
    );
    const bridge = growthBridge(ACCOUNTS);
    expect(bridge.projected).toBeCloseTo(company.projected, 5);
    expect(bridge.fy26 + bridge.securedChange + bridge.renewals + bridge.newWork).toBeCloseTo(bridge.projected, 5);
    for (const part of GROWTH_COMPANY.parts) {
      const rolled = growthFigures(part.accounts, 2);
      const fromChildren = figuresFrom(sumInputs(part.parts.map(child => sumInputs(child.accounts.map(a => currentInputs(a))))));
      expect(fromChildren.projected).toBeCloseTo(rolled.projected, 5);
      expect(fromChildren.winRatePct).toBeCloseTo(rolled.winRatePct, 5);
    }
  });

  it('keeps a finite quarter-end snapshot for every account and rolls those up the same way', () => {
    for (const account of ACCOUNTS) {
      const pair = SNAPSHOTS[account.id];
      expect(pair, account.name).toBeDefined();
      for (const quarter of [0, 1, 2]) {
        const figures = growthFigures([account], quarter);
        for (const [key, value] of Object.entries(figures)) {
          expect(typeof value === 'number' ? Number.isFinite(value) : true, `${account.name} ${key}`).toBe(true);
        }
        for (const metric of GROWTH_METRICS) {
          const text = [metric.display(figures), metric.cardNote(figures), metric.cellNote(figures), metric.chart.format(metric.chart.value(figures))].join(' ');
          expect(text, `${account.name} ${metric.key}`).not.toMatch(/NaN|Infinity|—|undefined/);
        }
      }
    }
    const series = growthSeries(ACCOUNTS);
    expect(series).toHaveLength(3);
    expect(series[2].projected).toBeCloseTo(company.projected, 5);
    expect(series[0].fy26Revenue).toBe(56000);
  });
});

describe('believability', () => {
  it('keeps every account inside the growth, stage, size and count rules', () => {
    const zeroTypeAccounts: string[] = [];
    for (const account of ACCOUNTS) {
      const figures = growthFigures([account], 2);
      expect(figures.projectedGrowthPct, account.name).toBeGreaterThanOrEqual(-5);
      expect(figures.projectedGrowthPct, account.name).toBeLessThanOrEqual(25);
      expect(account.opportunities.length, account.name).toBeGreaterThanOrEqual(3);
      expect(account.opportunities.length, account.name).toBeLessThanOrEqual(7);

      const won = account.opportunities.filter(o => o.status === 'Won' && o.expectedClose >= TTM_START && o.expectedClose <= PERIOD_END);
      const lost = account.opportunities.filter(o => o.status === 'Lost' && o.expectedClose >= TTM_START && o.expectedClose <= PERIOD_END);
      expect(won.length, `${account.name} won`).toBeGreaterThanOrEqual(1);
      expect(lost.length, `${account.name} lost`).toBeGreaterThanOrEqual(1);

      const lineSpend = SERVICE_LINES.reduce((t, line) => t + account.serviceLines[line].spend, 0);
      expect(lineSpend, account.name).toBe(account.itSpend);
      const split = walletSplit(account);
      expect(split.reduce((t, part) => t + part.value, 0), account.name).toBeCloseTo(account.itSpend, 5);
      expect(split.every(part => part.value >= -0.01), `${account.name} wallet`).toBe(true);
      expect(account.signals.length).toBeGreaterThanOrEqual(2);
      expect(account.signals.length).toBeLessThanOrEqual(3);
      expect(account.contracts.length).toBeGreaterThan(0);

      const openTypes = new Set(account.opportunities.filter(isOpen).map(o => o.type));
      if (openTypes.size < OPPORTUNITY_TYPES.length) zeroTypeAccounts.push(account.id);
      for (const type of OPPORTUNITY_TYPES) {
        if (!openTypes.has(type)) expect(account.noOpportunity[type]?.length, `${account.name} ${type}`).toBeGreaterThan(8);
      }

      const nonRenewal = account.opportunities.filter(o => isOpen(o) && o.type !== 'Renewal').reduce((t, o) => t + o.annualValue, 0);
      expect(nonRenewal, account.name).toBeLessThanOrEqual(figures.untappedWallet + 0.01);

      for (const o of account.opportunities) {
        expect(o.annualValue).toBeGreaterThan(0);
        expect(o.tcv).toBeGreaterThanOrEqual(o.annualValue);
        expect(o.competitors.length).toBeGreaterThan(0);
        expect(o.dealTeam.length).toBeGreaterThan(0);
        if (o.status === 'Active') {
          expect(o.winPct).toBeTypeOf('number');
          expect(o.stage).toBeDefined();
          const win = o.winPct!;
          if (o.type === 'Renewal') {
            expect(win, o.name).toBeLessThanOrEqual(90);
            if (o.stage === 'Qualified') expect(win, o.name).toBeLessThanOrEqual(30);
            if (o.stage === 'Proposal') expect(win, o.name).toBeGreaterThanOrEqual(30);
            if (o.stage === 'Negotiation') expect(win, o.name).toBeGreaterThanOrEqual(60);
          } else if (o.stage === 'Qualified') {
            expect(win, o.name).toBeLessThanOrEqual(30);
          } else if (o.stage === 'Proposal') {
            expect(win, o.name).toBeGreaterThanOrEqual(30);
            expect(win, o.name).toBeLessThanOrEqual(60);
          } else {
            expect(win, o.name).toBeGreaterThanOrEqual(60);
          }
        } else {
          expect(o.winPct, o.name).toBeUndefined();
          expect(o.stage, o.name).toBeUndefined();
        }
        if (isOpen(o)) {
          expect(o.detail, o.name).toBeDefined();
          expect(o.detail!.scope.length).toBeGreaterThan(10);
          expect(o.detail!.risks.length).toBeGreaterThan(0);
          expect(o.detail!.nextSteps).toHaveLength(3);
          expect(o.detail!.products.length).toBeGreaterThanOrEqual(1);
          expect(o.detail!.products.length).toBeLessThanOrEqual(2);
          for (const product of o.detail!.products) expect(PRODUCTS).toHaveProperty(product.name);
          for (const name of o.detail!.decisionMakers) expect(account.stakeholders.some(s => s.name === name), `${o.name} ${name}`).toBe(true);
        }
        if (o.type === 'Cross-sell') expect(o.annualValue, o.name).toBeLessThanOrEqual(account.serviceLines[o.serviceLine].spend);
        if (o.type === 'Competitor takeover' && o.takeover) {
          const contract = account.contracts.find(c => c.id === o.takeover?.contractId);
          expect(contract, o.name).toBeDefined();
          expect(o.annualValue, o.name).toBeLessThanOrEqual(contract!.annualValue);
        }
        if (o.type === 'New division/region' && o.newDivision) {
          const division = account.divisions.find(d => d.name === o.newDivision?.division);
          expect(division, o.name).toBeDefined();
          expect(o.annualValue, o.name).toBeLessThanOrEqual(division!.spend);
        }
        // Open types need a basis in the account as it stands today. Closed deals can predate that.
        if (isOpen(o) && o.type === 'Cross-sell') expect(account.serviceLines[o.serviceLine].coforge, o.name).toBe(false);
        if (isOpen(o) && o.type === 'Competitor takeover') {
          const contract = account.contracts.find(c => c.id === o.takeover?.contractId);
          expect(contract!.endDate >= AS_OF && contract!.endDate <= TAKEOVER_WINDOW_END, o.name).toBe(true);
          expect(o.competitors[0], o.name).toBe(contract!.competitor);
        }
        if (isOpen(o) && o.type === 'Expansion') expect(account.serviceLines[o.serviceLine].coforge, o.name).toBe(true);
        if (isOpen(o) && o.type === 'Renewal') {
          expect(o.renewal, o.name).toBeDefined();
          expect(account.serviceLines[o.serviceLine].coforge, o.name).toBe(true);
        }
      }
    }
    expect(zeroTypeAccounts.length).toBeGreaterThanOrEqual(8);
  });

  it('uses the same people as the Sales tab and drops the third account of each second sub-business unit', () => {
    const expected = BUSINESS_UNITS.flatMap(bu =>
      bu.subBus.flatMap((sub, s) => sub.accounts.filter((_, a) => !(s === 1 && a === 2)).map(account => account.id)),
    );
    expect(ACCOUNTS.map(a => a.id)).toEqual(expected);
    for (const account of ACCOUNTS) {
      const source = BUSINESS_UNITS.flatMap(b => b.subBus.flatMap(s => s.accounts)).find(a => a.id === account.id)!;
      const bu = BUSINESS_UNITS.find(b => b.id === account.buId)!;
      const sub = bu.subBus.find(s => s.id === account.subBuId)!;
      expect(account.name).toBe(source.name);
      expect(account.clientPartner).toBe(source.clientPartner);
      expect(account.buHead).toBe(bu.buHead);
      expect(account.salesLead).toBe(sub.salesLead);
    }
    expect(GROWTH_ACCOUNTS).toHaveLength(20);
    for (const id of Object.keys(MARKET_GROWTH)) expect(BUSINESS_UNITS.some(b => b.id === id)).toBe(true);
  });

  it('carries the four business-unit stories', () => {
    const buFigures = GROWTH_COMPANY.parts.map(part => ({part, f: growthFigures(part.accounts, 2)}));
    const banking = buFigures.find(b => b.part.key === 'banking')!;
    const insurance = buFigures.find(b => b.part.key === 'insurance')!;
    const travel = buFigures.find(b => b.part.key === 'travel')!;
    const healthcare = buFigures.find(b => b.part.key === 'healthcare')!;

    expect(banking.f.shareOfWalletPct).toBeGreaterThan(Math.max(...buFigures.filter(b => b !== banking).map(b => b.f.shareOfWalletPct)));
    expect(banking.f.ytdGrowthPct).toBeLessThan(Math.min(...buFigures.filter(b => b !== banking).map(b => b.f.ytdGrowthPct)));
    const takeover = ACCOUNTS.filter(a => a.buId === 'banking')
      .flatMap(a => a.opportunities)
      .find(o => isActive(o) && o.type === 'Competitor takeover' && o.tcv === 14000);
    expect(takeover?.winPct).toBe(35);
    expect(takeover?.competitors[0]).toBe('TCS');
    expect(takeover?.tcv).toBeGreaterThanOrEqual(LARGE_DEAL_TCV);

    expect(insurance.f.renewalsAtRisk).toBeGreaterThan(Math.max(...buFigures.filter(b => b !== insurance).map(b => b.f.renewalsAtRisk)));
    const renewal = ACCOUNTS.filter(a => a.buId === 'insurance')
      .flatMap(a => a.opportunities)
      .find(o => o.type === 'Renewal' && o.renewal?.contractEnd === '2027-01-31' && o.tcv >= LARGE_DEAL_TCV);
    expect(renewal?.status).toBe('Active');
    expect(renewal?.stage).toBe('Proposal');
    expect(renewal?.winPct).toBe(70);
    const insuranceWhiteSpace = new Map<string, number>();
    for (const account of ACCOUNTS.filter(a => a.buId === 'insurance')) {
      for (const gap of whiteSpace(account)) insuranceWhiteSpace.set(gap.line, (insuranceWhiteSpace.get(gap.line) ?? 0) + gap.spend);
    }
    const biggestGap = [...insuranceWhiteSpace.entries()].sort((a, b) => b[1] - a[1])[0];
    expect(biggestGap[0]).toBe('Data & AI');

    expect(travel.f.projected).toBeGreaterThanOrEqual(travel.f.target);
    const travelActive = ACCOUNTS.filter(a => a.buId === 'travel').flatMap(a => a.opportunities.filter(isActive));
    const byType = new Map<string, number>();
    for (const o of travelActive) byType.set(o.type, (byType.get(o.type) ?? 0) + expectedFy27Revenue(o));
    expect([...byType.entries()].sort((a, b) => b[1] - a[1])[0][0]).toBe('Expansion');
    const biggestTravel = [...travelActive].sort((a, b) => b.tcv - a.tcv).slice(0, 2);
    expect(biggestTravel.every(o => o.competitors[0] === 'Accenture')).toBe(true);

    expect(signedPct(healthcare.f.ytdGrowthPct)).toBe('+22.0%');
    expect(healthcare.f.ytdGrowthPct).toBeGreaterThan(Math.max(...buFigures.filter(b => b !== healthcare).map(b => b.f.ytdGrowthPct)));
    expect(healthcare.f.coverage).toBeLessThan(1.5);
    expect(identifiedUpside(ACCOUNTS.filter(a => a.buId === 'healthcare'))).toBeGreaterThan(
      Math.max(...['banking', 'insurance', 'travel'].map(id => identifiedUpside(ACCOUNTS.filter(a => a.buId === id)))),
    );
  });

  it('gives every panel a number and every comparison row something to discuss', () => {
    const walk = [GROWTH_COMPANY, ...GROWTH_COMPANY.parts, ...GROWTH_COMPANY.parts.flatMap(b => b.parts)];
    for (const unit of walk) {
      const figures = growthFigures(unit.accounts, 2);
      expect(Number.isFinite(figures.projected), unit.name).toBe(true);
      expect(pipelineBy(unit.accounts, 'type').length, unit.name).toBeGreaterThan(0);
      expect(pipelineBy(unit.accounts, 'competitor').every(g => COMPETITORS.includes(g.label as (typeof COMPETITORS)[number]) || g.label === 'In-house')).toBe(true);
      expect(largeDeals(unit.accounts).length, unit.name).toBeGreaterThan(0);
      if (unit.level !== 'company') {
        const siblings = unit.level === 'account' ? [] : walk.filter(other => other.level === unit.level && other.selection.buId === unit.selection.buId);
        const points = growthTalkingPoints(unit, siblings.length > 0 ? siblings : [unit]);
        expect(points.length, unit.name).toBeGreaterThan(0);
        expect(points.length, unit.name).toBeLessThanOrEqual(2);
        for (const point of points) expect(point.text).not.toMatch(/NaN|undefined|—/);
      }
    }
    for (const bu of GROWTH_COMPANY.parts) {
      for (const row of bu.parts) expect(growthTalkingPoints(row, bu.parts).length).toBeGreaterThan(0);
      expect(round1(growthFigures(bu.accounts, 2).projectedGrowthPct)).toBeGreaterThanOrEqual(-5);
    }
    expect(ofType(ACCOUNTS, 'Renewal').length).toBeGreaterThan(0);
    expect(GROWTH_TARGET_PCT).toBe(15);
  });
});
