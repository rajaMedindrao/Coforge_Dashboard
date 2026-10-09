import {BUSINESS_UNITS} from '../data/staticData';
import type {Page, Selection, View} from '../model/hierarchy';

interface Props {
  page: Page;
  view: View;
  onNavigate: (selection: Selection) => void;
}

/** Company → BU → Sub-BU → person. Each level is a picker; choosing the blank option steps back up. */
export function Breadcrumb({page, view, onNavigate}: Props) {
  const {bu, subBu} = view;
  const personLabel = page === 'sales' ? 'client partner' : 'delivery manager';
  const people = !subBu
    ? []
    : page === 'sales'
      ? subBu.accounts.map(a => ({key: a.id, name: a.clientPartner}))
      : subBu.projects.map(p => ({key: p.id, name: p.deliveryManager}));

  return (
    <nav className="breadcrumb" aria-label="Level">
      <button type="button" className={view.level === 'company' ? 'current' : ''} onClick={() => onNavigate({})}>
        Company
      </button>
      <span className="sep">›</span>
      <select
        aria-label="Business unit"
        className={view.level === 'bu' ? 'current' : bu ? '' : 'empty'}
        value={bu?.id ?? ''}
        onChange={e => onNavigate(e.target.value ? {buId: e.target.value} : {})}
      >
        <option value="">Choose business unit</option>
        {BUSINESS_UNITS.map(b => (
          <option key={b.id} value={b.id}>
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
            value={subBu?.id ?? ''}
            onChange={e => onNavigate(e.target.value ? {buId: bu.id, subBuId: e.target.value} : {buId: bu.id})}
          >
            <option value="">Choose sub-business unit</option>
            {bu.subBus.map(s => (
              <option key={s.id} value={s.id}>
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
            aria-label={personLabel}
            className={view.level === 'person' ? 'current' : 'empty'}
            value={view.level === 'person' ? view.unit.key : ''}
            onChange={e => onNavigate(e.target.value ? {buId: bu.id, subBuId: subBu.id, personId: e.target.value} : {buId: bu.id, subBuId: subBu.id})}
          >
            <option value="">Choose {personLabel}</option>
            {people.map(p => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
        </>
      )}
    </nav>
  );
}
