import {money, pct, points, round1, signedMoney, signedPct, times} from '../../../sales-performance/src/model/format';
import type {Rag} from '../../../sales-performance/src/model/metrics';
import {GROWTH_TARGET_PCT, type GrowthFigures} from './growth';

/** "neutral" is for cards with no RAG (untapped wallet, large deals). */
export type GrowthRag = Rag | 'neutral';

export interface GrowthMetric {
  key: string;
  label: string;
  formula: string;
  thresholds: string;
  value: (f: GrowthFigures) => number;
  display: (f: GrowthFigures) => string;
  rag: (f: GrowthFigures) => GrowthRag;
  targetText: (f: GrowthFigures) => string;
  varianceText: (f: GrowthFigures) => string;
  cardNote: (f: GrowthFigures) => string;
  /** RAG of the figure in the card note, when it has one */
  noteRag?: (f: GrowthFigures) => Rag;
  /** Small line under the value in comparison tables */
  cellNote: (f: GrowthFigures) => string;
  /** What the three-quarter mini chart plots */
  chart: {
    label: string;
    value: (f: GrowthFigures) => number;
    target?: (f: GrowthFigures) => number;
    format: (value: number) => string;
    tooltip?: (f: GrowthFigures) => string;
  };
}

const ragAtLeast = (value: number, green: number, amber: number): Rag =>
  round1(value) >= green ? 'green' : round1(value) >= amber ? 'amber' : 'red';
const ragAtMost = (value: number, green: number, amber: number): Rag =>
  round1(value) <= green ? 'green' : round1(value) <= amber ? 'amber' : 'red';

export const ragOfGrowth = (growthPct: number) => ragAtLeast(growthPct, 15, 12);
export const ragOfCoverage = (f: Pick<GrowthFigures, 'targetSecured' | 'coverage'>): Rag =>
  f.targetSecured ? 'green' : ragAtLeast(f.coverage, 2.0, 1.5);
export const ragOfWinRate = (winRatePct: number) => ragAtLeast(winRatePct, 40, 30);
export const ragOfRenewalRisk = (riskPct: number) => ragAtMost(riskPct, 5, 10);
/** Win % of a single opportunity: green from 60%, amber from 30%. */
export const ragOfWinPct = (winPct: number) => ragAtLeast(winPct, 60, 30);
/** Planned margin of a single opportunity: green from 30%, amber from 27%. */
export const ragOfMarginPct = (marginPct: number) => ragAtLeast(marginPct, 30, 27);

const coverageText = (f: GrowthFigures) => (f.targetSecured ? 'Target secured' : times(f.coverage));
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const revenueGrowth: GrowthMetric = {
  key: 'revenueGrowth',
  label: 'Revenue growth',
  formula: 'FY27 year-to-date revenue ÷ FY26 year-to-date revenue − 1, against the +15% growth target. Projected FY27 growth = (secured FY27 revenue + Σ expected FY27 revenue of Active opportunities) ÷ FY26 revenue − 1.',
  thresholds: 'Green at +15% or more, amber from +12%, red below +12% (same for projected growth).',
  value: f => f.ytdGrowthPct,
  display: f => signedPct(f.ytdGrowthPct),
  rag: f => ragOfGrowth(f.ytdGrowthPct),
  targetText: () => `Target ${signedPct(GROWTH_TARGET_PCT)}`,
  varianceText: f => points(round1(f.ytdGrowthPct) - GROWTH_TARGET_PCT),
  cardNote: f => `Projected FY27 growth ${signedPct(f.projectedGrowthPct)} (${money(f.projected)})`,
  noteRag: f => ragOfGrowth(f.projectedGrowthPct),
  cellNote: f => `Projected ${signedPct(f.projectedGrowthPct)}`,
  chart: {label: 'YTD growth', value: f => f.ytdGrowthPct, target: () => GROWTH_TARGET_PCT, format: signedPct},
};

const untappedWallet: GrowthMetric = {
  key: 'untappedWallet',
  label: 'Untapped wallet',
  formula: "Client's estimated annual IT services spend − our trailing-12-month revenue. Share of wallet = our trailing-12-month revenue ÷ client IT spend.",
  thresholds: 'No RAG: this is the size of the opportunity, not a performance measure.',
  value: f => f.untappedWallet,
  display: f => money(f.untappedWallet),
  rag: () => 'neutral',
  targetText: f => `Client IT spend ${money(f.itSpend)}`,
  varianceText: f => `Ours ${money(f.ttmRevenue)}`,
  cardNote: f => `Share of wallet ${pct(f.shareOfWalletPct)}`,
  cellNote: f => `Share of wallet ${pct(f.shareOfWalletPct)}`,
  chart: {label: 'Untapped wallet', value: f => f.untappedWallet, format: money},
};

