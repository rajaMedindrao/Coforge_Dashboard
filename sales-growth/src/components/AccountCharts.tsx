import {money, signedMoney} from '../../../sales-performance/src/model/format';
import {growthBridge, isLarge, isOpen, opportunityRow, type GrowthAccount, type OpportunityRow} from '../model/growth';
import {BRAND, RAG_COLOURS, TYPE_COLOURS, TYPE_SHORT} from '../theme';
import {useChart} from './useChart';

const AXIS = {fontSize: 10, color: BRAND.muted, fontFamily: BRAND.font};
const SPLIT = {lineStyle: {color: '#eef1f5'}};
const moneyAxis = (v: number) => money(v);

/** x = expected win %, y = annual value, size = TCV, colour = type; thick outline = large deal, dashed = Potential. */
export function OpportunityMap({account, onOpen}: {account: GrowthAccount; onOpen: (row: OpportunityRow) => void}) {
  const rows = account.opportunities.filter(isOpen).map(opp => opportunityRow(opp, account));
  const maxAnnual = Math.max(...rows.map(r => r.opp.annualValue));
  const yMax = Math.ceil((maxAnnual * 1.25) / 100) * 100;
  const split = Math.round(maxAnnual / 2 / 100) * 100;
  const maxTcv = Math.max(...rows.map(r => r.opp.tcv));
  const quadrant = (name: string, x: [number, number], y: [number, number], position: string) => [
    {name, xAxis: x[0], yAxis: y[0], label: {position, color: BRAND.muted, fontSize: 10, fontWeight: 600}},
    {xAxis: x[1], yAxis: y[1]},
  ];

  const ref = useChart(
    () => ({
      animation: false,
      grid: {left: 44, right: 14, top: 12, bottom: 32},
      tooltip: {
        confine: true,
        textStyle: {fontSize: 11, color: BRAND.navy},
        formatter: (p: {dataIndex: number}) => {
          const r = rows[p.dataIndex];
          const win = r.opp.status === 'Active' ? `${r.opp.winPct}% win` : 'Potential: no win % yet';
          return `<b>${r.opp.name}</b><br/>${r.opp.type} · ${win}<br/>Annual ${money(r.opp.annualValue)} · TCV ${money(r.opp.tcv)}`;
        },
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 25,
        name: 'Expected win %',
        nameLocation: 'middle',
        nameGap: 20,
        nameTextStyle: AXIS,
        axisLabel: {...AXIS, formatter: '{value}%'},
        splitLine: {show: false},
      },
      yAxis: {type: 'value', min: 0, max: yMax, axisLabel: {...AXIS, formatter: moneyAxis}, splitLine: SPLIT},
      series: [
        {
          type: 'scatter',
          data: rows.map(r => {
            const potential = r.opp.status === 'Potential';
            const colour = TYPE_COLOURS[r.opp.type];
            return {
              value: [potential ? 2 : r.opp.winPct, r.opp.annualValue],
              symbolSize: 12 + 30 * Math.sqrt(r.opp.tcv / maxTcv),
              itemStyle: {
                color: potential ? 'rgba(120,135,155,0.12)' : colour,
                opacity: potential ? 1 : 0.85,
                borderColor: isLarge(r.opp) ? BRAND.navy : potential ? colour : '#fff',
                borderWidth: isLarge(r.opp) ? 3 : potential ? 1.5 : 1,
                borderType: potential ? 'dashed' : 'solid',
              },
            };
          }),
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {color: '#c3ccd8', type: 'dashed', width: 1},
            label: {show: false},
            data: [{xAxis: 50}, {yAxis: split}],
          },
          markArea: {
            silent: true,
            itemStyle: {color: 'transparent'},
            data: [
              quadrant('Focus', [50, 100], [split, yMax], 'insideTopRight'),
              quadrant('Push to win', [0, 50], [split, yMax], 'insideTopLeft'),
              quadrant('Quick wins', [50, 100], [0, split], 'insideBottomRight'),
              quadrant('Low priority', [0, 50], [0, split], 'insideBottomLeft'),
            ],
          },
        },
      ],
    }),
    [account],
    index => onOpen(rows[index]),
  );

  const types = [...new Set(rows.map(r => r.opp.type))];
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Opportunity map</h2>
        <span className="chart-legend">
          {types.map(t => (
            <span key={t}>
              <i style={{background: TYPE_COLOURS[t]}} />
              {TYPE_SHORT[t]}
            </span>
          ))}
        </span>
      </div>
      <div className="chart" ref={ref} role="img" aria-label="Opportunity map" />
      <div className="panel-foot">Size = TCV · thick outline = large deal (≥ $10M) · dashed = Potential, not yet active</div>
    </section>
  );
}

