import {KpiCard} from '../../../sales-performance/src/components/KpiCard';
import {ComparisonTable} from '../../../sales-performance/src/components/ComparisonTable';
import type {Unit} from '../../../sales-performance/src/model/hierarchy';
import type {MetricDef, Rag} from '../../../sales-performance/src/model/metrics';
import {money, pct, shortDate} from '../../../sales-performance/src/model/format';
import {OPPORTUNITY_TYPES, STAGES, type Opportunity} from '../data/growthData';
import {growthBridge, isActive, isOpen, opportunityRow, type GrowthAccount, type OpportunityRow} from '../model/growth';
import {ragOfWinPct, ragOfMarginPct} from '../model/growthMetrics';
import {typeSpecificFields} from './OpportunityDrawer';

export function StageDots({opp}: {opp: Opportunity}) {
  return <span className="stage-dots">{opp.stage ?? 'Potential'} <span aria-hidden="true">{STAGES.map((s, i) => <i key={s} className={opp.stage && i <= STAGES.indexOf(opp.stage) ? 'done' : ''} />)}</span></span>;
}
function detailMetric(key: string, label: string, value: (r: OpportunityRow) => number, format = money, rag: (r: OpportunityRow) => Rag = () => 'neutral' as Rag, note: (r: OpportunityRow) => string = () => ''): MetricDef<OpportunityRow> {
  return {key, label, value, format, rag, target: () => 0, targetText: () => '', varianceText: () => '', cardNote: note, cellNote: s => note(s[s.length - 1]), formula: label, thresholds: 'Illustrative account opportunity inputs.'};
}
const oppMetrics: MetricDef<OpportunityRow>[] = [
  detailMetric('tcv', 'TCV', r => r.opp.tcv, money, undefined, r => `Annual value ${money(r.opp.annualValue)}`),
  detailMetric('fy27', 'FY27 if won', r => r.revenueIfWon),
  detailMetric('win', 'Win %', r => r.opp.winPct ?? -1, n => n < 0 ? 'Not yet active' : pct(n), r => isActive(r.opp) ? ragOfWinPct(r.opp.winPct!) : 'neutral' as Rag),
  detailMetric('expected', 'Expected FY27', r => r.expectedRevenue),
  detailMetric('stage', 'Stage', () => 0),

];

export function AccountPage({account, onOpen}: {account: GrowthAccount; onOpen: (id: string) => void}) {
  const b = growthBridge([account]);
  const open = account.opportunities.filter(isOpen);
  const units: Unit[] = open.map(o => ({key: o.id, name: o.name, owner: o.serviceLine, selection: {}, accounts: [], projects: [], parts: []}));
  const get = (unit: Unit) => opportunityRow(open.find(o => o.id === unit.key)!, account);
  const metrics = [
    detailMetric('type', 'Type', r => OPPORTUNITY_TYPES.indexOf(r.opp.type), n => OPPORTUNITY_TYPES[n]),
    ...oppMetrics.map(m => m.key === 'stage' ? {...m, value: (r: OpportunityRow) => STAGES.indexOf(r.opp.stage!), format: (n: number) => n < 0 ? 'Potential' : STAGES[n]} : m),
  ];

  const exactMoney = (value: number) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2}).format(value * 1000);
  return <div className="account-detail">
    <section className="table-panel outlook-panel" aria-labelledby="fy27-outlook-heading">
      <div className="table-heading"><h2 id="fy27-outlook-heading">FY27 outlook vs target</h2></div>
      <div className="kpi-card growth-strip">
      {[['FY26 revenue', b.fy26], ['→ Secured FY27', b.fy26 + b.securedChange], ['+ Expected renewals', b.renewals], ['+ Expected new', b.newWork], ['= Projected FY27', b.projected], ['Target', b.target]].map(([label, value]) => <div key={label} data-value={value}><small>{label}</small><strong>{exactMoney(value as number)}</strong></div>)}
      <div className={`variance ${b.gap > 0 ? 'red' : 'green'}`}><small>{b.gap > 0 ? 'Gap to target' : 'Above target'}</small><strong>{exactMoney(Math.abs(b.gap))}</strong></div>
      </div>
    </section>
    <div className="opportunity-group">
      <ComparisonTable title="Opportunities" nameHeader="Opportunity" rows={units} metrics={metrics} figuresFor={u => [get(u)]}
        talkingPointsFor={u => {const o = get(u).opp; return [{rag: o.status === 'Potential' ? 'amber' : ragOfWinPct(o.winPct!), text: o.status === 'Potential' ? 'Identified upside; qualify before activation.' : o.detail!.nextSteps[0].step}];}}
        onSelect={u => onOpen(u.key)} />
    </div>

  </div>;
}
export function OpportunityPage({account, opp}: {account: GrowthAccount; opp: Opportunity}) {
  const row = opportunityRow(opp, account);
  const detail = opp.detail!;
  const metrics = [
    detailMetric('tcv', 'TCV', r => r.opp.tcv), detailMetric('annual', 'Annual value', r => r.opp.annualValue),
    detailMetric('fy27', 'FY27 if won', r => r.revenueIfWon), oppMetrics[2], detailMetric('expected', 'Expected FY27', r => r.expectedRevenue),
    {...detailMetric('margin', 'Planned margin', r => r.opp.plannedMarginPct, pct, r => ragOfMarginPct(r.opp.plannedMarginPct)), targetText: () => 'Target 30.0%', varianceText: () => `${(opp.plannedMarginPct - 30).toFixed(1)} pts`},
  ];
  return <div className="growth opportunity-page">
    <section className="kpi-row" style={{gridTemplateColumns: 'repeat(6, minmax(0, 1fr))'}}>{metrics.map(m => <KpiCard key={m.key} metric={m} series={[row]} />)}</section>
    <div className="opportunity-columns">
      <section className="kpi-card detail-section">
        <h2>Scope</h2><p>{detail.scope}</p>
        <h2>Type-specific details</h2><dl>{typeSpecificFields(row).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <h2>Competition</h2><p>{opp.competitors.map((c, i) => <span key={c}>{i > 0 && ' · '}{i === 0 ? <b>{c}</b> : c}</span>)} · {detail.whyWeWin}</p>
        <h2>Client decision-makers</h2>{detail.decisionMakers.map(name => {const s = account.stakeholders.find(s => s.name === name)!; return <p key={name}><span className={`rag-dot small ${{Strong: 'green', Medium: 'amber', Weak: 'red'}[s.strength]}`} /> <b>{s.name}</b> · {s.role} · {s.strength === 'Medium' ? 'Neutral' : s.strength}</p>;})}
        <p className="hint">Expected close {shortDate(opp.expectedClose)} · Deal team {opp.dealTeam.join(', ')}</p>
      </section>
      <section className="kpi-card detail-section">
        <h2>Coforge product relevance <span className="hint">illustrative</span></h2>{detail.products.map(p => <p key={p.name}><b>{p.name}</b> · {p.why}</p>)}
        <h2>Risks</h2><ul>{detail.risks.map(r => <li key={r}>{r}</li>)}</ul>
        <h2>Next 3 steps</h2><ol>{detail.nextSteps.map(s => <li key={s.step}>{s.step}<small>{s.owner} · {shortDate(s.due)}</small></li>)}</ol>
      </section>
    </div>
  </div>;
}




