import {useCallback, useEffect, useMemo, useState} from 'react';
import {CoforgeLogo} from './components/CoforgeLogo';
import {CURRENT_QUARTER, QUARTERS} from './data/staticData';
import {resolveView, selectionForPage, type Page, type Selection, type Unit, type View} from './model/hierarchy';
import {
  ACCOUNT_PROJECT_METRICS,
  CLIENT_PARTNER_METRICS,
  DELIVERY_MANAGER_METRICS,
  DELIVERY_METRICS,
  SALES_METRICS,
  type MetricDef,
} from './model/metrics';
import {deliveryFigures, quarterSeries, salesFigures, type DeliveryFigures, type SalesFigures} from './model/rollup';
import {deliveryTalkingPoints, salesTalkingPoints} from './model/talkingPoints';
import {Breadcrumb} from './components/Breadcrumb';
import {ComparisonTable} from './components/ComparisonTable';
import {KpiCard} from './components/KpiCard';
import {Legend} from './components/Legend';
import {DealsTable, MilestonesTable} from './components/PersonTables';

interface Route {
  page: Page;
  selection: Selection;
}

function readRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  return {
    page: params.get('page') === 'delivery' ? 'delivery' : 'sales',
    selection: {buId: params.get('bu') ?? undefined, subBuId: params.get('sub') ?? undefined, personId: params.get('person') ?? undefined},
  };
}

function writeRoute({page, selection}: Route) {
  const params = new URLSearchParams({page});
  if (selection.buId) params.set('bu', selection.buId);
  if (selection.subBuId) params.set('sub', selection.subBuId);
  if (selection.personId) params.set('person', selection.personId);
  window.history.pushState(null, '', `${window.location.pathname}?${params}`);
}

const salesSeries = (unit: Unit) => quarterSeries(q => salesFigures(unit.accounts, q));
const deliverySeries = (unit: Unit) => quarterSeries(q => deliveryFigures(unit.projects, q));

const TABLE_TITLES: Record<Page, Record<'company' | 'bu' | 'subBu', [string, string]>> = {
  sales: {company: ['Business units compared', 'Business unit'], bu: ['Sub-business units compared', 'Sub-business unit'], subBu: ['Client partners compared', 'Client partner']},
  delivery: {company: ['Business units compared', 'Business unit'], bu: ['Sub-business units compared', 'Sub-business unit'], subBu: ['Delivery managers compared', 'Delivery manager']},
};

export function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const view = useMemo(() => resolveView(route.page, route.selection), [route]);

  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: Route) => {
    writeRoute(next);
    setRoute(next);
  }, []);

  const goTo = (selection: Selection) => navigate({page: route.page, selection});
  const switchPage = (page: Page) => navigate({page, selection: selectionForPage(route.selection)});

  const quarter = QUARTERS[CURRENT_QUARTER];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <CoforgeLogo />
        </div>
        <nav className="tabs" aria-label="Page">
          {(['sales', 'delivery'] as const).map(page => (
            <button key={page} type="button" className={route.page === page ? 'active' : ''} aria-current={route.page === page ? 'page' : undefined} onClick={() => switchPage(page)}>
              {page === 'sales' ? 'Sales' : 'Delivery'}
            </button>
          ))}
        </nav>
        <div className="period">
          <strong>{quarter.label}</strong> · {quarter.months} · USD
        </div>
      </header>

      <main className="content">
        <div className="toolbar">
          <Breadcrumb page={route.page} view={view} onNavigate={goTo} />
          <Legend />
        </div>

        <div className="title-row">
          <h1>{view.unit.name}</h1>
        {view.level !== 'company' && <span className="owner">{ownerLine(view)}</span>}
        </div>

        {route.page === 'sales' ? (
          <Body view={view} metrics={view.level === 'person' ? CLIENT_PARTNER_METRICS : SALES_METRICS} rowMetrics={view.level === 'subBu' ? CLIENT_PARTNER_METRICS : SALES_METRICS} seriesFor={salesSeries} talkingPointsFor={salesTalkingPoints} onSelect={goTo} />
        ) : (
          <Body view={view} metrics={view.level === 'person' ? DELIVERY_MANAGER_METRICS : DELIVERY_METRICS} rowMetrics={view.level === 'subBu' ? DELIVERY_MANAGER_METRICS : DELIVERY_METRICS} seriesFor={deliverySeries} talkingPointsFor={deliveryTalkingPoints} onSelect={goTo} />
        )}
      </main>
    </div>
  );
}

function ownerLine(view: View): string {
  if (view.level !== 'person') return view.unit.owner;
  return view.page === 'sales'
    ? `Client Partner · ${view.unit.owner}`
    : `Delivery Manager · ${view.unit.owner} · ${view.account?.name ?? ''}`;
}

interface BodyProps<F> {
  view: View;
  metrics: readonly MetricDef<F>[];
  rowMetrics: readonly MetricDef<F>[];
  seriesFor: (unit: Unit) => readonly F[];
  talkingPointsFor: (unit: Unit, siblings: readonly Unit[]) => ReturnType<typeof salesTalkingPoints>;
  onSelect: (selection: Selection) => void;
}

function Body<F extends SalesFigures | DeliveryFigures>({view, metrics, rowMetrics, seriesFor, talkingPointsFor, onSelect}: BodyProps<F>) {
  const series = useMemo(() => seriesFor(view.unit), [seriesFor, view.unit]);

  return (
    <>
      <section className="kpi-row" style={{gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`}}>
        {metrics.map(metric => (
          <KpiCard key={metric.key} metric={metric} series={series} />
        ))}
      </section>

      {view.level === 'person' ? (
        view.page === 'sales' ? (
          <>
            <ComparisonTable
              title={`Projects in this account · ${view.account!.name}`}
              nameHeader="Project"
              rows={view.projectRows}
              metrics={ACCOUNT_PROJECT_METRICS}
              figuresFor={deliverySeries}
              talkingPointsFor={deliveryTalkingPoints}
            />
            <DealsTable account={view.account!} />
          </>
        ) : (
          <>
            <ComparisonTable
              title={`Project · ${view.project!.name}`}
              nameHeader="Project"
              rows={view.projectRows}
              metrics={DELIVERY_METRICS}
              figuresFor={deliverySeries}
              talkingPointsFor={deliveryTalkingPoints}
              siblings={view.peers}
            />
            <MilestonesTable project={view.project!} accountName={view.account?.name ?? ''} />
          </>
        )
      ) : (
        <ComparisonTable
          title={TABLE_TITLES[view.page][view.level][0]}
          nameHeader={TABLE_TITLES[view.page][view.level][1]}
          rows={view.children}
          metrics={rowMetrics}
          figuresFor={seriesFor}
          talkingPointsFor={talkingPointsFor}
          onSelect={unit => onSelect(unit.selection)}
        />
      )}
    </>
  );
}
