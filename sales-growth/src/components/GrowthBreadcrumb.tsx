import {GROWTH_COMPANY, type GrowthSelection, type GrowthView} from '../model/growthHierarchy';

interface Props {
  view: GrowthView;
  onNavigate: (selection: GrowthSelection) => void;
}

/** Company (top 20) → BU → Sub-BU → Account. Each level is a picker; choosing the blank option steps back up. */
export function GrowthBreadcrumb({view, onNavigate}: Props) {
  const {bu, subBu} = view;
  return (
    <nav className="breadcrumb" aria-label="Level">
      <button type="button" className={view.level === 'company' ? 'current' : ''} onClick={() => onNavigate({})}>
        Company
      </button>
      <span className="sep">›</span>
      <select
        aria-label="Business unit"
        className={view.level === 'bu' ? 'current' : bu ? '' : 'empty'}
        value={bu?.key ?? ''}
        onChange={e => onNavigate(e.target.value ? {buId: e.target.value} : {})}
      >
        <option value="">Choose business unit</option>
        {GROWTH_COMPANY.parts.map(b => (
          <option key={b.key} value={b.key}>
            {b.name}
          </option>
        ))}
      </select>
      {bu && (
        <>
          <span className="sep">›</span>
          <select
            aria-label="Sub-business unit"
            className={view.level === 'subBu' ? 'current' : subBu ? '' : 'empty'}
            value={subBu?.key ?? ''}
            onChange={e => onNavigate(e.target.value ? {buId: bu.key, subBuId: e.target.value} : {buId: bu.key})}
          >
            <option value="">Choose sub-business unit</option>
            {bu.parts.map(s => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      )}
      {bu && subBu && (
        <>
          <span className="sep">›</span>
          <select
            aria-label="Account"
            className={view.level === 'account' ? 'current' : view.account ? '' : 'empty'}
            value={view.account?.id ?? ''}
            onChange={e => onNavigate(e.target.value ? {buId: bu.key, subBuId: subBu.key, accountId: e.target.value} : {buId: bu.key, subBuId: subBu.key})}
          >
            <option value="">Choose account</option>
            {subBu.parts.map(a => (
              <option key={a.key} value={a.key}>
                {a.name}
              </option>
            ))}
          </select>
        </>
      )}
      {view.account && (
        <>
          <span className="sep">›</span>
          <select aria-label="Opportunity" className={view.opportunity ? 'current' : 'empty'} value={view.opportunity?.id ?? ''}
            onChange={e => onNavigate({...view.unit.selection, opportunityId: e.target.value || undefined})}>
            <option value="">Choose opportunity</option>
            {view.account.opportunities.filter(o => o.status === 'Active' || o.status === 'Potential').map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </>
      )}
    </nav>
  );
}

