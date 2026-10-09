import {count, money, pct, points, round1, score, signedCount, signedMoney, signedPct, signedScore, times} from './format';
import type {DeliveryFigures, SalesFigures} from './rollup';

export type Rag = 'green' | 'amber' | 'red';

export interface MetricDef<F> {
  key: string;
  label: string;
  /** One-sentence formula shown in the card tooltip */
  formula: string;
  /** RAG thresholds in plain English, shown under the formula */
  thresholds: string;
  value: (f: F) => number;
  target: (f: F) => number;
  rag: (f: F) => Rag;
  format: (value: number) => string;
  targetText: (f: F) => string;
  varianceText: (f: F) => string;
  /** Extra line on the KPI card */
  cardNote: (f: F) => string;
  /** Small line under the value in comparison tables; gets all three quarters */
  cellNote: (series: readonly F[]) => string;
}

const current = <F,>(series: readonly F[]) => series[series.length - 1];

export const ragOfAttainment = (actual: number, target: number): Rag => {
  const attainment = target === 0 ? 1 : actual / target;
  return attainment >= 1 ? 'green' : attainment >= 0.95 ? 'amber' : 'red';
};

export const ragOfMargin = (actual: number, target: number): Rag => {
  const gap = round1(actual) - round1(target);
  return gap >= 0 ? 'green' : gap >= -1.5 ? 'amber' : 'red';
};

const ragAtLeast = (value: number, green: number, amber: number): Rag =>
  round1(value) >= green ? 'green' : round1(value) >= amber ? 'amber' : 'red';

const ragAtMost = (value: number, green: number, amber: number): Rag =>
  round1(value) <= green ? 'green' : round1(value) <= amber ? 'amber' : 'red';

export const ragOfCoverage = (coverage: number) => ragAtLeast(coverage, 3.0, 2.5);
export const ragOfWinRate = (winRatePct: number) => ragAtLeast(winRatePct, 40, 30);
export const ragOfGrowth = (growthPct: number) => ragAtLeast(growthPct, 8, 4);
export const ragOfUtilisation = (utilisationPct: number) => ragAtLeast(utilisationPct, 80, 75);
export const ragOfCsat = (csat: number) => ragAtLeast(csat, 4.2, 3.8);
export const ragOfOnTime = (onTimePct: number) => ragAtLeast(onTimePct, 90, 85);
export const ragOfEscalations = (open: number): Rag => (open <= 0 ? 'green' : open === 1 ? 'amber' : 'red');
export const ragOfAttrition = (attritionPct: number) => ragAtMost(attritionPct, 12, 15);

const attainmentText = (actual: number, target: number) =>
  `${signedMoney(actual - target)} (${signedPct(100 * (actual / target - 1))})`;
const pointsGap = (actual: number, target: number) => points(round1(actual) - round1(target));

const ATTAINMENT_RULE = 'Green at 100% of target or more, amber from 95%, red below 95%.';
const MARGIN_RULE = 'Green at or above target, amber up to 1.5 points below, red more than 1.5 points below.';

const revenue: MetricDef<SalesFigures> = {
  key: 'revenue',
  label: 'Revenue',
  formula: 'Revenue realised in the quarter, compared with the revenue target.',
  thresholds: ATTAINMENT_RULE,
  value: f => f.revenue,
  target: f => f.revenueTarget,
  rag: f => ragOfAttainment(f.revenue, f.revenueTarget),
  format: money,
  targetText: f => `Target ${money(f.revenueTarget)}`,
  varianceText: f => attainmentText(f.revenue, f.revenueTarget),
  cardNote: f => `Year-on-year growth ${signedPct(f.revenueGrowthPct)}`,
  cellNote: s => `YoY ${signedPct(s[0].revenueGrowthPct)} → ${signedPct(current(s).revenueGrowthPct)}`,
};

const grossMargin: MetricDef<SalesFigures> = {
  key: 'grossMargin',
  label: 'Gross margin',
  formula: 'Gross margin = (revenue − delivery cost) ÷ revenue; the target is the revenue-weighted account target.',
  thresholds: MARGIN_RULE,
  value: f => f.grossMarginPct,
  target: f => f.grossMarginTargetPct,
  rag: f => ragOfMargin(f.grossMarginPct, f.grossMarginTargetPct),
  format: pct,
  targetText: f => `Target ${pct(f.grossMarginTargetPct)}`,
  varianceText: f => pointsGap(f.grossMarginPct, f.grossMarginTargetPct),
  cardNote: f => `Delivery cost ${money(f.deliveryCost)}`,
  cellNote: s => `Target ${pct(current(s).grossMarginTargetPct)}`,
};

