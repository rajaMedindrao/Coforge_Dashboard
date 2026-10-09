import type {Project} from '../data/staticData';
import {money, pct, round1, score, signedPct, times} from './format';
import type {Unit} from './hierarchy';
import {
  DELIVERY_METRICS,
  ragOfAttainment,
  ragOfAttrition,
  ragOfCoverage,
  ragOfCsat,
  ragOfEscalations,
  ragOfGrowth,
  ragOfMargin,
  ragOfOnTime,
  ragOfUtilisation,
  ragOfWinRate,
  SALES_METRICS,
  type Rag,
} from './metrics';
import {deliveryFigures, quarterSeries, salesFigures} from './rollup';

/** A short, computed sentence for the "What to discuss" column. */
export interface TalkingPoint {
  rag: Rag;
  text: string;
}

const NOW = 2;
const MAX_POINTS = 2;
const severity: Record<Rag, number> = {red: 0, amber: 1, green: 2};

const byHighest = <T,>(items: readonly T[], pick: (item: T) => number) =>
  items.reduce((best, item) => (pick(item) > pick(best) ? item : best));

/** People are shown by their account on Sales so the sentence names a client. */
const placeName = (unit: Unit) => (unit.parts.length === 0 && unit.accounts.length === 1 ? unit.accounts[0].name : unit.name);

function finish(issues: TalkingPoint[], positives: TalkingPoint[], allGreen: boolean): TalkingPoint[] {
  const points = [...issues.sort((a, b) => severity[a.rag] - severity[b.rag]), ...positives].slice(0, MAX_POINTS);
  if (points.length > 0) return points;
  return [{rag: allGreen ? 'green' : 'amber', text: allGreen ? 'On target on every measure' : 'Close to target on all measures'}];
}

export function salesTalkingPoints(unit: Unit, siblings: readonly Unit[]): TalkingPoint[] {
  const series = quarterSeries(q => salesFigures(unit.accounts, q));
  const now = series[NOW];
  const issues: TalkingPoint[] = [];
  const positives: TalkingPoint[] = [];
  const isPerson = unit.parts.length === 0;

  const marginRag = ragOfMargin(now.grossMarginPct, now.grossMarginTargetPct);
  if (marginRag === 'red') {
    const overrun = (u: Unit) => {
      const f = salesFigures(u.accounts, NOW);
      return f.deliveryCost - f.revenue * (1 - f.grossMarginTargetPct / 100);
    };
    const gap = Math.abs(round1(now.grossMarginPct) - round1(now.grossMarginTargetPct)).toFixed(1);
    const worst = isPerson ? unit : byHighest(unit.parts, overrun);
    const where = isPerson ? '' : ` in ${placeName(worst)}`;
    issues.push({rag: 'red', text: `Margin ${gap} pts below target: ${money(overrun(worst))} delivery cost overrun${where}`});
  }

  const bookingsRag = ragOfAttainment(now.bookings, now.bookingsTarget);
  if (bookingsRag !== 'green') {
    const attainment = Math.round((100 * now.bookings) / now.bookingsTarget);
    const openLate = unit.accounts
      .flatMap(account => account.openDeals.map(deal => ({deal, account})))
      .filter(({deal}) => deal.stage === 'Negotiate' || deal.stage === 'Commit');
    const largest = openLate.length > 0 ? byHighest(openLate, ({deal}) => deal.value) : undefined;
    const reason = largest ? `; ${money(largest.deal.value)} ${largest.deal.name.toLowerCase()} at ${largest.account.name} not yet signed` : '';
    issues.push({rag: bookingsRag, text: `Bookings ${attainment}% of target${reason}`});
  }

  const coverageRag = ragOfCoverage(now.pipelineCoverage);
  if (coverageRag !== 'green') {
    issues.push({rag: coverageRag, text: `Pipeline covers only ${times(now.pipelineCoverage)} of next quarter's bookings target`});
  }

  const [first, middle, last] = series.map(f => f.revenueGrowthPct);
  if (first > middle && middle > last && first - last >= 3) {
    issues.push({rag: 'amber', text: `Growth slowing: YoY ${signedPct(first)} → ${signedPct(last)}`});
  }

  const subBuLevel = (u: Unit) => u.accounts.length > 1 && u.parts.length > 0 && u.parts.every(p => p.parts.length === 0);
  for (const group of [unit, ...unit.parts].filter(subBuLevel)) {
    const groupRevenue = salesFigures(group.accounts, NOW).revenue;
    const top = byHighest(group.accounts, a => a.quarters[NOW].revenue);
    const share = (100 * top.quarters[NOW].revenue) / groupRevenue;
    if (share >= 50) {
      const who = group === unit ? 'Depends on' : `${group.name} depends on`;
      issues.push({rag: 'amber', text: `${who} ${top.name} for ${Math.round(share)}% of revenue`});
    }
  }

  if (isPerson && siblings.length > 1) {
    const share = (100 * now.revenue) / siblings.reduce((total, s) => total + salesFigures(s.accounts, NOW).revenue, 0);
    if (share >= 50) issues.push({rag: 'amber', text: `${placeName(unit)} is ${Math.round(share)}% of this sub-business unit's revenue`});
  }

  if (ragOfWinRate(now.winRatePct) === 'red') issues.push({rag: 'red', text: `Win rate only ${pct(now.winRatePct)}`});

  if (isPerson) {
    const newPipelineRag = ragOfAttainment(now.newPipeline, now.newPipelineTarget);
    if (newPipelineRag !== 'green') {
      issues.push({rag: newPipelineRag, text: `New pipeline ${Math.round((100 * now.newPipeline) / now.newPipelineTarget)}% of target`});
    }
  }

  if (siblings.length > 1) {
    const siblingNow = siblings.map(s => ({unit: s, f: salesFigures(s.accounts, NOW)}));
    if (byHighest(siblingNow, s => s.f.revenueGrowthPct).unit.key === unit.key && ragOfGrowth(now.revenueGrowthPct) === 'green') {
      positives.push({rag: 'green', text: `Fastest growth: YoY ${signedPct(now.revenueGrowthPct)}`});
    }
    if (byHighest(siblingNow, s => s.f.grossMarginPct).unit.key === unit.key && marginRag === 'green') {
      positives.push({rag: 'green', text: `Highest margin: ${pct(now.grossMarginPct)}`});
    }
  }
  if (now.revenue >= 1.03 * now.revenueTarget) {
    positives.push({rag: 'green', text: `Revenue ${Math.round((100 * now.revenue) / now.revenueTarget)}% of target`});
  }

  return finish(issues, positives, SALES_METRICS.every(m => m.rag(now) === 'green'));
}

