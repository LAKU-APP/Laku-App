import { Plus, Minus } from 'lucide-react';
import type { CartItem } from '@/types';

interface CartProps {
  items: CartItem[];
  isMobile: boolean;
  onIncrement: (item: CartItem) => void;
  onDecrement: (productId: string) => void;
}

// Daftar item keranjang + kontrol kuantitas. Logika stok/dispatch ada di POSPage.
export default function Cart({ items, isMobile, onIncrement, onDecrement }: CartProps) {
  return (
    <div
      className="overflow-y-auto scrollbar-hide flex flex-col gap-1.5 mb-2.5"
      style={{ maxHeight: isMobile ? 'clamp(80px, 22vw, 120px)' : undefined, flex: isMobile ? undefined : 1 }}
    >
      {items.length === 0 && (
        <div className="text-center py-4 text-[#DDE1EF] text-xs font-medium">Belum ada item dipilih</div>
      )}
      {items.map(item => (
        <div key={item.productId} className="flex items-center justify-between bg-[#F8F9FC] rounded-lg px-2.5 py-1.5">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#1A1F3A] truncate" style={{ fontSize: 'clamp(10px, 2.8vw, 12px)' }}>{item.productName}</div>
            <div className="text-[#9BA3BC]" style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Rp {item.price.toLocaleString('id-ID')}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onDecrement(item.productId)}
              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm">
              <Minus size={13} className="text-[#ef4444]" />
            </button>
            <span className="text-sm font-extrabold text-[#1A1F3A] w-5 text-center">{item.qty}</span>
            <button
              onClick={() => onIncrement(item)}
              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm">
              <Plus size={13} className="text-[#22c55e]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
