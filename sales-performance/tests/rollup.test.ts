import {describe, expect, it} from 'vitest';
import {BUSINESS_UNITS, CURRENT_QUARTER, type Account, type Project} from '../src/data/staticData';
import {money, pct, signedMoney} from '../src/model/format';
import {companyUnit, resolveView, type Unit} from '../src/model/hierarchy';
import {
  ACCOUNT_PROJECT_METRICS,
  CLIENT_PARTNER_METRICS,
  DELIVERY_MANAGER_METRICS,
  DELIVERY_METRICS,
  ragOfCoverage,
  ragOfMargin,
} from '../src/model/metrics';
import {deliveryFigures, salesFigures, sumDelivery, sumSales} from '../src/model/rollup';
import {deliveryTalkingPoints, redProjectMeasures, salesTalkingPoints} from '../src/model/talkingPoints';

const QUARTERS = [0, 1, 2];
const NOW = CURRENT_QUARTER;
const allAccounts = BUSINESS_UNITS.flatMap(bu => bu.subBus.flatMap(s => s.accounts));
const allProjects = BUSINESS_UNITS.flatMap(bu => bu.subBus.flatMap(s => s.projects));
const sumOf = <T,>(items: readonly T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0);

/** Every unit in the tree that has parts, on both pages. */
function parents(unit: Unit): Unit[] {
  return unit.parts.length === 0 ? [] : [unit, ...unit.parts.flatMap(parents)];
}

describe('org structure', () => {
  it('has 4 BUs, 8 Sub-BUs, 24 accounts and 32 projects', () => {
    expect(BUSINESS_UNITS).toHaveLength(4);
    expect(BUSINESS_UNITS.flatMap(bu => bu.subBus)).toHaveLength(8);
    expect(allAccounts).toHaveLength(24);
    expect(allProjects).toHaveLength(32);
    expect(new Set(allAccounts.map(a => a.clientPartner)).size).toBe(24);
    expect(new Set(allProjects.map(p => p.deliveryManager)).size).toBe(32);
  });

  it('gives the first account of each Sub-BU two projects and the others one', () => {
    for (const subBu of BUSINESS_UNITS.flatMap(bu => bu.subBus)) {
      expect(subBu.accounts).toHaveLength(3);
      expect(subBu.projects).toHaveLength(4);
      const projectsPerAccount = subBu.accounts.map(a => subBu.projects.filter(p => p.accountId === a.id).length);
      expect(projectsPerAccount).toEqual([2, 1, 1]);
    }
  });
});

describe('children add up to their parents', () => {
  const salesKeys = ['revenue', 'revenueTarget', 'deliveryCost', 'bookings', 'bookingsTarget', 'pipeline', 'nextQuarterBookingsTarget'] as const;
  const deliveryKeys = ['revenue', 'cost', 'billableFte', 'totalFte', 'milestonesDue', 'milestonesMet'] as const;

  for (const quarter of QUARTERS) {
    it(`sales amounts roll up at every level in quarter ${quarter}`, () => {
      for (const parent of parents(companyUnit('sales'))) {
        const total = sumSales(parent.accounts, quarter);
        for (const key of salesKeys) {
          expect(sumOf(parent.parts, part => sumSales(part.accounts, quarter)[key]), `${parent.name} ${key}`).toBe(total[key]);
        }
      }
    });

    it(`delivery amounts roll up at every level in quarter ${quarter}`, () => {
      for (const parent of parents(companyUnit('delivery'))) {
        const total = sumDelivery(parent.projects, quarter);
        for (const key of deliveryKeys) {
          expect(sumOf(parent.parts, part => sumDelivery(part.projects, quarter)[key]), `${parent.name} ${key}`).toBe(total[key]);
        }
      }
    });

    it(`project revenue and cost tie back to account revenue and delivery cost in quarter ${quarter}`, () => {
      for (const account of allAccounts) {
        const projects = allProjects.filter(p => p.accountId === account.id);
        expect(sumOf(projects, p => p.quarters[quarter].revenue)).toBe(account.quarters[quarter].revenue);
        expect(sumOf(projects, p => p.quarters[quarter].cost)).toBe(account.quarters[quarter].deliveryCost);
      }
    });
  }

  it('company revenue target is $35.0M in FY27 and actual revenue is $35.8M this quarter', () => {
    expect(salesFigures(allAccounts, 1).revenueTarget).toBe(35000);
    expect(salesFigures(allAccounts, 2).revenueTarget).toBe(35000);
    expect(salesFigures(allAccounts, 2).revenue).toBe(35800);
  });
});

