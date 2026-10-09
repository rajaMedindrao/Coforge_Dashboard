import {shortDate} from '../../../sales-performance/src/model/format';
import {AS_OF, PRODUCTS} from '../data/growthData';
import type {OpportunityRow} from '../model/growth';
import {typeSpecificFields} from './OpportunityDrawer';
import {initials} from './OpportunityParts';

function dateNote(date: string) {
  const days = Math.round((Date.parse(date) - Date.parse(AS_OF)) / 86400000);
  return days > 0 ? `in ${days} days` : days === 0 ? 'Today' : `${Math.abs(days)} days before review date`;
}
function Avatar({name}: {name: string}) {
  return <span className="od-avatar" aria-hidden="true">{initials(name)}</span>;
}

export function OpportunityDetails({row}: {row: OpportunityRow}) {
  const {opp, account} = row;
  const detail = opp.detail!;
  const fields = typeSpecificFields(row).map(([label, value]) => [label === 'Project extended' ? 'Extends' : label, value]);
  const stakeholders = detail.decisionMakers.map(name => account.stakeholders.find(s => s.name === name)).filter(s => s !== undefined);
  return <div className="opportunity-details">
    <section className="kpi-card od-summary" aria-label="Opportunity summary">
      <div className="od-scope"><h2 className="od-label">Scope</h2><p>{detail.scope}</p></div>
      <dl className="od-facts">
        <div><dt className="od-label">Type</dt><dd><span className="od-chip od-outline">{opp.type}</span></dd></div>
        {fields.map(([label, value]) => <div key={label}><dt className="od-label">{label}</dt><dd>{value}</dd></div>)}
        <div><dt className="od-label">Expected close</dt><dd>{shortDate(opp.expectedClose)}<small>{dateNote(opp.expectedClose)}</small></dd></div>
        <div><dt className="od-label">Deal team</dt><dd className="od-team">{opp.dealTeam.map(name => <div key={name}><Avatar name={name} />{name}</div>)}</dd></div>
      </dl>
    </section>
    <div className="od-grid">
      <section className="kpi-card od-card" aria-labelledby="who-decides">
        <div className="od-head"><h2 id="who-decides">Who decides</h2><span className="hint">Client decision-makers</span></div>
        {stakeholders.map(person => <div className="od-person" key={person.name}>
          <Avatar name={person.name} /><div className="od-person-text"><strong>{person.name}</strong><small>{person.role}</small></div>
          <span className={`od-chip od-${{Strong: 'green', Medium: 'amber', Weak: 'red'}[person.strength]}`}><span className={`rag-dot small ${{Strong: 'green', Medium: 'amber', Weak: 'red'}[person.strength]}`} />{person.strength === 'Medium' ? 'Neutral' : person.strength}</span>
        </div>)}
      </section>
      <section className="kpi-card od-card" aria-labelledby="competition">
        <div className="od-head"><h2 id="competition">Competition</h2><span className="hint">Can we win?</span></div>
        <h3 className="od-label">Competing against</h3>
        <div className="od-chips">{opp.competitors.map((name, index) => <span className="od-chip" key={name}>{index === 0 ? <><strong>{name}</strong><small>Main</small></> : name}</span>)}</div>
        <h3 className="od-label">Why we win</h3><p>{detail.whyWeWin}</p>
        <div className="od-risk"><h3 className="od-label">Risk to watch</h3>{detail.risks.map(risk => <p key={risk}>{risk}</p>)}</div>
      </section>
      <section className="kpi-card od-card" aria-labelledby="offering">
        <div className="od-head"><h2 id="offering">Coforge offering</h2><span className="hint">illustrative</span></div>
        {detail.products.map(product => <div className="od-product" key={product.name}>
          <div className="od-product-name">{product.name}</div><small>{PRODUCTS[product.name]}</small>
          <div className="od-divider" /><h3 className="od-label">How it helps here</h3><p>{product.why}</p>
        </div>)}
      </section>
    </div>
    <section className="kpi-card od-card" aria-labelledby="next-steps">
      <div className="od-head"><h2 id="next-steps">Next steps</h2><span className="hint">As of {shortDate(AS_OF)}</span></div>
      <ol className="od-timeline">
        {detail.nextSteps.map((step, index) => <li key={`${index}-${step.step}`}>
          <div className="od-track"><span className={`od-number ${index === 0 ? 'current' : ''}`}>{index + 1}</span><span className="od-line" /></div>
          <strong>{step.step}{index === 0 && <span className="od-next">Next</span>}</strong>
          <div className="od-step-owner"><Avatar name={step.owner} />{step.owner}</div><small><b>{shortDate(step.due)}</b> · {dateNote(step.due)}</small>
        </li>)}
        <li><div className="od-track"><span className="od-number close" aria-hidden="true">✓</span></div><strong>Client decision</strong><div className="od-step-owner hint">Expected close</div><small><b>{shortDate(opp.expectedClose)}</b> · {dateNote(opp.expectedClose)}</small></li>
      </ol>
    </section>
  </div>;
}
