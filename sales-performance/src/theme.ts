import type {Rag} from './model/metrics';

/** Coforge brand values carried over from the previous dashboard. */
export const BRAND = {
  navy: '#082340',
  navySoft: '#183955',
  coral: '#f15b40',
  muted: '#78879b',
  line: '#e3e8ef',
  font: '"Segoe UI", "Inter", system-ui, -apple-system, sans-serif',
} as const;

export const RAG_COLOURS: Record<Rag, {solid: string; tint: string; label: string}> = {
  green: {solid: '#188650', tint: '#e4f3ea', label: 'On or above target'},
  amber: {solid: '#c78b16', tint: '#fff2d9', label: 'Slightly below target'},
  red: {solid: '#d34141', tint: '#fde9e7', label: 'Needs action'},
};