/** FY26 revenue → change in secured work → + expected renewals → + expected new → projected FY27, against the target. */
export function GrowthBridge({accounts}: {accounts: readonly GrowthAccount[]}) {
  const b = growthBridge(accounts);
  const afterSecured = b.fy26 + b.securedChange;
  const steps = [
    {label: 'FY26 revenue', base: 0, value: b.fy26, colour: BRAND.navySoft, text: money(b.fy26)},
    {
      label: 'Change in secured work',
      base: Math.min(b.fy26, afterSecured),
      value: Math.abs(b.securedChange),
      colour: b.securedChange < 0 ? RAG_COLOURS.red.solid : RAG_COLOURS.green.solid,
      text: signedMoney(b.securedChange),
    },
    {label: '+ Expected renewals', base: afterSecured, value: b.renewals, colour: TYPE_COLOURS.Renewal, text: `+${money(b.renewals)}`},
    {label: '+ Expected new opportunities', base: afterSecured + b.renewals, value: b.newWork, colour: TYPE_COLOURS.Expansion, text: `+${money(b.newWork)}`},
    {label: 'Projected FY27', base: 0, value: b.projected, colour: BRAND.navy, text: money(b.projected)},
  ];
  const low = Math.min(afterSecured, b.fy26);
  const high = Math.max(b.projected, b.target, b.fy26);
  const yMin = Math.max(0, Math.floor((low - (high - low) * 0.9) / 100) * 100);
  const above = b.gap <= 0;

  const ref = useChart(
    () => ({
      animation: false,
      grid: {left: 44, right: 12, top: 18, bottom: 34},
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: {type: 'shadow'},
        textStyle: {fontSize: 11, color: BRAND.navy},
        formatter: (params: Array<{dataIndex: number}>) => `<b>${steps[params[0].dataIndex].label}</b><br/>${steps[params[0].dataIndex].text}`,
      },
      xAxis: {
        type: 'category',
        data: ['FY26', 'Secured\nchange', 'Renewals', 'New', 'Projected\nFY27'],
        axisTick: {show: false},
        axisLabel: {...AXIS, lineHeight: 11},
        axisLine: {lineStyle: {color: BRAND.line}},
      },
      yAxis: {type: 'value', min: yMin, max: Math.ceil((high * 1.04) / 100) * 100, axisLabel: {...AXIS, formatter: moneyAxis}, splitLine: SPLIT},
      series: [
        {type: 'bar', stack: 'w', silent: true, itemStyle: {color: 'transparent'}, data: steps.map(s => s.base)},
        {
          type: 'bar',
          stack: 'w',
          barWidth: '52%',
          barMinHeight: 2,
          data: steps.map(s => ({value: s.value, itemStyle: {color: s.colour, borderRadius: 2}})),
          label: {show: true, position: 'top', fontSize: 10, color: BRAND.navy, formatter: (p: {dataIndex: number}) => steps[p.dataIndex].text},
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {color: BRAND.coral, type: 'dashed', width: 1.4},
            label: {formatter: `Target ${money(b.target)}`, position: 'insideStartTop', fontSize: 10, color: BRAND.coral},
            data: [{yAxis: b.target}],
          },
        },
      ],
    }),
    [accounts],
  );

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Growth bridge to FY27</h2>
        <span className={above ? 'gap-label green' : 'gap-label red'}>{above ? `Above target by ${money(-b.gap)}` : `Gap to target ${money(b.gap)}`}</span>
      </div>
      <div className="chart" ref={ref} role="img" aria-label="Growth bridge from FY26 revenue to projected FY27 revenue" />
      <div className="panel-foot">Expected = FY27 revenue if won × expected win %; Potential opportunities excluded</div>
    </section>
  );
}