describe('weighted averages', () => {
  const weighted = <T,>(items: readonly T[], value: (item: T) => number, weight: (item: T) => number) =>
    sumOf(items, i => value(i) * weight(i)) / sumOf(items, weight);

  for (const quarter of QUARTERS) {
    it(`gross margin and its target are revenue-weighted averages of the parts in quarter ${quarter}`, () => {
      for (const parent of parents(companyUnit('sales'))) {
        const parentFigures = salesFigures(parent.accounts, quarter);
        const parts = parent.parts.map(p => salesFigures(p.accounts, quarter));
        expect(parentFigures.grossMarginPct).toBeCloseTo(weighted(parts, f => f.grossMarginPct, f => f.revenue), 9);
        expect(parentFigures.grossMarginTargetPct).toBeCloseTo(weighted(parts, f => f.grossMarginTargetPct, f => f.revenue), 9);
      }
    });

    it(`utilisation, project margin and CSAT are weighted averages of the parts in quarter ${quarter}`, () => {
      for (const parent of parents(companyUnit('delivery'))) {
        const parentFigures = deliveryFigures(parent.projects, quarter);
        const parts = parent.parts.map(p => deliveryFigures(p.projects, quarter));
        expect(parentFigures.utilisationPct).toBeCloseTo(weighted(parts, f => f.utilisationPct, f => f.totalFte), 9);
        expect(parentFigures.projectMarginPct).toBeCloseTo(weighted(parts, f => f.projectMarginPct, f => f.revenue), 9);
        expect(parentFigures.marginPlanPct).toBeCloseTo(weighted(parts, f => f.marginPlanPct, f => f.revenue), 9);
        expect(parentFigures.csat).toBeCloseTo(weighted(parts, f => f.csat, f => f.revenue), 9);
        expect(parentFigures.onTimePct).toBeCloseTo(weighted(parts, f => f.onTimePct, f => f.milestonesDue), 9);
      }
    });
  }

  it('company CSAT matches a hand-computed revenue-weighted average of all 32 projects', () => {
    const rows = allProjects.map(p => p.quarters[NOW]);
    const expected = sumOf(rows, r => r.revenue * r.csat) / sumOf(rows, r => r.revenue);
    expect(deliveryFigures(allProjects, NOW).csat).toBeCloseTo(expected, 12);
  });
});

describe('static data is simple and round', () => {
  const moneyKeys: (keyof Account['quarters'][number])[] = [
    'revenue', 'revenueTarget', 'deliveryCost', 'bookings', 'bookingsTarget', 'pipeline', 'nextQuarterBookingsTarget',
    'wonValue', 'lostValue', 'newPipeline', 'newPipelineTarget', 'priorYearRevenue',
  ];
  const oneDecimal = (value: number) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;

  it('stores money to the nearest $10K', () => {
    for (const account of allAccounts) {
      for (const quarter of account.quarters) for (const key of moneyKeys) expect(quarter[key] % 10, `${account.name} ${key}`).toBe(0);
      for (const deal of account.openDeals) expect(deal.value % 10).toBe(0);
    }
    for (const project of allProjects) for (const q of project.quarters) expect([q.revenue % 10, q.cost % 10]).toEqual([0, 0]);
  });

  it('stores percentages and CSAT with one decimal', () => {
    for (const account of allAccounts) for (const q of account.quarters) expect(oneDecimal(q.marginTarget)).toBe(true);
    for (const project of allProjects as Project[]) {
      for (const q of project.quarters) {
        expect([q.marginPlan, q.csat, q.attritionPct].every(oneDecimal)).toBe(true);
        expect(q.milestonesMet).toBeLessThanOrEqual(q.milestonesDue);
        expect(q.billableFte).toBeLessThanOrEqual(q.totalFte);
      }
    }
  });

  it('produces finite values for every metric at every level', () => {
    const units = (unit: Unit): Unit[] => [unit, ...unit.parts.flatMap(units)];
    for (const unit of units(companyUnit('sales'))) {
      for (const q of QUARTERS) for (const m of CLIENT_PARTNER_METRICS) expect(Number.isFinite(m.value(salesFigures(unit.accounts, q)))).toBe(true);
    }
    for (const unit of units(companyUnit('delivery'))) {
      for (const q of QUARTERS) for (const m of DELIVERY_MANAGER_METRICS) expect(Number.isFinite(m.value(deliveryFigures(unit.projects, q)))).toBe(true);
    }
  });
});