const bookings: MetricDef<SalesFigures> = {
  key: 'bookings',
  label: 'Bookings',
  formula: 'Bookings = value of orders signed in the quarter; book-to-bill = bookings ÷ revenue.',
  thresholds: ATTAINMENT_RULE,
  value: f => f.bookings,
  target: f => f.bookingsTarget,
  rag: f => ragOfAttainment(f.bookings, f.bookingsTarget),
  format: money,
  targetText: f => `Target ${money(f.bookingsTarget)}`,
  varianceText: f => attainmentText(f.bookings, f.bookingsTarget),
  cardNote: f => `Book-to-bill ${times(f.bookToBill)}`,
  cellNote: s => `Book-to-bill ${times(current(s).bookToBill)}`,
};

const pipeline: MetricDef<SalesFigures> = {
  key: 'pipeline',
  label: 'Pipeline',
  formula: "Qualified pipeline value; coverage = pipeline ÷ next quarter's bookings target, aiming for 3.0x.",
  thresholds: 'Green at 3.0x coverage or more, amber from 2.5x, red below 2.5x.',
  value: f => f.pipeline,
  target: f => 3 * f.nextQuarterBookingsTarget,
  rag: f => ragOfCoverage(f.pipelineCoverage),
  format: money,
  targetText: f => `Target ${money(3 * f.nextQuarterBookingsTarget)}`,
  varianceText: f => signedMoney(f.pipeline - 3 * f.nextQuarterBookingsTarget),
  cardNote: f => `Coverage ${times(f.pipelineCoverage)} of next-quarter target`,
  cellNote: s => `${times(current(s).pipelineCoverage)} coverage`,
};

const winRate: MetricDef<SalesFigures> = {
  key: 'winRate',
  label: 'Win rate',
  formula: 'Win rate = value won ÷ (value won + value lost) in the quarter.',
  thresholds: 'Green at 40% or more, amber from 30%, red below 30%.',
  value: f => f.winRatePct,
  target: () => 40,
  rag: f => ragOfWinRate(f.winRatePct),
  format: pct,
  targetText: () => `Target ${pct(40)}`,
  varianceText: f => pointsGap(f.winRatePct, 40),
  cardNote: f => `Won ${money(f.wonValue)} · lost ${money(f.lostValue)}`,
  cellNote: s => `Won ${money(current(s).wonValue)}`,
};

const accountGrowth: MetricDef<SalesFigures> = {
  key: 'accountGrowth',
  label: 'Account growth',
  formula: "Account revenue growth = this quarter's account revenue ÷ the same quarter last year − 1.",
  thresholds: 'Green at 8% or more (the FY27 plan growth), amber from 4%, red below 4%.',
  value: f => f.revenueGrowthPct,
  target: () => 8,
  rag: f => ragOfGrowth(f.revenueGrowthPct),
  format: pct,
  targetText: () => `Target ${pct(8)}`,
  varianceText: f => pointsGap(f.revenueGrowthPct, 8),
  cardNote: f => `${money(f.revenue)} vs ${money(f.priorYearRevenue)} a year ago`,
  cellNote: s => `Last year ${money(current(s).priorYearRevenue)}`,
};

const newPipeline: MetricDef<SalesFigures> = {
  key: 'newPipeline',
  label: 'New pipeline',
  formula: 'Value of new qualified pipeline created this quarter, compared with the target.',
  thresholds: ATTAINMENT_RULE,
  value: f => f.newPipeline,
  target: f => f.newPipelineTarget,
  rag: f => ragOfAttainment(f.newPipeline, f.newPipelineTarget),
  format: money,
  targetText: f => `Target ${money(f.newPipelineTarget)}`,
  varianceText: f => attainmentText(f.newPipeline, f.newPipelineTarget),
  cardNote: f => `Added this quarter, ${Math.round((100 * f.newPipeline) / f.newPipelineTarget)}% of target`,
  cellNote: s => `Target ${money(current(s).newPipelineTarget)}`,
};

