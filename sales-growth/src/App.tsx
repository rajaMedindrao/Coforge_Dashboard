import {useCallback, useEffect, useMemo, useState} from 'react';
import {CoforgeLogo} from '../../sales-performance/src/components/CoforgeLogo';
import {CURRENT_QUARTER, QUARTERS} from '../../sales-performance/src/data/staticData';
import {Legend} from '../../sales-performance/src/components/Legend';
import {resolveGrowthView, type GrowthSelection} from './model/growthHierarchy';
import {GrowthBreadcrumb} from './components/GrowthBreadcrumb';
import {GrowthPage, GrowthTitle} from './components/GrowthPage';

function readSelection(): GrowthSelection {
  const params = new URLSearchParams(window.location.search);
  return {
    buId: params.get('bu') ?? undefined,
    subBuId: params.get('sub') ?? undefined,
    accountId: params.get('account') ?? undefined,
    opportunityId: params.get('opportunity') ?? undefined,
  };
}
export function App() {
  const [selection, setSelection] = useState<GrowthSelection>(readSelection);
  const view = useMemo(() => resolveGrowthView(selection), [selection]);
  useEffect(() => {
    const onPop = () => setSelection(readSelection());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = useCallback((next: GrowthSelection) => {
    const params = new URLSearchParams({page: 'growth'});
    if (next.buId) params.set('bu', next.buId);
    if (next.subBuId) params.set('sub', next.subBuId);
    if (next.accountId) params.set('account', next.accountId);
    if (next.opportunityId) params.set('opportunity', next.opportunityId);
    window.history.pushState(null, '', `${window.location.pathname}?${params}`);
    setSelection(next);
  }, []);
  const quarter = QUARTERS[CURRENT_QUARTER];
  return <div className="app">
    <header className="topbar">
      <div className="brand"><CoforgeLogo /></div>
      <nav className="tabs" aria-label="Page"><button type="button" className="active" aria-current="page" onClick={() => navigate({})}>Account Growth</button></nav>
      <div className="period"><strong>{quarter.label}</strong> · {quarter.months} · USD</div>
    </header>
    <main className="content">
      <div className="toolbar growth-toolbar"><GrowthBreadcrumb view={view} onNavigate={navigate} /><Legend /></div>
      <GrowthTitle view={view} />
      <GrowthPage view={view} onNavigate={navigate} />
    </main>
  </div>;
}
