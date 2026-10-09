import type {Account, MilestoneStatus, Project} from '../data/staticData';
import {money, shortDate} from '../model/format';
import type {Rag} from '../model/metrics';

const STATUS_RAG: Record<MilestoneStatus, Rag> = {'On track': 'green', 'At risk': 'amber', Late: 'red'};

export function DealsTable({account}: {account: Account}) {
  const deals = [...account.openDeals].sort((a, b) => b.value - a.value);
  return (
    <section className="table-panel">
      <div className="table-heading">
        <h2>Top 3 open deals · {account.name}</h2>
      </div>
      <table className="comparison detail">
        <thead>
          <tr>
            <th className="name-col">Deal</th>
            <th>Value</th>
            <th>Stage</th>
            <th>Expected close</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(deal => (
            <tr key={deal.name} className="static">
              <td className="name-col">
                <strong>{deal.name}</strong>
              </td>
              <td>
                <strong>{money(deal.value)}</strong>
              </td>
              <td>
                <span className="stage">{deal.stage}</span>
              </td>
              <td>{shortDate(deal.expectedClose)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function MilestonesTable({project, accountName}: {project: Project; accountName: string}) {
  return (
    <section className="table-panel">
      <div className="table-heading">
        <h2>
          Next 3 milestones · {project.name}, {accountName}
        </h2>
      </div>
      <table className="comparison detail">
        <thead>
          <tr>
            <th className="name-col">Milestone</th>
            <th>Due date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {project.nextMilestones.map(milestone => (
            <tr key={milestone.name} className="static">
              <td className="name-col">
                <strong>{milestone.name}</strong>
              </td>
              <td>{shortDate(milestone.due)}</td>
              <td className={`rag-cell ${STATUS_RAG[milestone.status]}`}>
                <strong>{milestone.status}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
