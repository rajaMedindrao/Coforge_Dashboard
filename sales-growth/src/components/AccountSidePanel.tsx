import {money, pct, shortDate} from '../../../sales-performance/src/model/format';
import {SERVICE_LINES} from '../data/growthData';
import {TAKEOVER_WINDOW_END, walletSplit, type GrowthAccount} from '../model/growth';
import {WALLET_COLOURS} from '../theme';

const TONE_RAG = {positive: 'green', watch: 'amber', risk: 'red'} as const;
const SATISFACTION_RAG = {Low: 'red', Medium: 'amber', High: 'green'} as const;

/** Wallet split, competitor contracts, service-line penetration and client signals for one account. */
export function AccountSidePanel({account}: {account: GrowthAccount}) {
  const split = walletSplit(account);
  const contracts = [...account.contracts].sort((a, b) => a.endDate.localeCompare(b.endDate));
  const served = SERVICE_LINES.filter(line => account.serviceLines[line].coforge).length;

  return (
    <section className="panel side-panel">
      <h3>Wallet split · client IT spend {money(account.itSpend)}</h3>
      <div className="wallet-bar" role="img" aria-label="Wallet split">
        {split.map(s => (
          <span key={s.name} style={{width: `${(100 * s.value) / account.itSpend}%`, background: WALLET_COLOURS[s.name]}} title={`${s.name} ${money(s.value)}`} />
        ))}
      </div>
      <div className="wallet-legend">
        {split.map(s => (
          <span key={s.name} className={s.name === 'Coforge' ? 'ours' : ''}>
            <i style={{background: WALLET_COLOURS[s.name]}} />
            {s.name} {pct((100 * s.value) / account.itSpend)}
          </span>
        ))}
      </div>

      <h3>Competitor contracts</h3>
      <ul className="contracts">
        {contracts.map(c => {
          const expiring = c.endDate <= TAKEOVER_WINDOW_END;
          return (
            <li key={c.id}>
              <span className="c-main">
                <b>{c.competitor}</b> {c.scope} · {money(c.annualValue)}/yr
              </span>
              <span className="c-meta">
                <span className={expiring ? 'expiring' : ''}>{expiring ? 'Expires' : 'Ends'} {shortDate(c.endDate)}</span>
                <span className={`sat ${SATISFACTION_RAG[c.satisfaction]}`}>Satisfaction {c.satisfaction.toLowerCase()}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <h3>
        Service-line penetration · {served} of {SERVICE_LINES.length}
      </h3>
      <div className="penetration">
        {SERVICE_LINES.map(line => {
          const {spend, coforge} = account.serviceLines[line];
          return (
            <span key={line} className={coforge ? 'on' : ''} title={`${line}: client spend ${money(spend)}${coforge ? ', we deliver' : ', not with us'}`}>
              <i />
              {line.replace('Digital ', '').replace('Quality Engineering', 'Quality Eng.')}
            </span>
          );
        })}
      </div>

      <h3>Client signals</h3>
      <ul className="signals">
        {account.signals.map(s => (
          <li key={s.text}>
            <span className={`rag-dot small ${TONE_RAG[s.tone]}`} />
            {s.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
