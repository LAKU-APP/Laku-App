// Skeleton shimmer untuk loading state (Produk & Catatan). Memberi kesan
// "aplikasi sedang berpikir cepat". Lihat .skeleton di animations.css —
// hanya menganimasikan background-position (ringan, aman di iOS).
import type { CSSProperties } from 'react';

export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// Kartu produk (mobile grid) versi skeleton.
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col gap-2.5 card-shadow" aria-hidden="true">
      <Skeleton className="w-full" style={{ height: 72, borderRadius: 12 }} />
      <Skeleton style={{ height: 12, width: '80%' }} />
      <Skeleton style={{ height: 12, width: '50%' }} />
      <div className="flex gap-2 mt-1">
        <Skeleton style={{ height: 28, flex: 1 }} />
        <Skeleton style={{ height: 28, width: 36 }} />
      </div>
    </div>
  );
}

// Baris tabel produk (desktop) versi skeleton.
export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[#EEF0F6]" aria-hidden="true">
      <Skeleton style={{ width: 40, height: 40, borderRadius: 12 }} />
      <Skeleton style={{ height: 12, width: 160 }} />
      <Skeleton style={{ height: 12, width: 90, marginLeft: 'auto' }} />
      <Skeleton style={{ height: 12, width: 50 }} />
      <Skeleton style={{ height: 26, width: 70, borderRadius: 8 }} />
    </div>
  );
}

// Kartu transaksi (Catatan) versi skeleton.
export function TransactionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-3.5 flex gap-3 items-start card-shadow" aria-hidden="true">
      <Skeleton style={{ width: 44, height: 44, borderRadius: 12 }} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton style={{ height: 11, width: '70%' }} />
        <Skeleton style={{ height: 10, width: '40%' }} />
        <Skeleton style={{ height: 12, width: '55%' }} />
      </div>
    </div>
  );
}
