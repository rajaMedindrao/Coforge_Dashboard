import type {MetricDef, Rag} from '../../../sales-performance/src/model/metrics';
import {RAG_COLOURS} from '../../../sales-performance/src/theme';
import {money, pct, points, signedPct, times} from '../../../sales-performance/src/model/format';
import {MARKET_GROWTH} from '../data/growthData';
import {identifiedUpside, type GrowthFigures} from './growth';
import type {GrowthUnit} from './growthHierarchy';
import {GROWTH_METRICS} from './growthMetrics';

// Non-status charts use the Sales green palette without introducing a status dot.
// Non-enumerable keeps the shared Sales/Delivery legend unchanged.
Object.defineProperty(RAG_COLOURS, 'neutral', {value: {...RAG_COLOURS.green, label: 'No status'}, configurable: true, enumerable: false});
export function salesGrowthMetrics(unit: GrowthUnit): MetricDef<GrowthFigures>[] {
  const market = unit.level === 'company'
    ? unit.accounts.reduce((t, a) => t + MARKET_GROWTH[a.buId][2] * a.fy26Revenue, 0) / unit.accounts.reduce((t, a) => t + a.fy26Revenue, 0)
    : unit.level === 'bu' ? MARKET_GROWTH[unit.key][2] : undefined;
  return GROWTH_METRICS.filter(m => m.key !== 'largeDeals').map(m => {
    const metric: MetricDef<GrowthFigures> = {
      ...m, rag: f => m.rag(f) as Rag,
      target: m.chart.target ?? (() => 0), format: m.chart.format,
      value: m.value, cellNote: s => m.cellNote(s[s.length - 1]),
    };
    switch (m.key) {
      case 'revenueGrowth': metric.format = signedPct; metric.cardNote = f => `Projected FY27 ${signedPct(f.projectedGrowthPct)}${market === undefined ? '' : ` · Market ${signedPct(market)}`}`; break;
      case 'untappedWallet': metric.targetText = f => `IT spend ${money(f.itSpend)}`; metric.varianceText = () => ''; break;
      case 'pipelineCoverage': metric.label = 'Pipeline coverage'; metric.value = f => f.targetSecured ? -1 : f.coverage; metric.format = n => n === -1 ? 'Target secured' : times(n); metric.targetText = () => 'Target 2.0x'; metric.varianceText = f => f.targetSecured ? '' : `${(f.coverage - 2).toFixed(1)}x`; metric.cardNote = f => `Expected ${money(f.expectedFy27)} · Upside ${money(identifiedUpside(unit.accounts))}`; break;
      case 'dealsWon': metric.label = 'Win rate'; metric.value = f => f.winRatePct; metric.format = pct; metric.target = () => 40; metric.targetText = () => 'Target 40.0%'; metric.varianceText = f => points(f.winRatePct - 40); metric.cardNote = f => `Won ${money(f.wonYtd)} vs ${money(f.priorWonYtd)} last year`; metric.cellNote = s => `Won ${money(s[s.length - 1].wonYtd)} vs ${money(s[s.length - 1].priorWonYtd)}`; break;
      case 'renewalsAtRisk': metric.targetText = f => `Target ≤ ${money(f.fy26Revenue * .05)}`; metric.varianceText = () => ''; metric.cardNote = f => `${pct(f.renewalsAtRiskPct)} of FY26 revenue`; break;
    }
    return metric;
  });
}
