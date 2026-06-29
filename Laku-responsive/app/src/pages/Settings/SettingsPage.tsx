import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Store, MapPin, Phone, Mail, MessageSquare, Wallet, Target, AlertTriangle,
  Tag, Plus, X, LogOut, Info, ChevronDown, Bell, PackageX,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useMobile';
import { formatRupiah } from '@/utils/currency';
import { apiUpdateContact } from '@/services/auth/authService';
import { canChangeTargetToday, bumpTargetChangesToday, MAX_TARGET_CHANGES_PER_DAY } from '@/utils/dailyLimits';

type SectionId = 'profil' | 'operasional' | 'notifikasi' | 'kategori' | 'data' | 'akun';

// Bersihkan input angka menjadi bilangan bulat non-negatif (atau 0).
function toAmount(value: string): number {
  const n = parseInt(value.replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}


export default function Settings() {
  const { state, showToast, logout, updateUser, updateStoreSettings, setDailyTarget, addCategory, removeCategory } = useApp();
  const isMobile = useIsMobile();

  // Akordeon: hanya satu seksi terbuka agar tidak perlu scroll panjang.
  const [openSection, setOpenSection] = useState<SectionId>('profil');
  const toggle = (id: SectionId) => setOpenSection(prev => (prev === id ? ('' as SectionId) : id));

  // Profil toko & operasional disimpan bersama lewat satu tombol "Simpan".
  const [storeName, setStoreName] = useState(state.storeSettings.storeName);
  const [storeAddress, setStoreAddress] = useState(state.storeSettings.storeAddress);
  const [storePhone, setStorePhone] = useState(state.storeSettings.storePhone);
  const [receiptNote, setReceiptNote] = useState(state.storeSettings.receiptNote);
  const [initialCash, setInitialCash] = useState(String(state.storeSettings.initialCash));
  const [dailyTarget, setDailyTargetInput] = useState(String(state.dailyTarget));
  const [lowStock, setLowStock] = useState(String(state.storeSettings.lowStockThreshold));

  const [newCategory, setNewCategory] = useState('');

  // Kontak akun (email & nomor HP) — bisa diubah/ditambah di sini.
  const [accEmail, setAccEmail] = useState(state.user?.email || '');
  const [savingContact, setSavingContact] = useState(false);

  const handleSave = () => {
    updateStoreSettings({
      storeName: storeName.trim(),
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.trim(),
      receiptNote: receiptNote.trim(),
      initialCash: toAmount(initialCash),
      lowStockThreshold: Math.max(1, toAmount(lowStock)),
    });
    // Target laba dibatasi maks 2x ganti/hari (biar konfetinya tetap sakral).
    const newTarget = toAmount(dailyTarget);
    if (newTarget !== state.dailyTarget) {
      if (!canChangeTargetToday()) {
        setDailyTargetInput(String(state.dailyTarget)); // kembalikan ke nilai semula
        showToast(`Pengaturan tersimpan. Target tidak diganti — maks ${MAX_TARGET_CHANGES_PER_DAY}x/hari.`);
        return;
      }
      bumpTargetChangesToday();
      setDailyTarget(newTarget);
    }
    showToast('Pengaturan tersimpan');
  };

  // Simpan/ubah email akun (memperbarui akun login lewat backend).
  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      const res = await apiUpdateContact(accEmail);
      updateUser({ email: res.email });
      showToast('Email diperbarui');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gagal memperbarui email');
    } finally {
      setSavingContact(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    if (state.categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      showToast('Kategori sudah ada');
      return;
    }
    const ok = await addCategory(name);
    if (ok) setNewCategory('');
  };

  const fieldClass = 'w-full h-12 px-4 bg-[#F8F9FC] rounded-xl text-sm font-bold text-[#1A1F3A] placeholder:text-[#9BA3BC] outline-none focus:ring-2 focus:ring-[#1A56DB]/30';

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-3 ${isMobile ? 'px-4 pt-4 pb-24' : 'px-6 py-6'}`}>
      <div className={`w-full flex flex-col gap-3 ${isMobile ? '' : 'max-w-2xl mx-auto'}`}>

        {/* Profil Toko */}
        <Section
          icon={Store} title="Profil Toko" subtitle="Identitas pada struk penjualan"
          open={openSection === 'profil'} onToggle={() => toggle('profil')}
        >
          <Field label="Nama Toko" icon={Store}>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
              placeholder="Contoh: Warung Bu Sri" className={fieldClass} />
          </Field>
          <Field label="Alamat Toko" icon={MapPin}>
            <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)}
              placeholder="Contoh: Jl. Merdeka No. 10" className={fieldClass} />
          </Field>
          <Field label="Nomor HP" icon={Phone}>
            <input type="tel" inputMode="tel" value={storePhone} onChange={e => setStorePhone(e.target.value)}
              placeholder="Contoh: 0812-3456-7890" className={fieldClass} />
          </Field>
          <Field label="Catatan Struk" icon={MessageSquare} hint="Ucapan singkat di bagian bawah struk">
            <textarea value={receiptNote} onChange={e => setReceiptNote(e.target.value)}
              placeholder="Terima kasih telah berbelanja" rows={2}
              className={`${fieldClass} h-auto py-3 resize-none`} />
          </Field>
        </Section>

        {/* Operasional */}
        <Section
          icon={Wallet} title="Operasional" subtitle="Kas, target laba & ambang stok"
          open={openSection === 'operasional'} onToggle={() => toggle('operasional')}
        >
          <Field label="Saldo Awal Kas" icon={Wallet} hint={formatRupiah(toAmount(initialCash))}>
            <input type="text" inputMode="numeric" value={initialCash}
              onChange={e => setInitialCash(e.target.value.replace(/\D/g, ''))}
              placeholder="1000000" className={fieldClass} />
          </Field>
          <Field label="Target Laba Harian" icon={Target} hint={formatRupiah(toAmount(dailyTarget))}>
            <input type="text" inputMode="numeric" value={dailyTarget}
              onChange={e => setDailyTargetInput(e.target.value.replace(/\D/g, ''))}
              placeholder="300000" className={fieldClass} />
          </Field>
          <Field label="Batas Stok Rendah" icon={AlertTriangle} hint="Produk dengan stok di bawah angka ini ditandai 'rendah'">
            <input type="text" inputMode="numeric" value={lowStock}
              onChange={e => setLowStock(e.target.value.replace(/\D/g, ''))}
              placeholder="5" className={fieldClass} />
          </Field>
        </Section>

        {/* Preferensi Notifikasi */}
        <Section
          icon={Bell} title="Notifikasi" subtitle="Atur peringatan otomatis"
          open={openSection === 'notifikasi'} onToggle={() => toggle('notifikasi')}
        >
          <ToggleRow
            icon={PackageX} label="Peringatan Stok" desc="Beri tahu saat stok menipis atau habis"
            checked={state.storeSettings.notifLowStock}
            onChange={v => updateStoreSettings({ notifLowStock: v })}
          />
          <ToggleRow
            icon={Target} label="Target Tercapai" desc="Beri tahu saat target laba harian tercapai"
            checked={state.storeSettings.notifTarget}
            onChange={v => updateStoreSettings({ notifTarget: v })}
          />
        </Section>

        {/* Kategori Produk */}
        <Section
          icon={Tag} title="Kategori Produk" subtitle={`${state.categories.length} kategori`}
          open={openSection === 'kategori'} onToggle={() => toggle('kategori')}
        >
          <div className="flex flex-wrap gap-2">
            {state.categories.map(category => (
              <span key={category} className="inline-flex items-center gap-1.5 h-9 pl-3.5 pr-2 rounded-full bg-[#F4F6FD] text-xs font-bold text-[#3D4566]">
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  aria-label={`Hapus kategori ${category}`}
                  className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#9BA3BC] hover:text-[#ef4444] transition-colors"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}
            {state.categories.length === 0 && (
              <span className="text-xs font-medium text-[#9BA3BC]">Belum ada kategori</span>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
              placeholder="Tambah kategori baru" className={`${fieldClass} flex-1`}
            />
            <button
              onClick={handleAddCategory}
              className="h-12 w-12 shrink-0 rounded-xl bg-[#1A56DB] text-white flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Tambah kategori"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </Section>

        {/* Akun */}
        <Section
          icon={Info} title="Akun" subtitle={state.user?.email || 'Informasi pengguna'}
          open={openSection === 'akun'} onToggle={() => toggle('akun')}
        >
          <div className="flex items-center gap-3 py-1">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
              {state.user?.image
                ? <img src={state.user.image} alt={state.user?.name || 'Profil'} className="w-full h-full object-cover" />
                : (state.user?.name?.[0]?.toUpperCase() || 'U')}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#1A1F3A] truncate">{state.user?.name || 'Pengguna'}</div>
              <div className="text-xs font-medium text-[#9BA3BC] truncate">{state.user?.email}</div>
            </div>
          </div>
          <Field label="Email" icon={Mail} hint="Email untuk login ke akun">
            <input type="email" value={accEmail} onChange={e => setAccEmail(e.target.value)}
              placeholder="email@domain.com" className={fieldClass} />
          </Field>
          <button
            onClick={handleSaveContact}
            disabled={savingContact}
            className="w-full h-11 rounded-xl bg-[#e8f1ff] text-[#1A56DB] font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-[#d4e4fb] disabled:opacity-60"
          >
            {savingContact ? 'Menyimpan...' : 'Simpan Email'}
          </button>
        </Section>

        {/* Tombol simpan di paling bawah — menyimpan Profil Toko & Operasional */}
        <button
          onClick={handleSave}
          className="w-full h-12 mt-1 bg-[#1A56DB] rounded-xl text-white font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ boxShadow: '0 4px 20px rgba(26,79,214,0.3)' }}
        >
          Simpan Pengaturan
        </button>

        {/* Logout selalu terlihat di paling bawah (tidak tersembunyi di akordeon). */}
        <button
          onClick={() => { logout(); showToast('Sampai jumpa!'); }}
          className="w-full h-12 bg-[#fee2e2] text-[#ef4444] font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-[#fecaca]"
        >
          <LogOut size={16} strokeWidth={2} /> Keluar dari Akun
        </button>

        <p className="text-center text-[11px] font-semibold text-[#DDE1EF] pt-1 pb-2">Laku · Warung Digital · v1.5</p>
      </div>
    </div>
  );
}

// Seksi pengaturan yang bisa dibuka/tutup (akordeon) dengan header berikon.
function Section({ icon: Icon, title, subtitle, open, onToggle, children }: {
  icon: typeof Store; title: string; subtitle: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-4 text-left active:bg-[#F8F9FC] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8effe] to-[#d4e4fb] flex items-center justify-center shrink-0">
          <Icon size={18} className="text-[#1A56DB]" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-[#1A1F3A] leading-tight">{title}</h3>
          <p className="text-[11px] font-medium text-[#9BA3BC] leading-tight truncate">{subtitle}</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-[#9BA3BC] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>
      {open && <div className="px-4 pb-4 flex flex-col gap-3.5">{children}</div>}
    </div>
  );
}

// Baris dengan label + sakelar on/off.
function ToggleRow({ icon: Icon, label, desc, checked, onChange }: {
  icon: typeof Store; label: string; desc: string; checked: boolean; onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#F4F6FD] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#1A56DB]" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[#1A1F3A] leading-tight">{label}</div>
        <div className="text-[11px] font-medium text-[#9BA3BC] leading-tight mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? 'bg-[#1A56DB]' : 'bg-[#DDE1EF]'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Field({ label, icon: Icon, hint, children }: {
  label: string; icon?: typeof Store; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[#9BA3BC] mb-1 flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-[#9BA3BC]" strokeWidth={2.2} />}
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] font-semibold text-[#9BA3BC] mt-1">{hint}</p>}
    </div>
  );
}
