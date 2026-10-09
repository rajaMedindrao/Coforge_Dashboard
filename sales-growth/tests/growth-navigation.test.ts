import {describe, expect, it} from 'vitest';
import {ACCOUNTS, currentInputs, expectedFy27Revenue, figuresFrom, growthBridge, growthFigures, isActive, sumInputs} from '../src/model/growth';
import {resolveGrowthView} from '../src/model/growthHierarchy';

describe('growth strip and opportunity routes', () => {
  it('reconciles each account strip with its cards and every hierarchy roll-up', () => {
    for (const accounts of [ACCOUNTS, ...ACCOUNTS.map(a => [a]), ...['banking', 'insurance', 'travel', 'healthcare'].map(id => ACCOUNTS.filter(a => a.buId === id))]) {
      const b = growthBridge(accounts);
      const f = growthFigures(accounts, 2);
      expect(b.fy26 + b.securedChange + b.renewals + b.newWork).toBeCloseTo(b.projected, 8);
      expect(b.fy26 + b.securedChange).toBeCloseTo(f.securedFy27, 8);
      expect(b.projected).toBeCloseTo(f.projected, 8);
      expect(b.target).toBeCloseTo(f.target, 8);
      expect(b.gap).toBeCloseTo(f.gapToTarget, 8);
    }
  });
  it('excludes even very large Potential opportunities from all current KPI totals and the growth strip', () => {
    for (const a of ACCOUNTS) {
      const without = {...a, opportunities: a.opportunities.filter(o => o.status !== 'Potential')};
      const inflated = {...a, opportunities: a.opportunities.map(o => o.status === 'Potential' ? {...o, tcv: 1e9, annualValue: 1e9} : o)};
      expect(currentInputs(without)).toEqual(currentInputs(a));
      expect(currentInputs(inflated)).toEqual(currentInputs(a));
      expect(growthBridge([inflated])).toEqual(growthBridge([a]));
      expect(growthBridge([without])).toEqual(growthBridge([a]));
    }
    const active = ACCOUNTS.flatMap(a => a.opportunities.filter(isActive));
    expect(figuresFrom(sumInputs(ACCOUNTS.map(currentInputs))).expectedFy27).toBeCloseTo(active.reduce((s, o) => s + expectedFy27Revenue(o), 0), 8);
  });
  it('resolves active and Potential opportunity URLs and falls back safely on invalid IDs', () => {
    for (const a of ACCOUNTS) {
      const selection = {buId: a.buId, subBuId: a.subBuId, accountId: a.id};
      for (const o of a.opportunities.filter(o => o.status === 'Active' || o.status === 'Potential')) {
        const v = resolveGrowthView({...selection, opportunityId: o.id});
        expect(v.level).toBe('opportunity'); expect(v.opportunity).toBe(o); expect(v.account?.id).toBe(a.id);
      }
      expect(resolveGrowthView({...selection, opportunityId: 'missing'}).level).toBe('account');
    }
  });
});
