import {ComparisonTable} from '../../../sales-performance/src/components/ComparisonTable';
import type {Unit} from '../../../sales-performance/src/model/hierarchy';
import type {TalkingPoint} from '../../../sales-performance/src/model/talkingPoints';
import {money, pct, signedPct, times} from '../../../sales-performance/src/model/format';
import {growthFigures, growthSeries, identifiedUpside, isActive, renewalAtRisk} from '../model/growth';
import type {GrowthUnit} from '../model/growthHierarchy';
import {salesGrowthMetrics} from '../model/salesGrowthMetrics';
import {growthTalkingPoints} from '../model/growthTalkingPoints';

function discussion(unit: GrowthUnit, siblings: readonly GrowthUnit[]): TalkingPoint[] {
  if (unit.level !== 'bu') return growthTalkingPoints(unit, siblings);
  const f = growthFigures(unit.accounts, 2);
  const active = unit.accounts.flatMap(a => a.opportunities.filter(isActive));
  switch (unit.key) {
    case 'banking': {
      const takeover = active.filter(o => o.type === 'Competitor takeover').sort((a, b) => b.tcv - a.tcv)[0];
      return [{rag: 'amber', text: `${takeover.competitors[0]} takeover: ${money(takeover.tcv)} · ${pct(takeover.winPct!)} win`}, {rag: 'amber', text: `Highest wallet share; growth ${signedPct(f.ytdGrowthPct)}`}];
    }
    case 'insurance': {
      const renewal = active.filter(o => o.type === 'Renewal').sort((a, b) => renewalAtRisk(b) - renewalAtRisk(a))[0];
      return [{rag: 'red', text: `Key renewal: ${money(renewalAtRisk(renewal))} at risk`}, {rag: 'amber', text: 'Data & AI is the biggest white space'}];
    }
    case 'travel': return [{rag: 'green', text: `Expansion drives ${signedPct(f.projectedGrowthPct)} projected growth`}, {rag: 'amber', text: 'Accenture on the two biggest deals'}];
    case 'healthcare': return [{rag: 'amber', text: `YTD ${signedPct(f.ytdGrowthPct)}; projected ${signedPct(f.projectedGrowthPct)}`}, {rag: 'red', text: `${times(f.coverage)} coverage · ${money(identifiedUpside(unit.accounts))} upside`}];
    default: return growthTalkingPoints(unit, siblings);
  }
}
export function GrowthTable({title, nameHeader, rows, onSelect}: {title: string; nameHeader: string; rows: readonly GrowthUnit[]; onSelect: (unit: GrowthUnit) => void}) {
  const units: Unit[] = rows.map(r => ({key: r.key, name: r.name, owner: r.owner, selection: r.selection, accounts: [], projects: [], parts: []}));
  const original = (u: Unit) => rows.find(r => r.key === u.key)!;
  return <ComparisonTable title={title} nameHeader={nameHeader} rows={units} metrics={salesGrowthMetrics(rows[0])}
    figuresFor={u => growthSeries(original(u).accounts)} talkingPointsFor={u => discussion(original(u), rows)} onSelect={u => onSelect(original(u))} />;
}
