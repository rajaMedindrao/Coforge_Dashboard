import {QUARTERS} from '../../../sales-performance/src/data/staticData';
import type {GrowthFigures} from '../model/growth';
import type {GrowthMetric} from '../model/growthMetrics';
import {BRAND, ragSolid} from '../theme';
import {useChart} from './useChart';

interface Props {
  metric: GrowthMetric;
  /** Figures for each of the three quarters, oldest first */
  series: readonly GrowthFigures[];
}

/** Same layout as the Sales tab KPI card; cards without a RAG show a grey dot and grey bars. */
export function GrowthKpiCard({metric, series}: Props) {
  const now = series[series.length - 1];
  const rag = metric.rag(now);
  const noteRag = metric.noteRag?.(now);

  return (
    <article className="kpi-card" data-metric={metric.key} tabIndex={0} aria-describedby={`tip-${metric.key}`}>
      <header>
        <span className={`rag-dot ${rag}`} aria-label={rag === 'neutral' ? 'no RAG' : rag} />
        <h3>{metric.label}</h3>
        <span className="info" aria-hidden="true">i</span>
      </header>
      <div className="kpi-value">{metric.display(now)}</div>
      <div className="kpi-target">
        <span>{metric.targetText(now)}</span>
        <span className={`variance ${rag}`}>{metric.varianceText(now)}</span>
      </div>
      <div className="kpi-note">
        {noteRag && <span className={`rag-dot small ${noteRag}`} />}
        {metric.cardNote(now)}
      </div>
      <MiniBars metric={metric} series={series} />
      <div className="tooltip" role="tooltip" id={`tip-${metric.key}`}>
        <strong>{metric.formula}</strong>
        <span>{metric.thresholds}</span>
      </div>
    </article>
  );
}

/** Three-quarter bars with an optional dashed target line; the current quarter is solid. */
function MiniBars({metric, series}: Props) {
  const {chart} = metric;
  const ref = useChart(() => {
    const values = series.map(chart.value);
    const targets = chart.target ? series.map(chart.target) : [];
    const all = [...values, ...targets];
    const low = Math.min(...all);
    const high = Math.max(...all);
    const span = high - low || Math.abs(high) * 0.2 || 1;
    const last = series.length - 1;
    return {
      animation: false,
      grid: {left: 2, right: 2, top: 6, bottom: 18},
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: {type: 'none'},
        textStyle: {fontSize: 11, color: BRAND.navy},
        formatter: (params: Array<{dataIndex: number}>) => {
          const i = params[0].dataIndex;
          const f = series[i];
          const main = chart.tooltip ? chart.tooltip(f) : `${chart.label} ${chart.format(values[i])}`;
          return `<b>${QUARTERS[i].label}</b><br/>${main}${chart.target ? `<br/>Target ${chart.format(targets[i])}` : ''}`;
        },
      },
      xAxis: {
        type: 'category',
        data: QUARTERS.map(q => q.label),
        axisTick: {show: false},
        axisLine: {lineStyle: {color: BRAND.line}},
        axisLabel: {fontSize: 10, color: BRAND.muted, margin: 6, fontFamily: BRAND.font},
      },
      yAxis: {type: 'value', show: false, min: low >= 0 ? Math.max(0, low - span * 1.6) : low - span * 0.3, max: high + span * 0.35},
      series: [
        {
          type: 'bar',
          barWidth: '46%',
          barMinHeight: 3,
          data: series.map((f, i) => ({
            value: values[i],
            itemStyle: {color: ragSolid(metric.rag(f)), opacity: i === last ? 1 : 0.4, borderRadius: [3, 3, 0, 0]},
          })),
        },
        ...(chart.target
          ? [{
              type: 'line',
              data: targets,
              symbol: 'circle',
              symbolSize: 4,
              itemStyle: {color: BRAND.navy},
              lineStyle: {color: BRAND.navy, width: 1.2, type: 'dashed'},
              z: 3,
            }]
          : []),
      ],
    };
  }, [series, metric]);

  return <div className="trend-bars" ref={ref} role="img" aria-label={`${chart.label} over three quarters`} />;
}
