import {useMemo} from 'react';
import {QUARTERS} from '../data/staticData';
import type {MetricDef} from '../model/metrics';
import {TrendBars} from './TrendBars';

interface Props<F> {
  metric: MetricDef<F>;
  /** Figures for each of the three quarters, oldest first */
  series: readonly F[];
}

export function KpiCard<F>({metric, series}: Props<F>) {
  const now = series[series.length - 1];
  const rag = metric.rag(now);
  const points = useMemo(
    () => series.map((f, i) => ({label: QUARTERS[i].label, value: metric.value(f), target: metric.target(f), rag: metric.rag(f)})),
    [series, metric],
  );
  const targetWord = metric.targetText(now).split(' ')[0];

  return (
    <article className="kpi-card" data-metric={metric.key} tabIndex={0} aria-describedby={`tip-${metric.key}`}>
      <header>
        <span className={`rag-dot ${rag}`} aria-label={rag} />
        <h3>{metric.label}</h3>
        <span className="info" aria-hidden="true">i</span>
      </header>
      <div className="kpi-value">{metric.format(metric.value(now))}</div>
      <div className="kpi-target">
        <span>{metric.targetText(now)}</span>
        <span className={`variance ${rag}`}>{metric.varianceText(now)}</span>
      </div>
      <div className="kpi-note">{metric.cardNote(now)}</div>
      <TrendBars points={points} format={metric.format} targetLabel={targetWord} />
      <div className="tooltip" role="tooltip" id={`tip-${metric.key}`}>
        <strong>{metric.formula}</strong>
        <span>{metric.thresholds}</span>
      </div>
    </article>
  );
}
