// Generator kepingan konfeti (dipisah dari komponen agar Fast Refresh tetap
// bersih — file komponen sebaiknya hanya meng-export komponen).
// Dipanggil DI DALAM effect/event handler (Math.random tidak boleh saat render).
const COLORS = ['#1A56DB', '#22c55e', '#F97316', '#fbbf24', '#60A5FA', '#16a34a', '#ef4444'];

export interface ConfettiPiece {
  id: number;
  left: number;
  dx: number;
  rot: number;
  dur: number;
  delay: number;
  color: string;
  w: number;
  round: boolean;
}

export function makeConfettiPieces(count = 44): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    dx: Math.round((Math.random() - 0.5) * 240),
    rot: Math.round(360 + Math.random() * 540),
    dur: 2.4 + Math.random() * 1.4,
    delay: Math.random() * 0.5,
    color: COLORS[i % COLORS.length],
    w: 7 + Math.round(Math.random() * 5),
    round: Math.random() > 0.6,
  }));
}
