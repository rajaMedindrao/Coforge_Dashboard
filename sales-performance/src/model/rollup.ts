import type {Account, Project} from '../data/staticData';

const sum = <T,>(items: readonly T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0);
const ratio = (numerator: number, denominator: number) => (denominator === 0 ? 0 : numerator / denominator);

/** Sales amounts summed over a set of accounts for one quarter (USD thousands). */
export interface SalesTotals {
  revenue: number;
  revenueTarget: number;
  deliveryCost: number;
  bookings: number;
  bookingsTarget: number;
  pipeline: number;
  nextQuarterBookingsTarget: number;
  wonValue: number;
  lostValue: number;
  newPipeline: number;
  newPipelineTarget: number;
  priorYearRevenue: number;
  /** Σ revenue × margin target, used for the revenue-weighted margin target */
  revenueTimesMarginTarget: number;
}

export function sumSales(accounts: readonly Account[], quarter: number): SalesTotals {
  const rows = accounts.map(account => account.quarters[quarter]);
  return {
    revenue: sum(rows, r => r.revenue),
    revenueTarget: sum(rows, r => r.revenueTarget),
    deliveryCost: sum(rows, r => r.deliveryCost),
    bookings: sum(rows, r => r.bookings),
    bookingsTarget: sum(rows, r => r.bookingsTarget),
    pipeline: sum(rows, r => r.pipeline),
    nextQuarterBookingsTarget: sum(rows, r => r.nextQuarterBookingsTarget),
    wonValue: sum(rows, r => r.wonValue),
    lostValue: sum(rows, r => r.lostValue),
    newPipeline: sum(rows, r => r.newPipeline),
    newPipelineTarget: sum(rows, r => r.newPipelineTarget),
    priorYearRevenue: sum(rows, r => r.priorYearRevenue),
    revenueTimesMarginTarget: sum(rows, r => r.revenue * r.marginTarget),
  };
}

export interface SalesFigures extends SalesTotals {
  grossMarginPct: number;
  grossMarginTargetPct: number;
  bookToBill: number;
  pipelineCoverage: number;
  winRatePct: number;
  revenueGrowthPct: number;
}

export function salesFigures(accounts: readonly Account[], quarter: number): SalesFigures {
  const t = sumSales(accounts, quarter);
  return {
    ...t,
    grossMarginPct: 100 * ratio(t.revenue - t.deliveryCost, t.revenue),
    grossMarginTargetPct: ratio(t.revenueTimesMarginTarget, t.revenue),
    bookToBill: ratio(t.bookings, t.revenue),
    pipelineCoverage: ratio(t.pipeline, t.nextQuarterBookingsTarget),
    winRatePct: 100 * ratio(t.wonValue, t.wonValue + t.lostValue),
    revenueGrowthPct: 100 * (ratio(t.revenue, t.priorYearRevenue) - 1),
  };
}

/** Delivery amounts summed over a set of projects for one quarter. */
export interface DeliveryTotals {
  billableFte: number;
  totalFte: number;
  revenue: number;
  revenueTarget: number;
  cost: number;
  milestonesDue: number;
  milestonesMet: number;
  openEscalations: number;
  projectCount: number;
  /** Σ revenue × margin plan, for the revenue-weighted plan */
  revenueTimesMarginPlan: number;
  /** Σ revenue × CSAT, for the revenue-weighted CSAT */
  revenueTimesCsat: number;
  /** Σ total FTE × attrition, for the headcount-weighted attrition */
  fteTimesAttrition: number;
}

export function sumDelivery(projects: readonly Project[], quarter: number): DeliveryTotals {
  const rows = projects.map(project => project.quarters[quarter]);
  return {
    billableFte: sum(rows, r => r.billableFte),
    totalFte: sum(rows, r => r.totalFte),
    revenue: sum(rows, r => r.revenue),
    revenueTarget: sum(rows, r => r.revenueTarget),
    cost: sum(rows, r => r.cost),
    milestonesDue: sum(rows, r => r.milestonesDue),
    milestonesMet: sum(rows, r => r.milestonesMet),
    openEscalations: sum(rows, r => r.openEscalations),
    projectCount: rows.length,
    revenueTimesMarginPlan: sum(rows, r => r.revenue * r.marginPlan),
    revenueTimesCsat: sum(rows, r => r.revenue * r.csat),
    fteTimesAttrition: sum(rows, r => r.totalFte * r.attritionPct),
  };
}

export interface DeliveryFigures extends DeliveryTotals {
  utilisationPct: number;
  projectMarginPct: number;
  marginPlanPct: number;
  csat: number;
  onTimePct: number;
  attritionPct: number;
}

export function deliveryFigures(projects: readonly Project[], quarter: number): DeliveryFigures {
  const t = sumDelivery(projects, quarter);
  return {
    ...t,
    utilisationPct: 100 * ratio(t.billableFte, t.totalFte),
    projectMarginPct: 100 * ratio(t.revenue - t.cost, t.revenue),
    marginPlanPct: ratio(t.revenueTimesMarginPlan, t.revenue),
    csat: ratio(t.revenueTimesCsat, t.revenue),
    onTimePct: 100 * ratio(t.milestonesMet, t.milestonesDue),
    attritionPct: ratio(t.fteTimesAttrition, t.totalFte),
  };
}

export const quarterSeries = <F,>(compute: (quarter: number) => F): [F, F, F] => [compute(0), compute(1), compute(2)];
