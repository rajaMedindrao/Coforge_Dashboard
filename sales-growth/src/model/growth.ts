import {BUSINESS_UNITS} from '../../../sales-performance/src/data/staticData';
import {
  AS_OF,
  COMPETITORS,
  GROWTH_ACCOUNTS,
  SERVICE_LINES,
  SNAPSHOTS,
  type AccountGrowthData,
  type Competitor,
  type GrowthSnapshot,
  type Opportunity,
  type ServiceLine,
} from '../data/growthData';

export const GROWTH_TARGET_PCT = 15;
export const LARGE_DEAL_TCV = 10000;
/** FY27 YTD and the trailing 12 months both end at the close of Q2 FY27. */
export const FY27_START = '2026-04-01';
export const TTM_START = '2025-10-01';
export const PERIOD_END = '2026-09-30';
/** Renewals ending within 12 months of AS_OF count towards renewals at risk. */
export const RENEWAL_WINDOW_END = '2027-10-09';
/** Takeovers need a competitor contract ending within 18 months of AS_OF. */
export const TAKEOVER_WINDOW_END = '2028-04-09';

const sum = <T,>(items: readonly T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0);
const ratio = (numerator: number, denominator: number) => (denominator === 0 ? 0 : numerator / denominator);

// ---------------------------------------------------------------- formulas

const monthIndex = (iso: string) => {
  const [year, month] = iso.split('-').map(Number);
  return year * 12 + (month - 1);
};
const MARCH_2027 = monthIndex('2027-03-01');

/** Months from the given start month through Mar 2027, inclusive; 0 if it starts after Mar 2027. */
export const monthsThroughMarch2027 = (startMonthIndex: number) => Math.max(0, MARCH_2027 - startMonthIndex + 1);

/** The month revenue starts if won: the month after the contract end (renewal) or after the expected close. */
export function revenueStartMonth(opp: Opportunity): number {
  return opp.type === 'Renewal' && opp.renewal ? monthIndex(opp.renewal.contractEnd) + 1 : monthIndex(opp.expectedClose) + 1;
}

/** FY27 revenue if won = annual value × months from the start month through Mar 2027 ÷ 12. */
export const fy27RevenueIfWon = (opp: Opportunity) => (opp.annualValue * monthsThroughMarch2027(revenueStartMonth(opp))) / 12;

const winShare = (opp: Opportunity) => (opp.status === 'Active' ? (opp.winPct ?? 0) / 100 : 0);

/** Expected FY27 revenue = FY27 revenue if won × expected win %; 0 unless Active. */
export const expectedFy27Revenue = (opp: Opportunity) => fy27RevenueIfWon(opp) * winShare(opp);

/** Expected contract value = TCV × expected win %; 0 unless Active. */
export const expectedContractValue = (opp: Opportunity) => opp.tcv * winShare(opp);

export const isActive = (opp: Opportunity) => opp.status === 'Active';
export const isOpen = (opp: Opportunity) => opp.status === 'Active' || opp.status === 'Potential';
export const isLarge = (opp: Opportunity) => opp.tcv >= LARGE_DEAL_TCV;
const closedBetween = (opp: Opportunity, from: string, to: string) => opp.expectedClose >= from && opp.expectedClose <= to;

/** Active renewals whose contract ends within the next 12 months. */
export const isRenewalInWindow = (opp: Opportunity) =>
  isActive(opp) && opp.type === 'Renewal' && !!opp.renewal && opp.renewal.contractEnd >= AS_OF && opp.renewal.contractEnd <= RENEWAL_WINDOW_END;

/** Renewal annual value × (1 − expected win %). */
export const renewalAtRisk = (opp: Opportunity) => (isRenewalInWindow(opp) ? opp.annualValue * (1 - winShare(opp)) : 0);

// ---------------------------------------------------------------- accounts

export interface GrowthAccount extends AccountGrowthData {
  name: string;
  clientPartner: string;
  buId: string;
  buName: string;
  buHead: string;
  subBuId: string;
  subBuName: string;
  salesLead: string;
}

/** The top 20: every account except the third one in each BU's second Sub-BU, in Sales tab order. */
export const TOP_20_IDS: readonly string[] = BUSINESS_UNITS.flatMap(bu =>
  bu.subBus.flatMap((subBu, s) => subBu.accounts.filter((_, a) => !(s === 1 && a === 2)).map(account => account.id)),
);

export const ACCOUNTS: readonly GrowthAccount[] = TOP_20_IDS.map(id => {
  const bu = BUSINESS_UNITS.find(b => b.subBus.some(s => s.accounts.some(a => a.id === id)))!;
  const subBu = bu.subBus.find(s => s.accounts.some(a => a.id === id))!;
  const account = subBu.accounts.find(a => a.id === id)!;
  const data = GROWTH_ACCOUNTS.find(a => a.id === id);
  if (!data) throw new Error(`No growth data for ${id}`);
  return {
    ...data,
    name: account.name,
    clientPartner: account.clientPartner,
    buId: bu.id,
    buName: bu.name,
    buHead: bu.buHead,
    subBuId: subBu.id,
    subBuName: subBu.name,
    salesLead: subBu.salesLead,
  };
});

