import type {Rag} from '../model/metrics';
import {RAG_COLOURS} from '../theme';

export function Legend() {
  return (
    <div className="legend" aria-label="Colour legend">
      {(Object.keys(RAG_COLOURS) as Rag[]).map(rag => (
        <span key={rag}>
          <span className={`rag-dot small ${rag}`} />
          {RAG_COLOURS[rag].label}
        </span>
      ))}
      <span className="legend-hint">Hover a card for its formula and thresholds</span>
    </div>
  );
}