const pipelineCoverage: GrowthMetric = {
  key: 'pipelineCoverage',
  label: 'Pipeline vs growth gap',
  formula: 'Σ FY27 revenue if won (Active opportunities) ÷ (FY27 target − secured FY27 revenue). Expected wins = Σ FY27 revenue if won × expected win %.',
  thresholds: 'Green at 2.0x or more, or when secured revenue already meets the target; amber from 1.5x; red below 1.5x.',
  value: f => f.coverage,
  display: coverageText,
  rag: ragOfCoverage,
  targetText: f => (f.targetSecured ? `Secured ${money(f.securedFy27)}` : `Gap ${money(f.growthGap)} · aim 2.0x`),
  varianceText: f => `${money(f.pipelineIfWon)} if won`,
  cardNote: f => `Expected wins ${money(f.expectedFy27)}; gap to target after them ${signedMoney(f.gapToTarget)}`,
  cellNote: f => `Expected wins ${money(f.expectedFy27)}`,
  chart: {
    label: 'Coverage',
    value: f => (f.targetSecured ? 2 : f.coverage),
    target: () => 2,
    format: times,
    tooltip: f => (f.targetSecured ? 'Target secured' : `Coverage ${times(f.coverage)}`),
  },
};

const largeDeals: GrowthMetric = {
  key: 'largeDeals',
  label: 'Large deals in pursuit',
  formula: 'Count and total contract value (TCV) of Active opportunities with TCV of $10M or more.',
  thresholds: 'No RAG: shows how much of the growth rests on big bets.',
  value: f => f.largeDealTcv,
  display: f => (f.largeDealTcv === 0 ? '$0' : money(f.largeDealTcv)),
  rag: () => 'neutral',
  targetText: f => `${plural(f.largeDealCount, 'deal')} ≥ $10M TCV`,
  varianceText: () => 'Active only',
  cardNote: f => (f.largeDealCount === 0 ? 'No Active deal of $10M or more' : `Average ${money(f.largeDealTcv / f.largeDealCount)} TCV per deal`),
  cellNote: f => plural(f.largeDealCount, 'deal'),
  chart: {label: 'Large-deal TCV', value: f => f.largeDealTcv, format: money},
};

const dealsWon: GrowthMetric = {
  key: 'dealsWon',
  label: 'Deals won & win rate',
  formula: 'TCV won FY27 year to date vs the same period of FY26. Win rate = value won ÷ (value won + value lost) over the trailing 12 months, all competitors combined.',
  thresholds: 'RAG on win rate: green at 40% or more, amber from 30%, red below 30%.',
  value: f => f.wonYtd,
  display: f => money(f.wonYtd),
  rag: f => ragOfWinRate(f.winRatePct),
  targetText: f => `FY26 YTD ${money(f.priorWonYtd)}`,
  varianceText: f => signedMoney(f.wonYtd - f.priorWonYtd),
  cardNote: f => `Win rate ${pct(f.winRatePct)} over 12 months (won ${money(f.wonTtm)}, lost ${money(f.lostTtm)})`,
  noteRag: f => ragOfWinRate(f.winRatePct),
  cellNote: f => `Win rate ${pct(f.winRatePct)}`,
  chart: {label: 'Win rate', value: f => f.winRatePct, target: () => 40, format: pct},
};

const renewalsAtRisk: GrowthMetric = {
  key: 'renewalsAtRisk',
  label: 'Renewals at risk',
  formula: 'Σ renewal annual value × (1 − expected win %) for renewals ending in the next 12 months, shown as % of FY26 revenue.',
  thresholds: 'Green at 5% of FY26 revenue or less, amber up to 10%, red above 10%.',
  value: f => f.renewalsAtRisk,
  display: f => money(f.renewalsAtRisk),
  rag: f => ragOfRenewalRisk(f.renewalsAtRiskPct),
  targetText: f => `Green ≤ ${money(f.fy26Revenue * 0.05)}`,
  varianceText: f => `${pct(f.renewalsAtRiskPct)} of FY26`,
  cardNote: f => `${pct(f.renewalsAtRiskPct)} of FY26 revenue ${money(f.fy26Revenue)}, next 12 months`,
  cellNote: f => `${pct(f.renewalsAtRiskPct)} of FY26`,
  chart: {label: 'At risk', value: f => f.renewalsAtRisk, target: f => f.fy26Revenue * 0.05, format: money},
};

export const GROWTH_METRICS: readonly GrowthMetric[] = [revenueGrowth, untappedWallet, pipelineCoverage, largeDeals, dealsWon, renewalsAtRisk];
