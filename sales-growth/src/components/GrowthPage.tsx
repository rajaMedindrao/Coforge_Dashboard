import {KpiCard} from '../../../sales-performance/src/components/KpiCard';
import {growthSeries} from '../model/growth';
import type {GrowthSelection, GrowthView} from '../model/growthHierarchy';
import {salesGrowthMetrics} from '../model/salesGrowthMetrics';
import {GrowthTable} from './GrowthTable';
import {AccountPage, OpportunityPage} from './GrowthDetails';

export function GrowthTitle({view}: {view: GrowthView}) {
  const opportunity = view.opportunity;
  return <div className={opportunity ? "title-row growth-title-opportunity" : "title-row"}>
    <h1>{opportunity?.name ?? (view.level === 'company' ? 'Company' : view.unit.name)}</h1>
    {!opportunity && view.level !== 'company' && <span className="owner">{view.level === 'account' ? `Client Partner · ${view.account!.clientPartner} · ${view.subBu!.name}` : view.unit.owner}</span>}
  </div>;
}
export function GrowthPage({view, onNavigate}: {view: GrowthView; onNavigate: (s: GrowthSelection) => void}) {
  if (view.opportunity) return <OpportunityPage account={view.account!} opp={view.opportunity} />;
  const series = growthSeries(view.unit.accounts);
  const metrics = salesGrowthMetrics(view.unit);
  return <div className="growth">
    <section className="kpi-row" style={{gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`}}>
      {metrics.map(metric => <KpiCard key={metric.key} metric={{...metric, rag: () => metric.rag(series[series.length - 1])}} series={series} />)}
    </section>
    {view.level === 'account' ? <AccountPage account={view.account!} onOpen={opportunityId => onNavigate({...view.unit.selection, opportunityId})} />
      : <GrowthTable title={view.level === 'company' ? 'Business units compared' : view.level === 'bu' ? 'Sub-business units compared' : 'Accounts compared'} nameHeader={view.level === 'company' ? 'Business unit' : view.level === 'bu' ? 'Sub-business unit' : 'Account · Client Partner'} rows={view.children} onSelect={u => onNavigate(u.selection)} />}
  </div>;
}

