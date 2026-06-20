// Umpan balik ringan: bunyi singkat (Web Audio) + getaran (bila didukung).
// Dipakai mis. saat checkout berhasil. Semua dibungkus try/catch agar tidak
// pernah mengganggu alur utama bila browser memblokir audio/vibrate.

export function vibrate(pattern: number | number[] = 30) {
  try { navigator.vibrate?.(pattern); } catch { /* tidak didukung — abaikan */ }
}

export function playBeep(frequency = 880, durationMs = 120) {
  try {
    const Ctx = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = 0.05; // pelan, tidak mengagetkan
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.stop(ctx.currentTime + durationMs / 1000);
    osc.onended = () => ctx.close();
  } catch { /* audio diblokir — abaikan */ }
}

// Umpan balik sukses: dua nada naik + getaran singkat.
export function successFeedback() {
  playBeep(660, 90);
  setTimeout(() => playBeep(990, 130), 90);
  vibrate(30);
}
