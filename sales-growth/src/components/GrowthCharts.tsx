import {useState} from 'react';
import {QUARTERS} from '../../../sales-performance/src/data/staticData';
import {money, pct, signedPct} from '../../../sales-performance/src/model/format';
import {MARKET_GROWTH} from '../data/growthData';
import {GROWTH_TARGET_PCT, growthFigures, NOW, pipelineBy, type GrowthAccount} from '../model/growth';
import type {GrowthUnit} from '../model/growthHierarchy';
import {ragOfWinPct} from '../model/growthMetrics';
import {BRAND, BU_COLOURS, RAG_COLOURS} from '../theme';
import {useChart} from './useChart';

const AXIS = {fontSize: 10, color: BRAND.muted, fontFamily: BRAND.font};
const SPLIT = {lineStyle: {color: '#eef1f5'}};
const shortName = (name: string) => name.replace(/ (Bank|Savings|Credit Union|Commercial Bank|Trade Finance|Life|Annuity|Mutual|Property Insurance|Casualty|Airways|Air|Jetlines|Hotels|Resorts|Health Plan|Health Insurance|Benefits|Medical Center|Clinics)$/, '');

/** Bubble per account: x = share of wallet, y = YTD growth, size = untapped wallet, colour = BU. */
export function GrowthMap({accounts, onSelect}: {accounts: readonly GrowthAccount[]; onSelect: (account: GrowthAccount) => void}) {
  const points = accounts.map(account => ({account, f: growthFigures([account], NOW)}));
  const maxUntapped = Math.max(...points.map(p => p.f.untappedWallet));
  const buIds = [...new Set(accounts.map(a => a.buId))];
  const ref = useChart(
    () => ({
      animation: false,
      grid: {left: 40, right: 14, top: 14, bottom: 34},
      tooltip: {
        confine: true,
        textStyle: {fontSize: 11, color: BRAND.navy},
        formatter: (p: {dataIndex: number}) => {
          const {account, f} = points[p.dataIndex];
          return `<b>${account.name}</b><br/>Share of wallet ${pct(f.shareOfWalletPct)}<br/>YTD growth ${signedPct(f.ytdGrowthPct)}<br/>Untapped wallet ${money(f.untappedWallet)}`;
        },
      },
      xAxis: {
        type: 'value',
        name: 'Share of wallet',
        nameLocation: 'middle',
        nameGap: 20,
        nameTextStyle: AXIS,
        min: (v: {min: number}) => Math.floor(v.min - 3),
        max: (v: {max: number}) => Math.ceil(v.max + 3),
        axisLabel: {...AXIS, formatter: '{value}%'},
        splitLine: SPLIT,
      },
      yAxis: {
        type: 'value',
        name: 'YTD growth',
        nameTextStyle: {...AXIS, align: 'left'},
        min: (v: {min: number}) => Math.min(0, Math.floor(v.min - 2)),
        max: (v: {max: number}) => Math.ceil(Math.max(v.max, GROWTH_TARGET_PCT) + 3),
        axisLabel: {...AXIS, formatter: '{value}%'},
        splitLine: SPLIT,
      },
      series: [
        {
          type: 'scatter',
          data: points.map(({account, f}) => ({
            value: [f.shareOfWalletPct, f.ytdGrowthPct],
            symbolSize: 10 + 26 * Math.sqrt(f.untappedWallet / maxUntapped),
            itemStyle: {color: BU_COLOURS[account.buId], opacity: 0.78, borderColor: '#fff', borderWidth: 1},
            label: {show: true, formatter: shortName(account.name), position: 'right', fontSize: 9, color: BRAND.navySoft, distance: 2},
          })),
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {color: BRAND.navy, type: 'dashed', width: 1},
            label: {formatter: `Target +${GROWTH_TARGET_PCT}%`, fontSize: 9, color: BRAND.navy, position: 'insideEndTop'},
            data: [{yAxis: GROWTH_TARGET_PCT}],
          },
        },
      ],
    }),
    [accounts],
    index => onSelect(points[index].account),
  );
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Growth map</h2>
        {buIds.length > 1 ? (
          <span className="chart-legend">
            {buIds.map(id => (
              <span key={id}>
                <i style={{background: BU_COLOURS[id]}} />
                {accounts.find(a => a.buId === id)!.buName}
              </span>
            ))}
          </span>
        ) : (
          <span className="hint">Bubble size = untapped wallet</span>
        )}
      </div>
      <div className="chart" ref={ref} role="img" aria-label="Growth map of accounts" />
      {buIds.length > 1 && <div className="panel-foot">Bubble size = untapped wallet · click a bubble to open the account</div>}
    </section>
  );
}

