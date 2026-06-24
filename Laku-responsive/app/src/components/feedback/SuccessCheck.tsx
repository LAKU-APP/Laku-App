// Centang sukses yang "digambar" (SVG draw via stroke-dashoffset) di dalam
// lingkaran yang ikut tergambar. Dipakai di layar sukses POS & Onboarding.
// Animasi murni transform/stroke → mulus & ringan di iOS Safari.
import type { CSSProperties } from 'react';

interface SuccessCheckProps {
  size?: number;
  color?: string;
  ringColor?: string;
  className?: string;
}

export default function SuccessCheck({
  size = 96,
  color = '#22c55e',
  ringColor = '#bbf7d0',
  className = '',
}: SuccessCheckProps) {
  // Panjang path dipakai untuk stroke-dasharray/offset (lihat .svg-draw-path).
  const RING_LEN = 327; // keliling lingkaran r=52 (2·π·52)
  const CHECK_LEN = 72;  // sedikit lebih panjang dari path agar mulai tersembunyi penuh
  return (
    <div className={`animate-pop-in ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} fill="none" aria-hidden="true">
        <circle cx="60" cy="60" r="52" stroke={ringColor} strokeWidth="6" opacity="0.45" />
        <circle
          cx="60" cy="60" r="52"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          transform="rotate(-90 60 60)"
          className="svg-draw-path"
          style={{ '--len': RING_LEN, animationDuration: '0.7s' } as CSSProperties}
        />
        <path
          d="M38 62 L54 78 L84 44"
          stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
          className="svg-draw-path"
          style={{ '--len': CHECK_LEN, animationDelay: '0.45s' } as CSSProperties}
        />
      </svg>
    </div>
  );
}