export const ttmRevenue = (a: AccountGrowthData) => a.fy26Revenue - a.fy26YtdRevenue + a.fy27YtdRevenue;
export const competitorContract = (a: AccountGrowthData, opp: Opportunity) => a.contracts.find(c => c.id === opp.takeover?.contractId);
export const divisionOf = (a: AccountGrowthData, opp: Opportunity) => a.divisions.find(d => d.name === opp.newDivision?.division);

/** Wallet split: Coforge (trailing 12 months), each competitor, and In-house as the remainder. */
export function walletSplit(a: AccountGrowthData): {name: Competitor | 'Coforge' | 'In-house'; value: number}[] {
  const coforge = ttmRevenue(a);
  const competitors = COMPETITORS.filter(c => (a.competitorSpend[c] ?? 0) > 0).map(c => ({name: c, value: a.competitorSpend[c]!}));
  const inHouse = a.itSpend - coforge - sum(competitors, c => c.value);
  return [{name: 'Coforge', value: coforge}, ...competitors, {name: 'In-house', value: inHouse}];
}

/** Service lines the client buys elsewhere, largest spend first. */
export const whiteSpace = (a: AccountGrowthData): {line: ServiceLine; spend: number}[] =>
  SERVICE_LINES.filter(line => !a.serviceLines[line].coforge)
    .map(line => ({line, spend: a.serviceLines[line].spend}))
    .sort((x, y) => y.spend - x.spend);

// ---------------------------------------------------------------- card inputs

/** Everything the six cards need for one account in one quarter; amounts only, so they can be summed. */
export interface GrowthInputs extends GrowthSnapshot {
  fy26Revenue: number;
}

export function currentInputs(a: AccountGrowthData): GrowthInputs {
  const active = a.opportunities.filter(isActive);
  const large = active.filter(isLarge);
  const won = a.opportunities.filter(o => o.status === 'Won');
  const lost = a.opportunities.filter(o => o.status === 'Lost');
  return {
    fy26Revenue: a.fy26Revenue,
    ytdRevenue: a.fy27YtdRevenue,
    priorYtdRevenue: a.fy26YtdRevenue,
    ttmRevenue: ttmRevenue(a),
    itSpend: a.itSpend,
    securedFy27: a.securedFy27Revenue,
    pipelineIfWon: sum(active, fy27RevenueIfWon),
    expectedFy27: sum(active, expectedFy27Revenue),
    largeDealCount: large.length,
    largeDealTcv: sum(large, o => o.tcv),
    wonYtd: sum(won.filter(o => closedBetween(o, FY27_START, PERIOD_END)), o => o.tcv),
    priorWonYtd: a.fy26YtdWonValue,
    wonTtm: sum(won.filter(o => closedBetween(o, TTM_START, PERIOD_END)), o => o.tcv),
    lostTtm: sum(lost.filter(o => closedBetween(o, TTM_START, PERIOD_END)), o => o.tcv),
    renewalsAtRisk: sum(a.opportunities, renewalAtRisk),
  };
}

export const QUARTER_COUNT = 3;
export const NOW = 2;

/** Inputs for quarter 0 (Q4 FY26), 1 (Q1 FY27) or 2 (Q2 FY27, computed from opportunities). */
export function inputsAt(a: AccountGrowthData, quarter: number): GrowthInputs {
  if (quarter === NOW) return currentInputs(a);
  const snapshot = SNAPSHOTS[a.id]?.[quarter];
  if (!snapshot) throw new Error(`No snapshot for ${a.id} in quarter ${quarter}`);
  return {fy26Revenue: a.fy26Revenue, ...snapshot};
}

const INPUT_KEYS = [
  'fy26Revenue', 'ytdRevenue', 'priorYtdRevenue', 'ttmRevenue', 'itSpend', 'securedFy27', 'pipelineIfWon', 'expectedFy27',
  'largeDealCount', 'largeDealTcv', 'wonYtd', 'priorWonYtd', 'wonTtm', 'lostTtm', 'renewalsAtRisk',
] as const satisfies readonly (keyof GrowthInputs)[];

export function sumInputs(rows: readonly GrowthInputs[]): GrowthInputs {
  return Object.fromEntries(INPUT_KEYS.map(key => [key, sum(rows, r => r[key])])) as unknown as GrowthInputs;
}

/** Amounts summed over the accounts, then every ratio derived from the sums. */
export interface GrowthFigures extends GrowthInputs {
  target: number;
  ytdGrowthPct: number;
  projected: number;
  projectedGrowthPct: number;
  gapToTarget: number;
  untappedWallet: number;
  shareOfWalletPct: number;
  /** Target − secured FY27 revenue; 0 or less means the target is already secured */
  growthGap: number;
  targetSecured: boolean;
  /** Pipeline if won ÷ growth gap; 0 when the target is secured */
  coverage: number;
  winRatePct: number;
  renewalsAtRiskPct: number;
}

