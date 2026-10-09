import {useEffect, useRef} from 'react';
import * as echarts from 'echarts/core';
import {BarChart, LineChart, ScatterChart} from 'echarts/charts';
import {GraphicComponent, GridComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

echarts.use([BarChart, LineChart, ScatterChart, GridComponent, TooltipComponent, MarkLineComponent, MarkAreaComponent, GraphicComponent, CanvasRenderer]);

/** Draws an ECharts option into the returned element and redraws when `deps` change. */
export function useChart(build: () => echarts.EChartsCoreOption, deps: readonly unknown[], onClick?: (dataIndex: number, seriesIndex: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const clickRef = useRef(onClick);
  clickRef.current = onClick;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const chart = echarts.init(element, undefined, {renderer: 'canvas'});
    chart.setOption(build());
    chart.on('click', params => {
      if (params.componentType !== 'series' || typeof params.dataIndex !== 'number') return;
      clickRef.current?.(params.dataIndex, params.seriesIndex ?? 0);
    });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(element);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