/** Measures of one project at a given RAG in the current quarter, as short phrases with values. */
export function projectMeasures(project: Project, rag: Rag): string[] {
  const f = deliveryFigures([project], NOW);
  const phrases: string[] = [];
  if (ragOfOnTime(f.onTimePct) === rag) phrases.push(`on-time ${pct(f.onTimePct)}`);
  if (ragOfMargin(f.projectMarginPct, f.marginPlanPct) === rag) phrases.push(`margin ${pct(f.projectMarginPct)}`);
  if (ragOfCsat(f.csat) === rag) phrases.push(`CSAT ${score(f.csat)}`);
  if (ragOfUtilisation(f.utilisationPct) === rag) phrases.push(`utilisation ${pct(f.utilisationPct)}`);
  if (ragOfEscalations(f.openEscalations) === rag) phrases.push(`${f.openEscalations} ${f.openEscalations === 1 ? 'escalation' : 'escalations'}`);
  if (ragOfAttrition(f.attritionPct) === rag) phrases.push(`attrition ${pct(f.attritionPct)}`);
  return phrases;
}

export const redProjectMeasures = (project: Project) => projectMeasures(project, 'red');

const listPhrases = (phrases: string[]) =>
  phrases.length <= 2 ? phrases.join(' and ') : `${phrases.slice(0, 2).join(', ')} and ${phrases.length - 2} more`;

export function deliveryTalkingPoints(unit: Unit, siblings: readonly Unit[]): TalkingPoint[] {
  const now = deliveryFigures(unit.projects, NOW);
  const issues: TalkingPoint[] = [];
  const positives: TalkingPoint[] = [];

  const redProjects = unit.projects.map(project => ({project, phrases: redProjectMeasures(project)})).filter(r => r.phrases.length > 0);
  if (unit.projects.length === 1 && redProjects.length === 1) {
    issues.push({rag: 'red', text: `Red: ${listPhrases(redProjects[0].phrases)}`});
  } else if (redProjects.length > 0) {
    const [{project, phrases}] = redProjects;
    const account = unit.accounts.find(a => a.id === project.accountId)?.name;
    const more = redProjects.length > 1 ? ` (+${redProjects.length - 1} more red)` : '';
    issues.push({rag: 'red', text: `${project.name}${account ? ` at ${account}` : ''} is red: ${listPhrases(phrases)}${more}`});
  }

  for (const metric of DELIVERY_METRICS) {
    if (redProjects.length === 0 && metric.rag(now) !== 'green') {
      issues.push({rag: metric.rag(now), text: `${metric.label} ${metric.format(metric.value(now))} vs ${metric.targetText(now).toLowerCase()}`});
    }
  }

  if (redProjects.length === 0) {
    const slipping = unit.projects.map(project => ({project, phrases: projectMeasures(project, 'amber')})).filter(r => r.phrases.length > 0);
    if (slipping.length > 0) {
      const {project, phrases} = byHighest(slipping, r => r.phrases.length);
      const account = unit.accounts.find(a => a.id === project.accountId)?.name;
      const text = unit.projects.length === 1
        ? `Slipping: ${listPhrases(phrases)}`
        : `${project.name}${account ? ` at ${account}` : ''} is slipping: ${listPhrases(phrases)}`;
      issues.push({rag: 'amber', text});
    }
  }

  if (siblings.length > 1) {
    const best = byHighest(siblings, s => deliveryFigures(s.projects, NOW).csat);
    if (best.key === unit.key && ragOfCsat(now.csat) === 'green') positives.push({rag: 'green', text: `Highest client satisfaction: ${score(now.csat)}`});
  }

  return finish(issues, positives, DELIVERY_METRICS.every(m => m.rag(now) === 'green'));
}
