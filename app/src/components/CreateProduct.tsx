import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Loader } from 'lucide-react';
import ModalSheet from './ModalSheet';

interface CreateProductProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProduct({ isOpen, onClose }: CreateProductProps) {
  const { createProduct, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    emoji: '📦',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) { setError('Nama produk harus diisi'); return; }
    if (!formData.price || parseInt(formData.price) <= 0) { setError('Harga harus lebih dari 0'); return; }
    if (!formData.stock || parseInt(formData.stock) < 0) { setError('Stok tidak boleh negatif'); return; }

    setLoading(true);
    try {
      await createProduct({
        name: formData.name.trim(),
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        emoji: formData.emoji,
      });
      
      showToast('Produk berhasil ditambahkan!');
      setFormData({ name: '', price: '', stock: '', emoji: '📦' });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalSheet open={isOpen} onClose={onClose} title="Tambah Produk Baru">
      <div className="p-6 sm:p-8">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji & Nama */}
          <div className="grid grid-cols-5 gap-2">
            <input
              type="text"
              name="emoji"
              value={formData.emoji}
              onChange={handleChange}
              maxLength={2}
              className="col-span-1 h-12 px-3 rounded-xl border-2 border-[#EEF0F6] text-center text-2xl font-bold outline-none focus:border-[#1A56DB]"
            />
            <input
              type="text"
              name="name"
              placeholder="Nama produk"
              value={formData.name}
              onChange={handleChange}
              className="col-span-4 h-12 px-4 rounded-xl border-2 border-[#EEF0F6] text-sm font-medium placeholder-[#DDE1EF] outline-none focus:border-[#1A56DB] focus:bg-[#e8effe]"
            />
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#3D4566] mb-1 block">Harga (Rp)</label>
              <input
                type="number"
                name="price"
                placeholder="Contoh: 15000"
                value={formData.price}
                onChange={handleChange}
                min="0"
                className="w-full h-11 px-4 rounded-xl border-2 border-[#EEF0F6] text-sm font-medium placeholder-[#DDE1EF] outline-none focus:border-[#1A56DB] focus:bg-[#e8effe]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#3D4566] mb-1 block">Stok</label>
              <input
                type="number"
                name="stock"
                placeholder="Contoh: 50"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full h-11 px-4 rounded-xl border-2 border-[#EEF0F6] text-sm font-medium placeholder-[#DDE1EF] outline-none focus:border-[#1A56DB] focus:bg-[#e8effe]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-sm text-[#1A56DB] bg-[#e8effe] hover:bg-[#d4e4fb] transition-colors disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#1A56DB] to-[#1340b8] hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Tambahkan Produk'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalSheet>
  );
}