const utilisation: MetricDef<DeliveryFigures> = {
  key: 'utilisation',
  label: 'Utilisation',
  formula: 'Utilisation = billable FTE ÷ total FTE.',
  thresholds: 'Green at 80% or more, amber from 75%, red below 75%.',
  value: f => f.utilisationPct,
  target: () => 80,
  rag: f => ragOfUtilisation(f.utilisationPct),
  format: pct,
  targetText: () => `Target ${pct(80)}`,
  varianceText: f => pointsGap(f.utilisationPct, 80),
  cardNote: f => `${count(f.billableFte)} of ${count(f.totalFte)} FTE billable`,
  cellNote: s => `${count(current(s).billableFte)} of ${count(current(s).totalFte)} FTE`,
};

const projectMargin: MetricDef<DeliveryFigures> = {
  key: 'projectMargin',
  label: 'Project gross margin',
  formula: 'Project gross margin = (project revenue − project cost) ÷ project revenue, against the revenue-weighted plan.',
  thresholds: MARGIN_RULE,
  value: f => f.projectMarginPct,
  target: f => f.marginPlanPct,
  rag: f => ragOfMargin(f.projectMarginPct, f.marginPlanPct),
  format: pct,
  targetText: f => `Plan ${pct(f.marginPlanPct)}`,
  varianceText: f => pointsGap(f.projectMarginPct, f.marginPlanPct),
  cardNote: f => `Cost ${money(f.cost)} on revenue ${money(f.revenue)}`,
  cellNote: s => `Plan ${pct(current(s).marginPlanPct)}`,
};

const csat: MetricDef<DeliveryFigures> = {
  key: 'csat',
  label: 'Client satisfaction',
  formula: 'Revenue-weighted average of project client-satisfaction scores, out of 5.',
  thresholds: 'Green at 4.2 or more, amber from 3.8, red below 3.8.',
  value: f => f.csat,
  target: () => 4.2,
  rag: f => ragOfCsat(f.csat),
  format: score,
  targetText: () => 'Target 4.2 out of 5',
  varianceText: f => signedScore(round1(f.csat) - 4.2),
  cardNote: f => (f.projectCount === 1 ? 'Latest client survey score' : `Weighted by revenue across ${f.projectCount} projects`),
  cellNote: () => 'out of 5',
};

const onTime: MetricDef<DeliveryFigures> = {
  key: 'onTime',
  label: 'On-time delivery',
  formula: 'On-time delivery = milestones met on time ÷ milestones due in the quarter.',
  thresholds: 'Green at 90% or more, amber from 85%, red below 85%.',
  value: f => f.onTimePct,
  target: () => 90,
  rag: f => ragOfOnTime(f.onTimePct),
  format: pct,
  targetText: () => `Target ${pct(90)}`,
  varianceText: f => pointsGap(f.onTimePct, 90),
  cardNote: f => `${count(f.milestonesMet)} of ${count(f.milestonesDue)} milestones on time`,
  cellNote: s => `${count(current(s).milestonesMet)} of ${count(current(s).milestonesDue)} milestones`,
};

const escalations: MetricDef<DeliveryFigures> = {
  key: 'escalations',
  label: 'Open escalations',
  formula: 'Number of client escalations still open at the end of the quarter.',
  thresholds: 'Green at none, amber at 1, red at 2 or more.',
  value: f => f.openEscalations,
  target: () => 0,
  rag: f => ragOfEscalations(f.openEscalations),
  format: count,
  targetText: () => 'Target 0',
  varianceText: f => signedCount(f.openEscalations),
  cardNote: () => 'Open at quarter end',
  cellNote: () => 'open',
};

const attrition: MetricDef<DeliveryFigures> = {
  key: 'attrition',
  label: 'Team attrition',
  formula: 'People who left the team in the last 12 months ÷ average team size.',
  thresholds: 'Green at 12% or less, amber up to 15%, red above 15%.',
  value: f => f.attritionPct,
  target: () => 12,
  rag: f => ragOfAttrition(f.attritionPct),
  format: pct,
  targetText: () => `Target ${pct(12)} or less`,
  varianceText: f => pointsGap(f.attritionPct, 12),
  cardNote: f => `Trailing 12 months · team of ${count(f.totalFte)}`,
  cellNote: () => 'trailing 12 months',
};

export const SALES_METRICS = [revenue, grossMargin, bookings, pipeline, winRate] as const;
export const CLIENT_PARTNER_METRICS = [...SALES_METRICS, accountGrowth, newPipeline] as const;
export const DELIVERY_METRICS = [utilisation, projectMargin, csat, onTime] as const;
export const DELIVERY_MANAGER_METRICS = [...DELIVERY_METRICS, escalations, attrition] as const;
