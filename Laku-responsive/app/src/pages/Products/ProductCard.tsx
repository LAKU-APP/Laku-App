import { Plus, Edit2, Package } from 'lucide-react';
import type { Product } from '@/types';
import { formatRupiah } from '@/utils/currency';

// Tampilkan gambar produk bila ada, jika tidak fallback ke ikon Package.
// Dipakai di kartu (mobile) maupun tabel (desktop), maka diexport terpisah.
export function ProductImage({ image, name, size = 'md' }: { image?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-3xl' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'lg' ? 28 : size === 'sm' ? 14 : 20;
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} rounded-xl object-cover shrink-0 bg-[#F8F9FC]`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-xl bg-[#F4F6FD] flex items-center justify-center shrink-0`}>
      <Package size={iconSize} className="text-[#9BA3BC]" strokeWidth={1.5} />
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isLowStock: boolean;
  onAdjust: () => void;
  onEdit: () => void;
  index: number;
}

// Kartu produk untuk tampilan grid (mobile).
export default function ProductCard({ product, isLowStock, onAdjust, onEdit, index }: ProductCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-3.5 flex flex-col items-center gap-2 h-full card-shadow
                 hover:card-shadow-hover active:scale-[0.97] transition-all
                 animate-fade-up relative overflow-hidden
                 ${product.stock === 0 ? 'opacity-60' : ''}`}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {product.stock === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
          <span className="text-xs font-extrabold text-[#ef4444] bg-white px-3 py-1.5 rounded-lg border-2 border-[#ef4444]/30 shadow-sm">
            Habis
          </span>
        </div>
      )}
      <ProductImage image={product.image} name={product.name} size="lg" />
      <div className="text-xs font-bold text-[#1A1F3A] text-center leading-tight line-clamp-2 w-full px-1 min-h-[2.4em] flex items-center justify-center">{product.name}</div>
      {product.category && (
        <div className="text-[9px] font-bold text-[#9BA3BC] bg-[#F4F6FD] px-2 py-0.5 rounded-full truncate max-w-full">{product.category}</div>
      )}
      <div className="text-[11px] font-semibold text-[#9BA3BC]">{formatRupiah(product.price)}</div>
      <div className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${isLowStock ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#dcfce7] text-[#22c55e]'}`}>
        Stok: {product.stock}
      </div>
      <div className="flex gap-1.5 mt-auto pt-1 w-full">
        <button
          onClick={onAdjust}
          className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#e8effe] to-[#d4e4fb] flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={15} className="text-[#1A56DB]" strokeWidth={2.5} />
        </button>
        <button
          onClick={onEdit}
          className="flex-1 h-8 rounded-lg bg-[#F8F9FC] flex items-center justify-center active:scale-95 transition-transform"
        >
          <Edit2 size={13} className="text-[#9BA3BC]" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
