import type {KeyboardEvent} from 'react';
import {money} from '../../../sales-performance/src/model/format';
import {OPPORTUNITY_TYPES} from '../data/growthData';
import {isOpen, opportunityRow, type GrowthAccount, type OpportunityRow} from '../model/growth';
import {CloseDate, CompetitorChips, MarginBadge, ServiceTag, StageTracker, TeamInitials, TypeChip, WinBar} from './OpportunityParts';

const sum = <T,>(items: readonly T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0);

/** Open opportunities of one account grouped by the five types; a type with none shows $0 and why. */
export function OpportunityList({account, onOpen}: {account: GrowthAccount; onOpen: (row: OpportunityRow) => void}) {
  const rows = account.opportunities.filter(isOpen).map(opp => opportunityRow(opp, account));
  const maxTcv = Math.max(...rows.map(r => r.opp.tcv));
  const closed = account.opportunities.filter(o => o.status === 'Won' || o.status === 'Lost');

  return (
    <section className="table-panel opp-list">
      <div className="table-heading">
        <h2>Opportunities · {account.name}</h2>
        <span className="hint">
          Closed in the last 12 months:{' '}
          {closed.map((o, i) => (
            <span key={o.id}>
              {i > 0 && ' · '}
              <b className={o.status === 'Won' ? 'won' : 'lost'}>{o.status}</b> {o.name} {money(o.tcv)}
              {o.status === 'Lost' ? ` to ${o.competitors[0]}` : ''}
            </span>
          ))}
        </span>
      </div>
      <table className="comparison opp-table">
        <thead>
          <tr>
            <th className="type-col">Type</th>
            <th className="deal-col">Opportunity</th>
            <th className="tcv-col">TCV · FY27 if won</th>
            <th>Win %</th>
            <th>Expected value</th>
            <th>Stage</th>
            <th>Expected close</th>
            <th className="margin-col">Margin</th>
            <th>Competitors</th>
            <th className="team-col">Team</th>
          </tr>
        </thead>
        {OPPORTUNITY_TYPES.map(type => {
          const group = rows.filter(r => r.opp.type === type);
          const active = group.filter(r => r.opp.status === 'Active');
          return (
            <tbody key={type}>
              <tr className="group-row">
                <td colSpan={10}>
                  <TypeChip type={type} />
                  {group.length > 0 ? (
                    <span className="group-summary">
                      <b>{group.length}</b> {group.length === 1 ? 'opportunity' : 'opportunities'} · <b>{money(sum(group, r => r.opp.tcv))}</b> TCV ·{' '}
                      <b>{money(sum(active, r => r.expectedRevenue))}</b> expected FY27 revenue
                    </span>
                  ) : (
                    <span className="group-summary zero">
                      <b>$0</b> · {account.noOpportunity[type]}
                    </span>
                  )}
                </td>
              </tr>
              {group.map(row => (
                <tr
                  key={row.opp.id}
                  className={row.opp.status === 'Potential' ? 'potential' : ''}
                  tabIndex={0}
                  onClick={() => onOpen(row)}
                  onKeyDown={(event: KeyboardEvent) => event.key === 'Enter' && onOpen(row)}
                  aria-label={`Open ${row.opp.name}`}
                >
                  <td className="type-col">
                    <TypeChip type={row.opp.type} />
                  </td>
                  <td className="deal-col">
                    <strong>{row.opp.name}</strong>
                    <ServiceTag line={row.opp.serviceLine} />
                  </td>
                  <td className="tcv-col">
                    <span className="tcv">
                      <b>{money(row.opp.tcv)}</b>
                      <span className="tcv-track">
                        <span className={row.opp.tcv >= 10000 ? 'tcv-bar large' : 'tcv-bar'} style={{width: `${(100 * row.opp.tcv) / maxTcv}%`}} />
                      </span>
                    </span>
                    <small>FY27 if won {money(row.revenueIfWon)}</small>
                  </td>
                  <td>
                    <WinBar opp={row.opp} />
                  </td>
                  <td>{row.opp.status === 'Active' ? money(row.expectedValue) : 'Not active'}</td>
                  <td>
                    <StageTracker opp={row.opp} />
                  </td>
                  <td>
                    <CloseDate opp={row.opp} />
                  </td>
                  <td className="margin-col">
                    <MarginBadge marginPct={row.opp.plannedMarginPct} />
                  </td>
                  <td>
                    <CompetitorChips competitors={row.opp.competitors} />
                  </td>
                  <td className="team-col">
                    <TeamInitials team={row.opp.dealTeam} />
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </section>
  );
}
