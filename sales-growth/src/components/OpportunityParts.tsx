import {shortDate} from '../../../sales-performance/src/model/format';
import {AS_OF, STAGES, type Opportunity, type OpportunityType, type Rival, type ServiceLine} from '../data/growthData';
import {ragOfMarginPct, ragOfWinPct} from '../model/growthMetrics';
import {TYPE_COLOURS, TYPE_SHORT} from '../theme';

const SERVICE_SHORT: Record<ServiceLine, string> = {
  'Digital Engineering': 'Engineering',
  'Data & AI': 'Data & AI',
  'Cloud & Infra': 'Cloud',
  'Enterprise Apps': 'Ent. Apps',
  'Quality Engineering': 'QE',
};

export const initials = (name: string) =>
  name
    .replace(/^Dr\. /, '')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2);

const daysBetween = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / 86_400_000;
export const closesWithin30Days = (opp: Opportunity) => opp.status === 'Active' && daysBetween(AS_OF, opp.expectedClose) <= 30;

export function TypeChip({type}: {type: OpportunityType}) {
  return (
    <span className="type-chip" style={{color: TYPE_COLOURS[type], borderColor: TYPE_COLOURS[type]}}>
      {TYPE_SHORT[type]}
    </span>
  );
}

export function ServiceTag({line}: {line: ServiceLine}) {
  return (
    <span className="sl-tag" title={line}>
      {SERVICE_SHORT[line]}
    </span>
  );
}

export function WinBar({opp}: {opp: Opportunity}) {
  if (opp.status !== 'Active' || opp.winPct === undefined) return <span className="muted-text">No win % yet</span>;
  const rag = ragOfWinPct(opp.winPct);
  return (
    <span className="win-bar" title={`Expected win ${opp.winPct}%`}>
      <span className="win-track">
        <span className={`win-fill ${rag}`} style={{width: `${opp.winPct}%`}} />
      </span>
      <b className={rag}>{opp.winPct}%</b>
    </span>
  );
}

export function StageTracker({opp}: {opp: Opportunity}) {
  const reached = opp.stage ? STAGES.indexOf(opp.stage) : -1;
  return (
    <span className="stage-tracker" title={opp.stage ?? 'Potential: not yet qualified'}>
      <span className="steps">
        {STAGES.map((stage, i) => (
          <i key={stage} className={i <= reached ? 'done' : ''} />
        ))}
      </span>
      <small>{opp.stage ?? 'Potential'}</small>
    </span>
  );
}

export function CloseDate({opp}: {opp: Opportunity}) {
  return <span className={closesWithin30Days(opp) ? 'close-date soon' : 'close-date'}>{shortDate(opp.expectedClose)}</span>;
}

export function MarginBadge({marginPct}: {marginPct: number}) {
  return <span className={`margin-badge ${ragOfMarginPct(marginPct)}`}>{marginPct}%</span>;
}

export function CompetitorChips({competitors}: {competitors: readonly Rival[]}) {
  return (
    <span className="comp-chips">
      {competitors.map((c, i) => (
        <span key={c} className={i === 0 ? 'comp-chip main' : 'comp-chip'}>
          {c}
        </span>
      ))}
    </span>
  );
}

export function TeamInitials({team}: {team: readonly string[]}) {
  return (
    <span className="team">
      {team.map(name => (
        <span key={name} className="avatar" title={name}>
          {initials(name)}
        </span>
      ))}
    </span>
  );
}