export function figuresFrom(t: GrowthInputs): GrowthFigures {
  const target = (t.fy26Revenue * (100 + GROWTH_TARGET_PCT)) / 100;
  const projected = t.securedFy27 + t.expectedFy27;
  const growthGap = target - t.securedFy27;
  const targetSecured = growthGap <= 0;
  return {
    ...t,
    target,
    ytdGrowthPct: 100 * (ratio(t.ytdRevenue, t.priorYtdRevenue) - 1),
    projected,
    projectedGrowthPct: 100 * (ratio(projected, t.fy26Revenue) - 1),
    gapToTarget: target - projected,
    untappedWallet: t.itSpend - t.ttmRevenue,
    shareOfWalletPct: 100 * ratio(t.ttmRevenue, t.itSpend),
    growthGap,
    targetSecured,
    coverage: targetSecured ? 0 : t.pipelineIfWon / growthGap,
    winRatePct: 100 * ratio(t.wonTtm, t.wonTtm + t.lostTtm),
    renewalsAtRiskPct: 100 * ratio(t.renewalsAtRisk, t.fy26Revenue),
  };
}

export const growthFigures = (accounts: readonly AccountGrowthData[], quarter: number) =>
  figuresFrom(sumInputs(accounts.map(a => inputsAt(a, quarter))));

export const growthSeries = (accounts: readonly AccountGrowthData[]): [GrowthFigures, GrowthFigures, GrowthFigures] => [
  growthFigures(accounts, 0),
  growthFigures(accounts, 1),
  growthFigures(accounts, 2),
];

// ---------------------------------------------------------------- opportunity views

export interface OpportunityRow {
  opp: Opportunity;
  account: GrowthAccount;
  revenueIfWon: number;
  expectedRevenue: number;
  expectedValue: number;
}

export const opportunityRow = (opp: Opportunity, account: GrowthAccount): OpportunityRow => ({
  opp,
  account,
  revenueIfWon: fy27RevenueIfWon(opp),
  expectedRevenue: expectedFy27Revenue(opp),
  expectedValue: expectedContractValue(opp),
});

export const openRows = (accounts: readonly GrowthAccount[]) =>
  accounts.flatMap(account => account.opportunities.filter(isOpen).map(opp => opportunityRow(opp, account)));

/** Open deals with TCV ≥ $10M: Active first, then Potential, each by TCV. */
export const largeDeals = (accounts: readonly GrowthAccount[]) =>
  openRows(accounts)
    .filter(r => isLarge(r.opp))
    .sort((x, y) => Number(isActive(y.opp)) - Number(isActive(x.opp)) || y.opp.tcv - x.opp.tcv);

/** Identified upside: Σ annual value of Potential opportunities. */
export const identifiedUpside = (accounts: readonly AccountGrowthData[]) =>
  sum(accounts.flatMap(a => a.opportunities.filter(o => o.status === 'Potential')), o => o.annualValue);

export interface PipelineGroup {
  label: string;
  tcv: number;
  count: number;
  /** Value-weighted expected win % = Σ (TCV × win %) ÷ Σ TCV */
  weightedWinPct: number;
}

export function pipelineBy(accounts: readonly GrowthAccount[], key: 'type' | 'competitor'): PipelineGroup[] {
  const active = openRows(accounts).filter(r => isActive(r.opp));
  const groups = new Map<string, OpportunityRow[]>();
  for (const row of active) {
    const label = key === 'type' ? row.opp.type : row.opp.competitors[0];
    groups.set(label, [...(groups.get(label) ?? []), row]);
  }
  return [...groups.entries()]
    .map(([label, rows]) => {
      const tcv = sum(rows, r => r.opp.tcv);
      return {label, tcv, count: rows.length, weightedWinPct: (100 * sum(rows, r => r.expectedValue)) / tcv};
    })
    .sort((x, y) => y.tcv - x.tcv);
}

/** Growth bridge: FY26 → change in secured work → + expected renewals → + expected new → projected FY27. */
export function growthBridge(accounts: readonly AccountGrowthData[]) {
  const active = accounts.flatMap(a => a.opportunities.filter(isActive));
  const fy26 = sum(accounts, a => a.fy26Revenue);
  const secured = sum(accounts, a => a.securedFy27Revenue);
  const renewals = sum(active.filter(o => o.type === 'Renewal'), expectedFy27Revenue);
  const newWork = sum(active.filter(o => o.type !== 'Renewal'), expectedFy27Revenue);
  const projected = secured + renewals + newWork;
  const target = (fy26 * (100 + GROWTH_TARGET_PCT)) / 100;
  return {fy26, securedChange: secured - fy26, renewals, newWork, projected, target, gap: target - projected};
}
