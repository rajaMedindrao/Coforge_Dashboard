import {money, pct, shortDate, signedPct, times} from '../../../sales-performance/src/model/format';
import type {TalkingPoint} from '../../../sales-performance/src/model/talkingPoints';
import {growthFigures, identifiedUpside, isActive, isLarge, NOW, openRows, renewalAtRisk, whiteSpace, type OpportunityRow} from './growth';
import type {GrowthUnit} from './growthHierarchy';
import {ragOfCoverage, ragOfGrowth, ragOfRenewalRisk, ragOfWinRate} from './growthMetrics';

const MAX_POINTS = 2;
const sum = <T,>(items: readonly T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0);
const byHighest = <T,>(items: readonly T[], pick: (item: T) => number) => items.reduce((best, item) => (pick(item) > pick(best) ? item : best));


/**
 * Computed sentences for "What to discuss", in priority order:
 * the gap between YTD and projected growth, thin pipeline, being above target, dependence on one large deal
 * (or one competitor on the biggest deals), high share of wallet with slow growth, renewal risk, white space, win rate.
 */
export function growthTalkingPoints(unit: GrowthUnit, siblings: readonly GrowthUnit[]): TalkingPoint[] {
  const f = growthFigures(unit.accounts, NOW);
  const active = openRows(unit.accounts).filter(r => isActive(r.opp));
  const points: TalkingPoint[] = [];
  const add = (point: TalkingPoint) => points.length < MAX_POINTS && points.push(point);

  if (f.ytdGrowthPct - f.projectedGrowthPct >= 5) {
    add({rag: ragOfGrowth(f.projectedGrowthPct), text: `YTD ${signedPct(f.ytdGrowthPct)}; projected ${signedPct(f.projectedGrowthPct)}`});
  }

  if (ragOfCoverage(f) === 'red') {
    const upside = identifiedUpside(unit.accounts);
    const extra = upside > 0 ? ` · upside ${money(upside)}` : '';
    add({rag: 'red', text: `Coverage ${times(f.coverage)} · gap ${money(f.growthGap)}${extra}`});
  }

  if (f.projected >= f.target) {
    const byType = new Map<string, number>();
    for (const r of active) byType.set(r.opp.type, (byType.get(r.opp.type) ?? 0) + r.expectedRevenue);
    const [type, amount] = [...byType.entries()].reduce((best, entry) => (entry[1] > best[1] ? entry : best));
    add({rag: 'green', text: `${type}: ${money(amount)} · growth ${signedPct(f.projectedGrowthPct)}`});
  }

  const biggest = [...active].sort((x, y) => y.opp.tcv - x.opp.tcv).slice(0, 2);
  const shared = biggest.length === 2 && biggest[0].opp.competitors[0] === biggest[1].opp.competitors[0] && biggest[0].opp.competitors[0] !== 'In-house';
  if (shared) {
    add({rag: 'amber', text: `${biggest[0].opp.competitors[0]}: top 2 deals · ${money(biggest[0].opp.tcv + biggest[1].opp.tcv)}`});
  } else {
    const bets = active.filter(r => isLarge(r.opp) && (r.opp.winPct ?? 0) <= 50 && r.expectedRevenue >= 0.15 * f.expectedFy27);
    if (bets.length > 0) {
      const bet = byHighest(bets, r => r.expectedRevenue);
      add({
        rag: 'amber',
        text: `${bet.opp.competitors[0]} ${bet.opp.type.toLowerCase()}: ${money(bet.opp.tcv)} · ${bet.opp.winPct}% win`,
      });
    }
  }

  if (siblings.length > 1) {
    const now = siblings.map(s => ({key: s.key, f: growthFigures(s.accounts, NOW)}));
    const highestShare = byHighest(now, s => s.f.shareOfWalletPct).key === unit.key;
    const slowest = byHighest(now, s => -s.f.ytdGrowthPct).key === unit.key;
    if (highestShare && slowest) {
      add({rag: 'amber', text: `Wallet ${pct(f.shareOfWalletPct)}; growth ${signedPct(f.ytdGrowthPct)}`});
    }
  }

  const riskRag = ragOfRenewalRisk(f.renewalsAtRiskPct);
  if (riskRag !== 'green') {
    const renewals = active.filter(r => renewalAtRisk(r.opp) > 0);
    const worst = byHighest(renewals, r => renewalAtRisk(r.opp));
    add({
      rag: riskRag,
      text: `Renewal ${shortDate(worst.opp.renewal!.contractEnd)} · ${money(renewalAtRisk(worst.opp))} at risk`,
    });
  }

  const gaps = new Map<string, number>();
  for (const account of unit.accounts) for (const g of whiteSpace(account)) gaps.set(g.line, (gaps.get(g.line) ?? 0) + g.spend);
  if (gaps.size > 0) {
    const [line, spend] = [...gaps.entries()].reduce((best, entry) => (entry[1] > best[1] ? entry : best));
    add({rag: 'amber', text: `${line} white space: ${money(spend)}`});
  }

  if (ragOfWinRate(f.winRatePct) !== 'green') add({rag: ragOfWinRate(f.winRatePct), text: `Win rate ${pct(f.winRatePct)} · last 12 months`});

  if (points.length === 0) {
    const expected = sum(active, r => r.expectedRevenue);
    add({rag: ragOfGrowth(f.projectedGrowthPct), text: `Projected ${signedPct(f.projectedGrowthPct)} · wins ${money(expected)}`});
  }
  return points;
}

