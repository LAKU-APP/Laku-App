import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { formatRupiah } from '@/utils/currency';
import { parseNonNegativeInt } from '@/utils/helpers';

interface ProductFormProps {
  name: string; setName: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  cost: string; setCost: (v: string) => void;
  stock: string; setStock: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  categories: string[];
  image: string; setImage: (v: string) => void;
  onImageError: (message: string) => void;
  onSubmit: () => void; submitLabel: string;
}

export default function ProductForm({
  name, setName, price, setPrice, cost, setCost, stock, setStock,
  category, setCategory, categories, image, setImage, onImageError, onSubmit, submitLabel,
}: ProductFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Estimasi margin per unit untuk umpan balik langsung saat mengisi harga.
  const priceNum = parseNonNegativeInt(price);
  const costNum = cost.trim() === '' ? 0 : parseNonNegativeInt(cost);
  const margin = priceNum != null && costNum != null ? priceNum - costNum : null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { onImageError('Ukuran gambar maksimal 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const numberFieldClass = 'w-full h-12 px-4 bg-[#F8F9FC] rounded-xl text-sm font-bold text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30';

  return (
    <div className="flex flex-col gap-3">
      {/* Image upload */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-2xl bg-[#F4F6FD] border-2 border-dashed border-[#DDE1EF] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform overflow-hidden"
        >
          {image ? (
            <img src={image} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={22} className="text-[#9BA3BC]" strokeWidth={1.5} />
              <span className="text-[10px] font-bold text-[#9BA3BC]">Upload</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {image && (
          <button type="button" onClick={() => setImage('')} className="text-[10px] font-bold text-[#ef4444]">
            Hapus Foto
          </button>
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Nama Produk</label>
        <input type="text" placeholder="Contoh: Kopi Susu" value={name} onChange={e => setName(e.target.value)}
          className={numberFieldClass} />
      </div>
      <div>
        <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Kategori</label>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className={`${numberFieldClass} appearance-none cursor-pointer`}>
          <option value="">Tanpa kategori</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Harga Jual (Rp)</label>
          <input type="number" inputMode="numeric" placeholder="Contoh: 5000" value={price} onChange={e => setPrice(e.target.value)}
            className={numberFieldClass} />
        </div>
        <div>
          <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Harga Modal (Rp)</label>
          <input type="number" inputMode="numeric" placeholder="Opsional" value={cost} onChange={e => setCost(e.target.value)}
            className={numberFieldClass} />
        </div>
      </div>
      {margin !== null && priceNum && priceNum > 0 && (
        <div className={`text-[11px] font-bold ${margin >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          Estimasi laba per unit: {formatRupiah(margin)}
        </div>
      )}
      <div>
        <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Stok Awal</label>
        <input type="number" inputMode="numeric" placeholder="Contoh: 10" value={stock} onChange={e => setStock(e.target.value)}
          className={numberFieldClass} />
      </div>
      <button onClick={onSubmit}
        className="w-full h-12 bg-[#1A56DB] rounded-xl text-white font-bold text-sm active:scale-[0.98] transition-transform mt-1">
        {submitLabel}
      </button>
    </div>
  );
}
