import type {KeyboardEvent} from 'react';
import {money} from '../../../sales-performance/src/model/format';
import {largeDeals, type GrowthAccount, type OpportunityRow} from '../model/growth';
import {CloseDate, CompetitorChips, StageTracker, TypeChip, WinBar} from './OpportunityParts';

interface Props {
  title: string;
  accounts: readonly GrowthAccount[];
  limit?: number;
  showAccount: boolean;
  onOpen: (row: OpportunityRow) => void;
}

/** Open deals with TCV of $10M or more; Potential ones are dashed and greyed. */
export function LargeDeals({title, accounts, limit, showAccount, onOpen}: Props) {
  const rows = largeDeals(accounts).slice(0, limit);
  return (
    <section className="table-panel large-deals">
      <div className="table-heading">
        <h2>{title}</h2>
        <span className="hint">TCV of $10M or more · click a deal for details</span>
      </div>
      <table className="comparison opp-table">
        <thead>
          <tr>
            <th className="deal-col">Deal</th>
            <th>Type</th>
            <th>TCV</th>
            <th>Win %</th>
            <th>Expected value</th>
            <th>Expected FY27 revenue</th>
            <th>Stage</th>
            <th>Expected close</th>
            <th>Competitors</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.opp.id}
              className={row.opp.status === 'Potential' ? 'potential' : ''}
              tabIndex={0}
              onClick={() => onOpen(row)}
              onKeyDown={(event: KeyboardEvent) => event.key === 'Enter' && onOpen(row)}
            >
              <td className="deal-col">
                <strong>{row.opp.name}</strong>
                <small>{showAccount ? `${row.account.name} · ${row.account.clientPartner}` : row.account.clientPartner}</small>
              </td>
              <td>
                <TypeChip type={row.opp.type} />
              </td>
              <td>
                <strong>{money(row.opp.tcv)}</strong>
              </td>
              <td>
                <WinBar opp={row.opp} />
              </td>
              <td>{row.opp.status === 'Active' ? money(row.expectedValue) : 'Not active'}</td>
              <td>{row.opp.status === 'Active' ? money(row.expectedRevenue) : 'Not active'}</td>
              <td>
                <StageTracker opp={row.opp} />
              </td>
              <td>
                <CloseDate opp={row.opp} />
              </td>
              <td>
                <CompetitorChips competitors={row.opp.competitors} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
