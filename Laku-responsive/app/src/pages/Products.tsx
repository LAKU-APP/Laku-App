import { useState, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Minus, Edit2, Trash2, Package, Camera, ArrowUpDown, AlertTriangle } from 'lucide-react';
import ModalSheet from '@/components/ModalSheet';
import type { Product } from '@/types';
import { formatRupiah } from '@/lib/finance';
import { generateId } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type SortKey = 'newest' | 'name' | 'price' | 'stock';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Terbaru' },
  { key: 'name', label: 'Nama A-Z' },
  { key: 'price', label: 'Harga' },
  { key: 'stock', label: 'Stok' },
];

// Parse string menjadi bilangan bulat non-negatif. Mengembalikan null bila
// input bukan angka yang valid (mis. mengandung huruf) sehingga form bisa
// menolaknya alih-alih menyimpan NaN.
function parseNonNegativeInt(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return parseInt(trimmed, 10);
}

export default function Products() {
  const { state, dispatch, showToast } = useApp();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');

  // Stok dianggap rendah bila masih ada tapi di bawah ambang dari Pengaturan.
  const lowStock = (stock: number) => stock > 0 && stock <= state.storeSettings.lowStockThreshold;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = state.products.filter(p =>
      (query === '' || p.name.toLowerCase().includes(query)) &&
      (categoryFilter === 'all' || p.category === categoryFilter)
    );
    const sorted = [...result];
    switch (sortKey) {
      case 'name': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'price': sorted.sort((a, b) => b.price - a.price); break;
      case 'stock': sorted.sort((a, b) => a.stock - b.stock); break;
      case 'newest': sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    }
    return sorted;
  }, [state.products, searchQuery, categoryFilter, sortKey]);

  // Validasi form yang dipakai bersama oleh tambah & update produk.
  // Mengembalikan field produk yang sudah bersih, atau null bila tidak valid.
  const validateForm = (): Pick<Product, 'name' | 'price' | 'costPrice' | 'stock' | 'category'> | null => {
    const name = formName.trim();
    const price = parseNonNegativeInt(formPrice);
    const stock = parseNonNegativeInt(formStock);
    const cost = formCost.trim() === '' ? 0 : parseNonNegativeInt(formCost);
    if (!name) { showToast('Nama produk wajib diisi'); return null; }
    if (price === null || price <= 0) { showToast('Harga jual harus angka lebih dari 0'); return null; }
    if (stock === null) { showToast('Stok harus angka 0 atau lebih'); return null; }
    if (cost === null) { showToast('Harga modal harus angka yang valid'); return null; }
    return { name, price, costPrice: cost, stock, category: formCategory || undefined };
  };

  const handleAdd = () => {
    const fields = validateForm();
    if (!fields) return;
    const newProduct: Product = {
      id: generateId(),
      ...fields,
      emoji: '📦',
      image: formImage || undefined,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    showToast('Produk berhasil ditambahkan');
    resetForm();
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!editingProduct) return;
    const fields = validateForm();
    if (!fields) return;
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: { ...editingProduct, ...fields, image: formImage || editingProduct.image },
    });
    showToast('Produk berhasil diperbarui');
    resetForm();
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    showToast('Produk dihapus');
    setConfirmDelete(null);
    setEditingProduct(null);
  };

  const handleAdjust = () => {
    if (!adjustProduct || !adjustQty || parseInt(adjustQty) <= 0) {
      showToast('Masukkan jumlah yang valid');
      return;
    }
    dispatch({
      type: 'ADJUST_STOCK',
      payload: { productId: adjustProduct.id, qty: parseInt(adjustQty), type: adjustType },
    });
    showToast(`Stok ${adjustType === 'IN' ? 'ditambah' : 'dikurangi'} ${adjustQty} ${adjustProduct.name}`);
    setAdjustProduct(null);
    setAdjustQty('');
  };

  const resetForm = () => {
    setFormName(''); setFormPrice(''); setFormCost(''); setFormStock(''); setFormCategory(''); setFormImage('');
  };
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormCost(product.costPrice != null ? product.costPrice.toString() : '');
    setFormStock(product.stock.toString());
    setFormCategory(product.category || '');
    setFormImage(product.image || '');
  };
  const openAdjust = (product: Product) => {
    setAdjustProduct(product);
    setAdjustQty('');
    setAdjustType('IN');
  };

  // Desktop: table layout
  const desktopView = (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#EEF0F6]">
            <th className="text-left text-xs font-bold text-[#9BA3BC] px-6 py-4">Produk</th>
            <th className="text-left text-xs font-bold text-[#9BA3BC] px-4 py-4">Harga</th>
            <th className="text-left text-xs font-bold text-[#9BA3BC] px-4 py-4">Stok</th>
            <th className="text-left text-xs font-bold text-[#9BA3BC] px-4 py-4">Status</th>
            <th className="text-right text-xs font-bold text-[#9BA3BC] px-6 py-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, i) => (
            <tr
              key={product.id}
              className="border-b border-[#EEF0F6] last:border-0 hover:bg-[#F8F9FD] transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <ProductImage image={product.image} name={product.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1A1F3A] truncate">{product.name}</div>
                    {product.category && (
                      <div className="text-[11px] font-semibold text-[#9BA3BC]">{product.category}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="text-sm font-semibold text-[#3D4566]">Rp {product.price.toLocaleString('id-ID')}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className={`text-sm font-bold ${product.stock === 0 || lowStock(product.stock) ? 'text-[#ef4444]' : 'text-[#1A1F3A]'}`}>
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md
                  ${product.stock === 0 ? 'bg-[#fee2e2] text-[#ef4444]' :
                    lowStock(product.stock) ? 'bg-[#fef3c7] text-[#d97706]' :
                    'bg-[#dcfce7] text-[#22c55e]'}`}>
                  {product.stock === 0 ? 'Habis' : lowStock(product.stock) ? 'Hampir Habis' : 'Tersedia'}
                </span>
              </td>
              <td className="px-6 py-3.5">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => openAdjust(product)}
                    className="h-8 px-3 rounded-lg bg-[#e8effe] text-[#1A56DB] text-xs font-bold flex items-center gap-1 hover:bg-[#d4e4fb] transition-colors"
                  >
                    <Plus size={12} /> Atur Stok
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="h-8 px-3 rounded-lg bg-[#F8F9FC] text-[#9BA3BC] text-xs font-bold flex items-center gap-1 hover:bg-[#EEF0F6] transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={40} className="text-[#DDE1EF] mb-3" />
          <p className="text-sm font-semibold text-[#9BA3BC]">Tidak ada produk</p>
          <p className="text-xs text-[#DDE1EF] mt-1">Tambahkan produk baru</p>
        </div>
      )}
    </div>
  );

  // Mobile: card grid layout
  const mobileView = (
    <>
      <div className="grid grid-cols-2 gap-3 auto-rows-fr">
        {filteredProducts.map((product, i) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl p-3.5 flex flex-col items-center gap-2 h-full card-shadow
                       hover:card-shadow-hover active:scale-[0.97] transition-all
                       animate-fade-up relative overflow-hidden
                       ${product.stock === 0 ? 'opacity-60' : ''}`}
            style={{ animationDelay: `${i * 0.03}s` }}
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
            <div className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${lowStock(product.stock) ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#dcfce7] text-[#22c55e]'}`}>
              Stok: {product.stock}
            </div>
            <div className="flex gap-1.5 mt-auto pt-1 w-full">
              <button
                onClick={() => openAdjust(product)}
                className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#e8effe] to-[#d4e4fb] flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus size={15} className="text-[#1A56DB]" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => openEdit(product)}
                className="flex-1 h-8 rounded-lg bg-[#F8F9FC] flex items-center justify-center active:scale-95 transition-transform"
              >
                <Edit2 size={13} className="text-[#9BA3BC]" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={48} className="text-[#DDE1EF] mb-3" />
          <p className="text-sm font-bold text-[#9BA3BC]">Tidak ada produk</p>
          <p className="text-xs text-[#DDE1EF] mt-1">Tambahkan produk baru</p>
        </div>
      )}
    </>
  );

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
      {/* Header + Search + Sort */}
      <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
        {!isMobile && (
          <div className="text-sm text-[#9BA3BC] font-medium shrink-0">
            {filteredProducts.length} produk terdaftar
          </div>
        )}
        <div className={`flex gap-2.5 ${isMobile ? 'w-full' : 'items-center'}`}>
          <div className={`relative ${isMobile ? 'flex-1' : 'w-[260px]'}`}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA3BC]" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-4 bg-white rounded-xl text-sm font-medium text-[#1A1F3A]
                         placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30
                         card-shadow transition-shadow"
            />
          </div>
          <div className="relative shrink-0">
            <ArrowUpDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA3BC] pointer-events-none" />
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              aria-label="Urutkan produk"
              className="h-11 pl-9 pr-8 bg-white rounded-xl text-sm font-semibold text-[#1A1F3A]
                         outline-none focus:ring-2 focus:ring-[#1A56DB]/30 card-shadow appearance-none cursor-pointer"
            >
              {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
          {!isMobile && (
            <button
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="h-11 px-5 bg-[#1A56DB] text-white rounded-xl font-bold text-sm flex items-center gap-2 shrink-0
                         hover:bg-[#1340b8] active:scale-[0.97] transition-all"
              style={{ boxShadow: '0 4px 20px rgba(26,79,214,0.35)' }}
            >
              <Plus size={18} strokeWidth={3} /> Tambah Produk
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      {state.categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[{ key: 'all', label: 'Semua' }, ...state.categories.map(c => ({ key: c, label: c }))].map(c => (
            <button
              key={c.key}
              onClick={() => setCategoryFilter(c.key)}
              className={`h-8 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shrink-0
                ${categoryFilter === c.key ? 'bg-[#1A56DB] text-white' : 'bg-white text-[#9BA3BC] card-shadow hover:text-[#1A1F3A]'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {isMobile ? mobileView : desktopView}

      {/* FAB - mobile only */}
      {isMobile && (
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#1A56DB] rounded-full flex items-center justify-center
                     shadow-lg active:scale-90 transition-transform z-40"
          style={{ boxShadow: '0 4px 20px rgba(26,79,214,0.45)' }}
        >
          <Plus size={24} className="text-white" strokeWidth={3} />
        </button>
      )}

      {/* Modals */}
      <ModalSheet open={showAddForm} onClose={() => setShowAddForm(false)} title="Tambah Produk">
        <ProductFormContent
          name={formName} setName={setFormName}
          price={formPrice} setPrice={setFormPrice}
          cost={formCost} setCost={setFormCost}
          stock={formStock} setStock={setFormStock}
          category={formCategory} setCategory={setFormCategory}
          categories={state.categories}
          image={formImage} setImage={setFormImage}
          onImageError={showToast}
          onSubmit={handleAdd} submitLabel="Simpan"
        />
      </ModalSheet>
      <ModalSheet open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Produk">
        <ProductFormContent
          name={formName} setName={setFormName}
          price={formPrice} setPrice={setFormPrice}
          cost={formCost} setCost={setFormCost}
          stock={formStock} setStock={setFormStock}
          category={formCategory} setCategory={setFormCategory}
          categories={state.categories}
          image={formImage} setImage={setFormImage}
          onImageError={showToast}
          onSubmit={handleUpdate} submitLabel="Update"
        />
        <button
          onClick={() => {
            if (!editingProduct) return;
            // Tutup form edit dulu agar tidak ada dua modal bertumpuk di desktop.
            setConfirmDelete(editingProduct);
            setEditingProduct(null);
          }}
          className="w-full h-12 mt-3 rounded-xl bg-[#fee2e2] text-[#ef4444] font-bold text-sm
                     flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Trash2 size={16} /> Hapus Produk
        </button>
      </ModalSheet>

      {/* Konfirmasi hapus — mencegah produk terhapus karena salah klik */}
      <ModalSheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Hapus Produk?">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] flex items-center justify-center">
            <AlertTriangle size={24} className="text-[#ef4444]" strokeWidth={2} />
          </div>
          <p className="text-sm font-semibold text-[#3D4566]">
            Produk <span className="font-extrabold text-[#1A1F3A]">{confirmDelete?.name}</span> akan dihapus permanen.
            Riwayat transaksi yang sudah ada tidak terpengaruh.
          </p>
          <div className="flex gap-2.5 w-full mt-1">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 h-12 rounded-xl bg-[#F8F9FC] text-[#3D4566] font-bold text-sm active:scale-[0.98] transition-transform"
            >
              Batal
            </button>
            <button
              onClick={() => confirmDelete && handleDelete(confirmDelete.id)}
              className="flex-1 h-12 rounded-xl bg-[#ef4444] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </div>
      </ModalSheet>
      <ModalSheet open={!!adjustProduct} onClose={() => setAdjustProduct(null)} title={`Atur Stok: ${adjustProduct?.name}`}>
        <div className="mb-4">
          <div className="text-sm text-[#9BA3BC] font-medium mb-1">Stok saat ini</div>
          <div className="text-2xl font-extrabold text-[#1A1F3A]">{adjustProduct?.stock} unit</div>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAdjustType('IN')}
            className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all
              ${adjustType === 'IN' ? 'bg-[#1A56DB] text-white' : 'bg-[#F8F9FC] text-[#9BA3BC]'}`}
          >
            <Plus size={16} className="inline mr-1" /> Tambah
          </button>
          <button
            onClick={() => setAdjustType('OUT')}
            className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all
              ${adjustType === 'OUT' ? 'bg-[#ef4444] text-white' : 'bg-[#F8F9FC] text-[#9BA3BC]'}`}
          >
            <Minus size={16} className="inline mr-1" /> Kurangi
          </button>
        </div>
        <input
          type="number"
          placeholder="Jumlah..."
          value={adjustQty}
          onChange={e => setAdjustQty(e.target.value)}
          className="w-full h-12 px-4 bg-[#F8F9FC] rounded-xl text-sm font-bold text-[#1A1F3A]
                     placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30 mb-3"
        />
        <button
          onClick={handleAdjust}
          className="w-full h-12 bg-[#1A56DB] rounded-xl text-white font-bold text-sm
                     active:scale-[0.98] transition-transform"
        >
          {adjustType === 'IN' ? 'Tambah Stok' : 'Kurangi Stok'}
        </button>
      </ModalSheet>
    </div>
  );
}

function ProductFormContent({ name, setName, price, setPrice, cost, setCost, stock, setStock, category, setCategory, categories, image, setImage, onImageError, onSubmit, submitLabel }:
  { name: string; setName: (v: string) => void; price: string; setPrice: (v: string) => void;
    cost: string; setCost: (v: string) => void; stock: string; setStock: (v: string) => void;
    category: string; setCategory: (v: string) => void; categories: string[];
    image: string; setImage: (v: string) => void; onImageError: (message: string) => void;
    onSubmit: () => void; submitLabel: string }) {
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

// ProductImage: tampilkan image jika ada, fallback ke icon Package
function ProductImage({ image, name, size = 'md' }: { image?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
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