/** Our YTD growth (solid) against illustrative market growth (dashed) by vertical over three quarters. */
export function MarketGrowth({units}: {units: readonly GrowthUnit[]}) {
  const rows = units.map(unit => ({
    unit,
    ours: [0, 1, 2].map(q => growthFigures(unit.accounts, q).ytdGrowthPct),
    market: MARKET_GROWTH[unit.key],
  }));
  const single = rows.length === 1;
  const ref = useChart(
    () => ({
      animation: false,
      grid: {left: 34, right: single ? 70 : 78, top: 14, bottom: 22},
      tooltip: {
        trigger: 'axis',
        confine: true,
        textStyle: {fontSize: 11, color: BRAND.navy},
        valueFormatter: (v: number) => signedPct(v),
      },
      xAxis: {type: 'category', data: QUARTERS.map(q => q.label), axisTick: {show: false}, axisLabel: AXIS, axisLine: {lineStyle: {color: BRAND.line}}},
      yAxis: {type: 'value', min: 0, axisLabel: {...AXIS, formatter: '{value}%'}, splitLine: SPLIT},
      series: rows.flatMap(({unit, ours, market}) => [
        {
          name: `${unit.name} · Coforge`,
          type: 'line',
          data: ours,
          symbolSize: 5,
          lineStyle: {width: 2.2, color: BU_COLOURS[unit.key]},
          itemStyle: {color: BU_COLOURS[unit.key]},
          endLabel: {show: true, formatter: single ? `Coforge ${signedPct(ours[2])}` : `${unit.name} ${signedPct(ours[2])}`, fontSize: 9.5, color: BU_COLOURS[unit.key]},
        },
        {
          name: `${unit.name} · market`,
          type: 'line',
          data: market,
          symbol: 'none',
          lineStyle: {width: 1.4, type: 'dashed', color: BU_COLOURS[unit.key], opacity: 0.6},
          itemStyle: {color: BU_COLOURS[unit.key]},
          endLabel: single ? {show: true, formatter: `Market ${signedPct(market[2])}`, fontSize: 9.5, color: BRAND.muted} : {show: false},
        },
      ]),
    }),
    [units],
  );
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Market growth vs our growth</h2>
        <span className="chart-legend">
          <span>
            <i className="line solid" /> Coforge YTD
          </span>
          <span>
            <i className="line dashed" /> Market (illustrative)
          </span>
        </span>
      </div>
      <div className="chart" ref={ref} role="img" aria-label="Market growth compared with our growth" />
    </section>
  );
}

/** Active TCV by opportunity type or main competitor, with value-weighted expected win %. */
export function PipelinePanel({accounts}: {accounts: readonly GrowthAccount[]}) {
  const [by, setBy] = useState<'type' | 'competitor'>('type');
  const groups = pipelineBy(accounts, by);
  const max = Math.max(...groups.map(g => g.tcv));
  const total = groups.reduce((t, g) => t + g.tcv, 0);
  const weighted = groups.reduce((t, g) => t + g.tcv * g.weightedWinPct, 0) / total;
  return (
    <section className="panel pipeline-panel">
      <div className="panel-heading">
        <h2>Active pipeline</h2>
        <div className="toggle" role="group" aria-label="Group pipeline by">
          <button type="button" className={by === 'type' ? 'on' : ''} onClick={() => setBy('type')}>
            By type
          </button>
          <button type="button" className={by === 'competitor' ? 'on' : ''} onClick={() => setBy('competitor')}>
            By main competitor
          </button>
        </div>
      </div>
      <div className="pipeline-total">
        <strong>{money(total)}</strong> TCV · value-weighted win <strong style={{color: RAG_COLOURS[ragOfWinPct(weighted)].solid}}>{Math.round(weighted)}%</strong>
      </div>
      <ul className="pipeline-bars">
        {groups.map(g => (
          <li key={g.label}>
            <span className="pb-label">{g.label}</span>
            <span className="pb-track">
              <span className="pb-bar" style={{width: `${(100 * g.tcv) / max}%`}} />
            </span>
            <span className="pb-value">
              {money(g.tcv)} <small>· {g.count}</small>
            </span>
            <span className={`pb-win ${ragOfWinPct(g.weightedWinPct)}`}>{Math.round(g.weightedWinPct)}%</span>
          </li>
        ))}
      </ul>
      <div className="panel-foot">TCV · number of deals · value-weighted expected win %</div>
    </section>
  );
}
