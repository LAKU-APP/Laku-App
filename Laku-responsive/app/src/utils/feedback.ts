// Umpan balik ringan: bunyi singkat (Web Audio) + getaran (bila didukung).
// Dipakai mis. saat checkout berhasil & saat notifikasi baru masuk.
// Semua dibungkus try/catch agar tidak pernah mengganggu alur utama.

// Satu AudioContext dipakai bersama (lebih andal daripada bikin baru tiap kali).
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    const Ctx = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    // Browser sering memulai context dalam keadaan 'suspended' (kebijakan autoplay).
    // Resume di sini agar bunyi keluar setelah ada interaksi pengguna.
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

export function vibrate(pattern: number | number[] = 30) {
  try { navigator.vibrate?.(pattern); } catch { /* tidak didukung — abaikan */ }
}

// Satu nada dengan envelope naik-turun halus (menghindari bunyi "klik").
function tone(freq: number, startOffset: number, durationMs: number, gainPeak = 0.2) {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + startOffset;
  const dur = durationMs / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playBeep(frequency = 880, durationMs = 120) {
  tone(frequency, 0, durationMs);
}

// Checkout sukses: dua nada naik (ka-ching) + getaran.
export function successFeedback() {
  tone(660, 0, 110);
  tone(990, 0.1, 160);
  vibrate(35);
}

// Notifikasi masuk: "ding" lembut dua nada + getaran pendek.
export function notifySound() {
  tone(880, 0, 90, 0.16);
  tone(1320, 0.08, 150, 0.16);
  vibrate(20);
}