describe('projects are the same on both tabs', () => {
  const locate = (projectId: string) => {
    const bu = BUSINESS_UNITS.find(b => b.subBus.some(s => s.projects.some(p => p.id === projectId)))!;
    const subBu = bu.subBus.find(s => s.projects.some(p => p.id === projectId))!;
    const project = subBu.projects.find(p => p.id === projectId)!;
    return {bu, subBu, project};
  };
  const [revenueColumn, marginColumn] = ACCOUNT_PROJECT_METRICS;
  const marginOnDelivery = DELIVERY_METRICS.find(m => m.key === 'projectMargin')!;

  for (const quarter of QUARTERS) {
    it(`project revenue and revenue targets add up to the account in quarter ${quarter}`, () => {
      for (const account of allAccounts) {
        const projects = allProjects.filter(p => p.accountId === account.id);
        expect(sumOf(projects, p => p.quarters[quarter].revenue), account.name).toBe(account.quarters[quarter].revenue);
        expect(sumOf(projects, p => p.quarters[quarter].revenueTarget), account.name).toBe(account.quarters[quarter].revenueTarget);
      }
    });
  }

  it('shows each project with the same name, Delivery Manager, revenue and gross margin on Sales and Delivery', () => {
    for (const {id} of allProjects) {
      const {bu, subBu, project} = locate(id);
      const salesView = resolveView('sales', {buId: bu.id, subBuId: subBu.id, personId: project.accountId});
      const deliveryView = resolveView('delivery', {buId: bu.id, subBuId: subBu.id, personId: project.id});
      const onSales = salesView.projectRows.find(row => row.key === project.id)!;
      const [onDelivery] = deliveryView.projectRows;

      expect(salesView.level).toBe('person');
      expect(deliveryView.projectRows).toHaveLength(1);
      expect(onSales.name).toBe(onDelivery.name);
      expect(onSales.owner).toBe(deliveryView.unit.name);
      for (const quarter of QUARTERS) {
        const salesFigures = deliveryFigures(onSales.projects, quarter);
        const deliveryFiguresForRow = deliveryFigures(onDelivery.projects, quarter);
        expect(revenueColumn.value(salesFigures)).toBe(deliveryFiguresForRow.revenue);
        expect(marginColumn.value(salesFigures)).toBe(marginOnDelivery.value(deliveryFiguresForRow));
        expect(marginColumn.target(salesFigures)).toBe(marginOnDelivery.target(deliveryFiguresForRow));
      }
    }
  });

  it('lists 1 or 2 projects per Client Partner, matching the account', () => {
    for (const account of allAccounts) {
      const {bu, subBu} = locate(allProjects.find(p => p.accountId === account.id)!.id);
      const rows = resolveView('sales', {buId: bu.id, subBuId: subBu.id, personId: account.id}).projectRows;
      expect(rows.map(r => r.key)).toEqual(allProjects.filter(p => p.accountId === account.id).map(p => p.id));
      expect([1, 2]).toContain(rows.length);
    }
  });
});

