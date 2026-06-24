import type { CSSProperties } from 'react';
import type { ConfettiPiece } from '@/utils/confetti';

// Ledakan konfeti saat target harian tercapai (gamifikasi Dashboard).
// Implementasi DOM ringan: tiap kepingan hanya menganimasikan transform +
// opacity (di-composite GPU) → tetap mulus di HP/iOS. Lihat .confetti-piece
// di animations.css.
//
// Komponen ini PURE: kepingan acak dibuat di pemanggil via makeConfettiPieces()
// (di dalam effect, tempat Math.random boleh dipakai) lalu dioper sebagai prop.
export default function Confetti({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <div className="fixed inset-0 z-[500] overflow-hidden pointer-events-none" aria-hidden="true">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.w * 1.5,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            '--dx': `${p.dx}px`,
            '--rot': `${p.rot}deg`,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
