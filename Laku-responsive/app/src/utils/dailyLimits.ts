// Batas harian — disimpan per-tanggal di localStorage:
//   • Berapa kali target laba harian boleh diganti (biar tidak digonta-ganti
//     demi memicu konfeti). Maks 2x/hari.
//   • Apakah konfeti "target tercapai" sudah dirayakan hari ini (sekali sehari
//     saja agar terasa sakral).
// Semua dibungkus try/catch supaya aman bila localStorage tak tersedia.

export const MAX_TARGET_CHANGES_PER_DAY = 2;

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
function key(prefix: string): string {
  return `${prefix}-${todayStr()}`;
}
function readNum(k: string): number {
  try { return parseInt(localStorage.getItem(k) || '0', 10) || 0; } catch { return 0; }
}

// ── Batas ganti target ──────────────────────────────────────────────────────
export function getTargetChangesToday(): number {
  return readNum(key('targetChanges'));
}
export function remainingTargetChangesToday(): number {
  return Math.max(0, MAX_TARGET_CHANGES_PER_DAY - getTargetChangesToday());
}
export function canChangeTargetToday(): boolean {
  return getTargetChangesToday() < MAX_TARGET_CHANGES_PER_DAY;
}
export function bumpTargetChangesToday(): void {
  try { localStorage.setItem(key('targetChanges'), String(getTargetChangesToday() + 1)); } catch { /* abaikan */ }
}

// ── Perayaan konfeti (sekali per hari) ──────────────────────────────────────
export function wasTargetCelebratedToday(): boolean {
  try { return !!localStorage.getItem(key('targetCelebrated')); } catch { return false; }
}
export function markTargetCelebratedToday(): void {
  try { localStorage.setItem(key('targetCelebrated'), '1'); } catch { /* abaikan */ }
}
