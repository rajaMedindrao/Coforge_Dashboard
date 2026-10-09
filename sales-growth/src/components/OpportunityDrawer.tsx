import {useEffect} from 'react';
import {money, pct, shortDate, signedPct} from '../../../sales-performance/src/model/format';
import {PRODUCTS} from '../data/growthData';
import {competitorContract, divisionOf, type OpportunityRow} from '../model/growth';
import {CloseDate, CompetitorChips, MarginBadge, ServiceTag, StageTracker, TeamInitials, TypeChip, WinBar, initials} from './OpportunityParts';

const STRENGTH_RAG = {Strong: 'green', Medium: 'amber', Weak: 'red'} as const;

/** Side drawer with every field of one opportunity. */
export function OpportunityDrawer({row, onClose}: {row: OpportunityRow; onClose: () => void}) {
  const {opp, account} = row;
  const detail = opp.detail;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const typeFields = typeSpecificFields(row);
  const stakeholders = (detail?.decisionMakers ?? []).map(name => account.stakeholders.find(s => s.name === name)!).filter(Boolean);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-label={opp.name} onClick={e => e.stopPropagation()}>
        <header>
          <div>
            <TypeChip type={opp.type} /> <ServiceTag line={opp.serviceLine} />
            {opp.status === 'Potential' && <span className="potential-tag">Potential · not in projection</span>}
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <h2>{opp.name}</h2>
        <p className="drawer-sub">
          {account.name} · {account.buName} / {account.subBuName} · Client Partner {account.clientPartner}
        </p>

        <dl className="facts">
          <div>
            <dt>TCV</dt>
            <dd>{money(opp.tcv)}</dd>
          </div>
          <div>
            <dt>Annual value</dt>
            <dd>{money(opp.annualValue)}</dd>
          </div>
          <div>
            <dt>FY27 revenue if won</dt>
            <dd>{money(row.revenueIfWon)}</dd>
          </div>
          <div>
            <dt>Expected FY27 revenue</dt>
            <dd>{opp.status === 'Active' ? money(row.expectedRevenue) : 'Not active'}</dd>
          </div>
          <div>
            <dt>Expected contract value</dt>
            <dd>{opp.status === 'Active' ? money(row.expectedValue) : 'Not active'}</dd>
          </div>
          <div>
            <dt>Win %</dt>
            <dd>
              <WinBar opp={opp} />
            </dd>
          </div>
          <div>
            <dt>Stage</dt>
            <dd>
              <StageTracker opp={opp} />
            </dd>
          </div>
          <div>
            <dt>Expected close</dt>
            <dd>
              <CloseDate opp={opp} />
            </dd>
          </div>
          <div>
            <dt>Planned margin</dt>
            <dd>
              <MarginBadge marginPct={opp.plannedMarginPct} />
            </dd>
          </div>
          <div>
            <dt>Competitors</dt>
            <dd>
              <CompetitorChips competitors={opp.competitors} />
            </dd>
          </div>
          <div>
            <dt>Deal team</dt>
            <dd>
              <TeamInitials team={opp.dealTeam} /> <small>{opp.dealTeam.join(', ')}</small>
            </dd>
          </div>
        </dl>

        <h3>{opp.type} details</h3>
        <dl className="facts two">
          {typeFields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {detail && (
          <>
            <h3>Scope</h3>
            <p>{detail.scope}</p>

            <h3>Client decision-makers</h3>
            <ul className="people">
              {stakeholders.map(s => (
                <li key={s.name}>
                  <span className="avatar client">{initials(s.name)}</span>
                  <span>
                    <b>{s.name}</b> · {s.role}
                  </span>
                  <span className={`strength ${STRENGTH_RAG[s.strength]}`}>{s.strength}</span>
                </li>
              ))}
            </ul>

            <h3>Competitors and why we win</h3>
            <p>
              <CompetitorChips competitors={opp.competitors} /> {detail.whyWeWin}
            </p>

            <h3>Risks</h3>
            <ul className="risks">
              {detail.risks.map(r => (
                <li key={r}>{r}</li>
              ))}
            </ul>

            <h3>Next 3 steps</h3>
            <ol className="steps-list">
              {detail.nextSteps.map(s => (
                <li key={s.step}>
                  <span>{s.step}</span>
                  <small>
                    {s.owner} · {shortDate(s.due)}
                  </small>
                </li>
              ))}
            </ol>

            <h3>
              Coforge product relevance <span className="illustrative">illustrative</span>
            </h3>
            <ul className="products">
              {detail.products.map(p => (
                <li key={p.name}>
                  <b>{p.name}</b> <small>({PRODUCTS[p.name]})</small>: {p.why}
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}

export function typeSpecificFields({opp, account}: OpportunityRow): [string, string][] {
  switch (opp.type) {
    case 'Renewal': {
      const r = opp.renewal!;
      return [
        ['Current annual value', money(r.currentAnnualValue)],
        ['Contract end', shortDate(r.contractEnd)],
        ['Uplift / cut', signedPct((100 * opp.annualValue) / r.currentAnnualValue - 100)],
        ['Status', r.status],
      ];
    }
    case 'Expansion':
      return [
        ['Project extended', opp.expansion!.project],
        ['Added annual value', money(opp.annualValue)],
      ];
    case 'Cross-sell':
      return [
        ['New service line', opp.serviceLine],
        ["Client's spend on it", money(account.serviceLines[opp.serviceLine].spend)],
      ];
    case 'New division/region': {
      const d = divisionOf(account, opp)!;
      return [
        ['Division / region', d.name],
        ['Its IT spend', money(d.spend)],
        ['Sponsor identified', d.sponsorIdentified ? 'Yes' : 'Not yet'],
      ];
    }
    case 'Competitor takeover': {
      const c = competitorContract(account, opp)!;
      return [
        ['Competitor', c.competitor],
        ['Their contract value', `${money(c.annualValue)} a year`],
        ['Their contract ends', shortDate(c.endDate)],
        ['Client satisfaction with them', c.satisfaction],
        ['Share of their contract', pct((100 * opp.annualValue) / c.annualValue)],
      ];
    }
  }
}

