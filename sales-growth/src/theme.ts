import type {OpportunityType} from './data/growthData';
import type {GrowthRag} from './model/growthMetrics';
import {BRAND, RAG_COLOURS} from '../../sales-performance/src/theme';

export {BRAND, RAG_COLOURS};

export const NEUTRAL = {solid: '#5b6b82', tint: '#eef1f5'};

export const ragSolid = (rag: GrowthRag) => (rag === 'neutral' ? NEUTRAL.solid : RAG_COLOURS[rag].solid);

export const BU_COLOURS: Record<string, string> = {
  banking: '#1f5fa8',
  insurance: '#7a4cc2',
  travel: '#f15b40',
  healthcare: '#14917f',
};

export const TYPE_COLOURS: Record<OpportunityType, string> = {
  Renewal: '#5b6b82',
  Expansion: '#1f5fa8',
  'Cross-sell': '#14917f',
  'New division/region': '#7a4cc2',
  'Competitor takeover': '#f15b40',
};

export const TYPE_SHORT: Record<OpportunityType, string> = {
  Renewal: 'Renewal',
  Expansion: 'Expansion',
  'Cross-sell': 'Cross-sell',
  'New division/region': 'New division',
  'Competitor takeover': 'Takeover',
};

export const WALLET_COLOURS: Record<string, string> = {
  Coforge: BRAND.navy,
  TCS: '#7d8da3',
  Infosys: '#9aa8ba',
  Accenture: '#b4bfcd',
  Cognizant: '#8796ab',
  LTIMindtree: '#a7b3c3',
  'In-house': '#e3e8ef',
};
