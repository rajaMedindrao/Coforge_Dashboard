import {useEffect, useRef} from 'react';
import * as echarts from 'echarts/core';
import {BarChart, LineChart} from 'echarts/charts';
import {GridComponent, TooltipComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {RAG_COLOURS, BRAND} from '../theme';
import type {Rag} from '../model/metrics';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

export interface TrendPoint {
  label: string;
  value: number;
  target: number;
  rag: Rag;
}

interface Props {
  points: readonly TrendPoint[];
  format: (value: number) => string;
  targetLabel: string;
}

/** Three-quarter bar chart with a dashed target line; the current quarter is drawn solid. */
export function TrendBars({points, format, targetLabel}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const chart = echarts.init(element, undefined, {renderer: 'canvas'});
    const all = points.flatMap(p => [p.value, p.target]);
    const low = Math.min(...all);
    const high = Math.max(...all);
    const span = high - low || Math.abs(high) * 0.2 || 1;
    const min = Math.max(0, low - span * 1.6);
    const max = high + span * 0.35;
    const last = points.length - 1;

    chart.setOption({
      animation: false,
      grid: {left: 2, right: 2, top: 8, bottom: 18},
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: {type: 'none'},
        textStyle: {fontSize: 11, color: BRAND.navy},
        formatter: (params: Array<{dataIndex: number}>) => {
          const p = points[params[0].dataIndex];
          return `<b>${p.label}</b><br/>Actual ${format(p.value)}<br/>${targetLabel} ${format(p.target)}`;
        },
      },
      xAxis: {
        type: 'category',
        data: points.map(p => p.label),
        axisTick: {show: false},
        axisLine: {lineStyle: {color: BRAND.line}},
        axisLabel: {fontSize: 10, color: BRAND.muted, margin: 6, fontFamily: BRAND.font},
      },
      yAxis: {type: 'value', show: false, min, max, splitLine: {show: false}},
      series: [
        {
          type: 'bar',
          barWidth: '46%',
          barMinHeight: 3,
          data: points.map((p, i) => ({
            value: p.value,
            itemStyle: {color: RAG_COLOURS[p.rag].solid, opacity: i === last ? 1 : 0.4, borderRadius: [3, 3, 0, 0]},
          })),
        },
        {
          type: 'line',
          data: points.map(p => p.target),
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: {color: BRAND.navy},
          lineStyle: {color: BRAND.navy, width: 1.2, type: 'dashed'},
          z: 3,
        },
      ],
    });

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(element);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [points, format, targetLabel]);

  return <div className="trend-bars" ref={ref} role="img" aria-label={`${targetLabel} trend over three quarters`} />;
}
