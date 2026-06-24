import { useEffect, useRef } from 'react';

// Maskot login interaktif — karakter "kantong belanja" LAKU.
// Reaksi:
//   • idle      → mengambang halus (bob) + kedip mata berkala (CSS infinite)
//   • password  → menutup mata saat mengetik, mengintip saat password ditampilkan
//   • ditekan   → memantul senang (loading rising-edge, Web Animations API)
//   • error     → menggeleng + wajah sedih (error rising-edge, Web Animations API)
// Pure SVG + CSS/WAAPI (tanpa library) → ringan & mulus di iOS.
interface LoginMascotProps {
  covering: boolean;   // field password fokus & disembunyikan → tutup mata
  peeking: boolean;    // field password fokus & ditampilkan → mengintip
  error?: boolean;     // ada pesan error → menggeleng + sedih
  loading?: boolean;   // sedang submit (ditekan) → memantul + senang
  size?: number;
}

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(3px)' },
  { transform: 'translateX(0)' },
];
const BOUNCE: Keyframe[] = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.12)' },
  { transform: 'scale(0.96)' },
  { transform: 'scale(1)' },
];

export default function LoginMascot({ covering, peeking, error = false, loading = false, size = 84 }: LoginMascotProps) {
  const reactRef = useRef<HTMLDivElement>(null);

  // Menggeleng saat error muncul (rising edge — saat `error` jadi true).
  useEffect(() => {
    if (error) reactRef.current?.animate(SHAKE, { duration: 440, easing: 'ease-in-out' });
  }, [error]);

  // Memantul senang saat tombol ditekan (loading jadi true).
  useEffect(() => {
    if (loading) reactRef.current?.animate(BOUNCE, { duration: 440, easing: 'ease-out' });
  }, [loading]);

  // Posisi tangan: tutup mata (0) · mengintip (turun sedikit) · santai (turun penuh).
  const handsY = covering ? 0 : peeking ? 15 : 46;
  const pupilY = peeking ? 3 : 0;
  const happy = loading && !covering && !error;

  const t = 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div className="mascot-bob" style={{ width: size, height: size }}>
      <div ref={reactRef} style={{ width: '100%', height: '100%' }}>
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" aria-hidden="true"
          style={{ display: 'block', filter: 'drop-shadow(0 8px 18px rgba(26,86,219,0.28))' }}>
          <defs>
            <linearGradient id="mascotBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1340b8" />
            </linearGradient>
            <linearGradient id="mascotHand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Gagang kantong belanja */}
          <path d="M44 30 Q44 14 60 14 Q76 14 76 30" stroke="#1E50DC" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Badan/kepala */}
          <rect x="24" y="28" width="72" height="68" rx="22" fill="url(#mascotBody)" />
          <rect x="24" y="28" width="72" height="68" rx="22" fill="#ffffff" opacity="0.06" />

          {/* Pipi */}
          <ellipse cx="40" cy="68" rx="6" ry="4" fill="#f9a8d4" opacity="0.55" />
          <ellipse cx="80" cy="68" rx="6" ry="4" fill="#f9a8d4" opacity="0.55" />

          {/* Mata */}
          {covering ? (
            // Terpejam di balik tangan
            <>
              <path d="M40 56 q6 5 12 0" stroke="#0a1540" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M68 56 q6 5 12 0" stroke="#0a1540" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : happy ? (
            // Mata senang ^^
            <>
              <path d="M40 58 q6 -7 12 0" stroke="#0a1540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M68 58 q6 -7 12 0" stroke="#0a1540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            // Mata terbuka (berkedip berkala), pupil melirik turun saat mengintip
            <g className="mascot-eye">
              <circle cx="46" cy="56" r="7" fill="#ffffff" />
              <circle cx="74" cy="56" r="7" fill="#ffffff" />
              <circle cx="46" cy={56 + pupilY} r="3.4" fill="#0a1540" style={{ transition: t }} />
              <circle cx="74" cy={56 + pupilY} r="3.4" fill="#0a1540" style={{ transition: t }} />
            </g>
          )}

          {/* Mulut */}
          {covering ? (
            <ellipse cx="60" cy="76" rx="4" ry="5" fill="#0a1540" opacity="0.85" />
          ) : error ? (
            // Sedih (cemberut)
            <path d="M52 79 q8 -8 16 0" stroke="#0a1540" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : happy ? (
            // Senyum lebar
            <path d="M50 73 q10 12 20 0" stroke="#0a1540" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          ) : (
            // Senyum biasa
            <path d="M52 74 q8 8 16 0" stroke="#0a1540" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}

          {/* Tangan/mitten yang naik menutup mata */}
          <g style={{ transform: `translateY(${handsY}px)`, transition: t }}>
            <ellipse cx="44" cy="56" rx="12" ry="11" fill="url(#mascotHand)" />
            <ellipse cx="33" cy="60" rx="4.5" ry="6" fill="url(#mascotHand)" />
            <ellipse cx="76" cy="56" rx="12" ry="11" fill="url(#mascotHand)" />
            <ellipse cx="87" cy="60" rx="4.5" ry="6" fill="url(#mascotHand)" />
            {peeking && (
              <>
                <line x1="44" y1="48" x2="44" y2="64" stroke="#1340b8" strokeWidth="2" opacity="0.5" />
                <line x1="76" y1="48" x2="76" y2="64" stroke="#1340b8" strokeWidth="2" opacity="0.5" />
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
