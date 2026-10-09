import type {Unit} from '../model/hierarchy';
import type {MetricDef} from '../model/metrics';
import type {TalkingPoint} from '../model/talkingPoints';

interface Props<F> {
  title: string;
  nameHeader: string;
  rows: readonly Unit[];
  metrics: readonly MetricDef<F>[];
  figuresFor: (unit: Unit) => readonly F[];
  talkingPointsFor: (unit: Unit, siblings: readonly Unit[]) => TalkingPoint[];
  onSelect: (unit: Unit) => void;
}

export function ComparisonTable<F>({title, nameHeader, rows, metrics, figuresFor, talkingPointsFor, onSelect}: Props<F>) {
  return (
    <section className="table-panel">
      <div className="table-heading">
        <h2>{title}</h2>
        <span className="hint">Click a row to drill down</span>
      </div>
      <table className={metrics.length > 5 ? 'comparison wide' : 'comparison'}>
        <thead>
          <tr>
            <th className="name-col">{nameHeader}</th>
            {metrics.map(metric => (
              <th key={metric.key}>{metric.label}</th>
            ))}
            <th className="discuss-col">What to discuss</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const series = figuresFor(row);
            const now = series[series.length - 1];
            return (
              <tr
                key={row.key}
                tabIndex={0}
                onClick={() => onSelect(row)}
                onKeyDown={event => event.key === 'Enter' && onSelect(row)}
                aria-label={`Open ${row.name}`}
              >
                <td className="name-col">
                  <strong>{row.name}</strong>
                  <small>{row.owner}</small>
                </td>
                {metrics.map(metric => (
                  <td key={metric.key} className={`rag-cell ${metric.rag(now)}`}>
                    <strong>{metric.format(metric.value(now))}</strong>
                    <small>{metric.cellNote(series)}</small>
                  </td>
                ))}
                <td className="discuss-col">
                  <ul>
                    {talkingPointsFor(row, rows).map(point => (
                      <li key={point.text}>
                        <span className={`rag-dot small ${point.rag}`} />
                        {point.text}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
