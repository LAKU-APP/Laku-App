import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Minus, Edit2, Trash2, Package } from 'lucide-react';
import ModalSheet from '@/components/ModalSheet';
import type { Product } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Products() {
  const { state, dispatch, showToast } = useApp();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return state.products;
    return state.products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [state.products, searchQuery]);

  const handleAdd = () => {
    if (!formName.trim() || !formPrice || !formStock) {
      showToast('Semua field harus diisi');
      return;
    }
    const newProduct: Product = {
      id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      name: formName.trim(),
      price: parseInt(formPrice),
      stock: parseInt(formStock),
      emoji: getEmojiForProduct(formName),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    showToast('Produk berhasil ditambahkan');
    resetForm();
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!editingProduct || !formName.trim() || !formPrice || !formStock) return;
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: { ...editingProduct, name: formName.trim(), price: parseInt(formPrice), stock: parseInt(formStock) },
    });
    showToast('Produk berhasil diperbarui');
    resetForm();
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    showToast('Produk dihapus');
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

  const resetForm = () => { setFormName(''); setFormPrice(''); setFormStock(''); };
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
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
                  <span className="text-2xl">{product.emoji}</span>
                  <span className="text-sm font-bold text-[#1A1F3A]">{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="text-sm font-semibold text-[#3D4566]">Rp {product.price.toLocaleString('id-ID')}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className={`text-sm font-bold ${product.stock <= 5 ? 'text-[#ef4444]' : 'text-[#1A1F3A]'}`}>
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md
                  ${product.stock === 0 ? 'bg-[#fee2e2] text-[#ef4444]' :
                    product.stock <= 5 ? 'bg-[#fef3c7] text-[#d97706]' :
                    'bg-[#dcfce7] text-[#22c55e]'}`}>
                  {product.stock === 0 ? 'Habis' : product.stock <= 5 ? 'Hampir Habis' : 'Tersedia'}
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
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product, i) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl p-3.5 flex flex-col items-center gap-2 card-shadow
                       hover:card-shadow-hover active:scale-[0.97] transition-all
                       animate-fade-up relative overflow-hidden
                       ${product.stock === 0 ? 'opacity-60 bg-[#F8F9FC]' : ''}`}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
                <span className="text-xs font-extrabold text-[#ef4444] bg-white px-3 py-1.5 rounded-lg border-2 border-[#ef4444]/30 shadow-sm">
                  Habis
                </span>
              </div>
            )}
            <div className="text-3xl mb-1">{product.emoji}</div>
            <div className="text-xs font-bold text-[#1A1F3A] text-center leading-tight line-clamp-1 w-full px-1">{product.name}</div>
            <div className="text-[11px] font-semibold text-[#9BA3BC]">Rp {product.price.toLocaleString('id-ID')}</div>
            <div className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#dcfce7] text-[#22c55e]'}`}>
              Stok: {product.stock}
            </div>
            <div className="flex gap-1.5 mt-1 w-full">
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
      {/* Header + Search */}
      <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
        {!isMobile && (
          <div className="text-sm text-[#9BA3BC] font-medium">
            {filteredProducts.length} produk terdaftar
          </div>
        )}
        <div className={`relative ${isMobile ? 'w-full' : 'w-[280px]'}`}>
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
        {!isMobile && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="h-11 px-5 bg-[#1A56DB] text-white rounded-xl font-bold text-sm flex items-center gap-2
                       hover:bg-[#1340b8] active:scale-[0.97] transition-all"
            style={{ boxShadow: '0 4px 20px rgba(26,79,214,0.35)' }}
          >
            <Plus size={18} strokeWidth={3} /> Tambah Produk
          </button>
        )}
      </div>

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
          stock={formStock} setStock={setFormStock}
          onSubmit={handleAdd} submitLabel="Simpan"
        />
      </ModalSheet>
      <ModalSheet open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Produk">
        <ProductFormContent
          name={formName} setName={setFormName}
          price={formPrice} setPrice={setFormPrice}
          stock={formStock} setStock={setFormStock}
          onSubmit={handleUpdate} submitLabel="Update"
        />
        <button
          onClick={() => editingProduct && handleDelete(editingProduct.id)}
          className="w-full h-12 mt-3 rounded-xl bg-[#fee2e2] text-[#ef4444] font-bold text-sm
                     flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Trash2 size={16} /> Hapus Produk
        </button>
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

function ProductFormContent({ name, setName, price, setPrice, stock, setStock, onSubmit, submitLabel }:
  { name: string; setName: (v: string) => void; price: string; setPrice: (v: string) => void;
    stock: string; setStock: (v: string) => void; onSubmit: () => void; submitLabel: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Nama Produk</label>
        <input type="text" placeholder="Contoh: Kopi Susu" value={name} onChange={e => setName(e.target.value)}
          className="w-full h-12 px-4 bg-[#F8F9FC] rounded-xl text-sm font-bold text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30" />
      </div>
      <div>
        <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Harga (Rp)</label>
        <input type="number" placeholder="Contoh: 5000" value={price} onChange={e => setPrice(e.target.value)}
          className="w-full h-12 px-4 bg-[#F8F9FC] rounded-xl text-sm font-bold text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30" />
      </div>
      <div>
        <label className="text-xs font-bold text-[#9BA3BC] mb-1 block">Stok Awal</label>
        <input type="number" placeholder="Contoh: 10" value={stock} onChange={e => setStock(e.target.value)}
          className="w-full h-12 px-4 bg-[#F8F9FC] rounded-xl text-sm font-bold text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30" />
      </div>
      <button onClick={onSubmit}
        className="w-full h-12 bg-[#1A56DB] rounded-xl text-white font-bold text-sm active:scale-[0.98] transition-transform mt-1">
        {submitLabel}
      </button>
    </div>
  );
}

function getEmojiForProduct(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('nasi')) return '🍛';
  if (n.includes('teh') || n.includes('es')) return '🥤';
  if (n.includes('beras')) return '🍚';
  if (n.includes('cabai') || n.includes('cabe')) return '🌶️';
  if (n.includes('telur')) return '🥚';
  if (n.includes('minyak')) return '🧴';
  if (n.includes('mie')) return '🍜';
  if (n.includes('kopi') || n.includes('coffee')) return '☕';
  if (n.includes('roti') || n.includes('bread')) return '🍞';
  if (n.includes('gula')) return '🍬';
  if (n.includes('garam')) return '🧂';
  if (n.includes('susu')) return '🥛';
  if (n.includes('buah')) return '🍎';
  if (n.includes('sayur')) return '🥬';
  if (n.includes('daging') || n.includes('ayam')) return '🍗';
  if (n.includes('ikan')) return '🐟';
  return '📦';
}