describe('formatting', () => {
  it('shows money as $35.8M and $1.4M, and only small amounts in $K', () => {
    expect(money(35800)).toBe('$35.8M');
    expect(money(1440)).toBe('$1.4M');
    expect(money(650)).toBe('$0.7M');
    expect(money(40)).toBe('$40K');
    expect(signedMoney(-3420)).toBe('\u2212$3.4M');
    expect(pct(32.84)).toBe('32.8%');
  });
});

describe('CEO stories', () => {
  const company = companyUnit('sales');
  const bu = (id: string) => company.parts.find(u => u.key === id)!;
  const now = (unit: Unit, quarter = NOW) => salesFigures(unit.accounts, quarter);
  const points = (id: string) => salesTalkingPoints(bu(id), company.parts).map(p => p.text).join(' | ');

  it('Banking is the largest BU, its growth slows and Corporate Banking depends on one account', () => {
    const revenues = company.parts.map(u => now(u).revenue);
    expect(now(bu('banking')).revenue).toBe(Math.max(...revenues));
    const growth = QUARTERS.map(q => now(bu('banking'), q).revenueGrowthPct);
    expect(growth[0]).toBeGreaterThan(growth[1]);
    expect(growth[1]).toBeGreaterThan(growth[2]);
    expect(points('banking')).toMatch(/Growth slowing/);
    expect(points('banking')).toMatch(/Corporate Banking depends on Sterling Commercial Bank/);
  });

  it('Insurance has the highest margin and misses bookings because a large renewal is unsigned', () => {
    const margins = company.parts.map(u => now(u).grossMarginPct);
    expect(now(bu('insurance')).grossMarginPct).toBe(Math.max(...margins));
    expect(now(bu('insurance')).bookings).toBeLessThan(0.95 * now(bu('insurance')).bookingsTarget);
    expect(points('insurance')).toMatch(/renewal .* not yet signed/);
  });

  it('Travel beats revenue target but misses margin because of Airlines, with one red Airlines project', () => {
    const travel = now(bu('travel'));
    expect(travel.revenue).toBeGreaterThan(travel.revenueTarget);
    expect(ragOfMargin(travel.grossMarginPct, travel.grossMarginTargetPct)).toBe('red');
    expect(points('travel')).toMatch(/overrun in Airlines/);
    const airlines = BUSINESS_UNITS.find(b => b.id === 'travel')!.subBus.find(s => s.id === 'airlines')!;
    expect(airlines.projects.filter(p => redProjectMeasures(p).length > 0)).toHaveLength(1);
    const delivery = companyUnit('delivery');
    const travelDelivery = delivery.parts.find(u => u.key === 'travel')!;
    expect(deliveryTalkingPoints(travelDelivery, delivery.parts)[0]).toMatchObject({rag: 'red'});
  });

  it('Healthcare is the smallest and fastest growing BU, with pipeline coverage below 2.5x', () => {
    const healthcare = now(bu('healthcare'));
    expect(healthcare.revenue).toBe(Math.min(...company.parts.map(u => now(u).revenue)));
    expect(healthcare.revenueGrowthPct).toBe(Math.max(...company.parts.map(u => now(u).revenueGrowthPct)));
    expect(healthcare.pipelineCoverage).toBeLessThan(2.5);
    expect(ragOfCoverage(healthcare.pipelineCoverage)).toBe('red');
    expect(points('healthcare')).toMatch(/Fastest growth/);
  });

  it('resolves every level and ignores selections that do not exist', () => {
    expect(resolveView('sales', {}).level).toBe('company');
    expect(resolveView('sales', {buId: 'banking'}).children).toHaveLength(2);
    expect(resolveView('sales', {buId: 'banking', subBuId: 'retail-banking'}).children).toHaveLength(3);
    expect(resolveView('delivery', {buId: 'banking', subBuId: 'retail-banking'}).children).toHaveLength(4);
    expect(resolveView('sales', {buId: 'nope', subBuId: 'retail-banking'}).level).toBe('company');
    expect(resolveView('delivery', {buId: 'travel', subBuId: 'airlines', personId: 'crew-scheduling-platform'}).level).toBe('person');
  });
});
