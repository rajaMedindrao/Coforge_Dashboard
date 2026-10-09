const MINUS = '\u2212';

const signOf = (value: number) => (value > 0 ? '+' : value < 0 ? MINUS : '');

/** Money held in USD thousands: $35.8M, $1.4M, $0.7M; only amounts under $100K show as $40K. */
export function money(thousands: number): string {
  const abs = Math.abs(thousands);
  const text = abs >= 95 ? `$${(abs / 1000).toFixed(1)}M` : `$${Math.round(abs / 10) * 10}K`;
  return thousands < 0 ? `${MINUS}${text}` : text;
}

export const signedMoney = (thousands: number) => `${signOf(Math.round(thousands))}${money(Math.abs(thousands))}`;

export const pct = (value: number) => `${value.toFixed(1)}%`;

export const signedPct = (value: number) => `${signOf(round1(value))}${Math.abs(value).toFixed(1)}%`;

export const points = (value: number) => `${signOf(round1(value))}${Math.abs(value).toFixed(1)} pts`;

export const times = (value: number) => `${value.toFixed(1)}x`;

export const signedTimes = (value: number) => `${signOf(round1(value))}${Math.abs(value).toFixed(1)}x`;

export const score = (value: number) => value.toFixed(1);

export const signedScore = (value: number) => `${signOf(round1(value))}${Math.abs(value).toFixed(1)}`;

export const count = (value: number) => Math.round(value).toLocaleString('en-US');

export const signedCount = (value: number) => `${signOf(value)}${Math.abs(Math.round(value))}`;

export const round1 = (value: number) => Math.round(value * 10) / 10;

/** ISO date to "30 Oct 2026". */
export function shortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[month - 1]} ${year}`;
}
