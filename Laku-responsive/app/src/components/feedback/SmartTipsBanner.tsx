import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

// Banner "Smart Tips" — tips singkat UMKM yang bergiliran dengan fade lembut
// tiap ~6 detik (TIDAK berjalan/scroll, supaya nyaman dibaca, tidak bikin pusing).
const TIPS = [
  'Isi harga modal tiap produk supaya laba di Dashboard akurat.',
  'Atur ambang stok di Pengaturan untuk peringatan stok menipis.',
  'Cek Analisis AI untuk rekomendasi restock & prediksi omzet.',
  'Cetak struk tiap transaksi — semuanya tersimpan di Riwayat.',
  'Backup data lewat Pengaturan agar aman saat ganti perangkat.',
  'Capai target laba harian untuk rayakan konfetinya! 🎉',
];
const INTERVAL_MS = 6000;

export default function SmartTipsBanner() {
  const [idx, setIdx] = useState(0);

  // setState di dalam callback interval (bukan sinkron di effect) → aman.
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % TIPS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0B3A8D] to-[#1A56DB] border border-white/10 card-shadow px-3.5 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
        <Lightbulb size={14} className="text-yellow-300" strokeWidth={2.5} />
      </div>
      {/* Tinggi tetap (2 baris) agar tidak ada lompatan layout saat tips berganti */}
      <div className="flex-1 min-w-0 flex items-center" style={{ minHeight: 30 }}>
        <p key={idx} className="text-[11px] font-semibold text-white/90 leading-snug line-clamp-2 animate-tip">
          {TIPS[idx]}
        </p>
      </div>
      {/* Indikator titik */}
      <div className="hidden sm:flex gap-1 shrink-0">
        {TIPS.map((_, i) => (
          <span key={i} className={`w-1 h-1 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}
