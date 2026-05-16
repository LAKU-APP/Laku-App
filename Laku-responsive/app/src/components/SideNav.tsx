import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { TabType } from '@/types';
import { LayoutDashboard, Package, Calculator, Receipt, BarChart3, Zap, TrendingUp, LogOut, User, Mail } from 'lucide-react';
import { useIsTablet } from '@/hooks/use-mobile';
import ModalSheet from './ModalSheet';

const tabs: { key: TabType; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Ringkasan hari ini' },
  { key: 'products', label: 'Stok Barang', icon: Package, desc: 'Kelola inventori' },
  { key: 'pos', label: 'Kasir', icon: Calculator, desc: 'Proses transaksi' },
  { key: 'records', label: 'Catatan', icon: Receipt, desc: 'Riwayat transaksi' },
  { key: 'insights', label: 'Analisis AI', icon: BarChart3, desc: 'Insight cerdas' },
];

export default function SideNav() {
  const { state, dispatch, logout, showToast, updateUser } = useApp();
  const isTablet = useIsTablet();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');

  const handleOpenProfile = () => {
    setProfileName(state.user?.name || '');
    setProfileOpen(true);
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) { showToast('Nama tidak boleh kosong'); return; }
    updateUser({ name: profileName.trim() });
    showToast('Profil berhasil diperbarui');
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setTimeout(() => { logout(); showToast('Sampai jumpa!'); }, 150);
  };

  const todayTxCount = state.transactions.filter(
    t => t.createdAt.startsWith(new Date().toISOString().split('T')[0]) && t.type === 'OUT'
  ).length;
  const lowStockCount = state.products.filter(p => p.stock <= 5).length;

  return (
    <>
      <nav
        className={`flex flex-col bg-white border-r border-[#EEF0F6] shrink-0 ${isTablet ? 'w-[72px]' : 'w-[260px]'}`}
        style={{ boxShadow: '4px 0 24px rgba(26,79,214,0.08)', minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 border-b border-[#EEF0F6] ${isTablet ? 'justify-center px-0 py-5' : 'px-5 py-5'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#1A56DB] to-[#1340b8] rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          {!isTablet && (
            <div>
              <div className="text-[#1A1F3A] font-extrabold text-base leading-tight tracking-tight">LAKU</div>
              <div className="text-[#9BA3BC] text-[10px] font-semibold leading-tight">Warung Digital</div>
            </div>
          )}
        </div>

        {/* Quick stats card - desktop only */}
        {!isTablet && (
          <div className="mx-3 mt-4 mb-2 bg-gradient-to-br from-[#1A56DB] to-[#1340b8] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full bg-white/10" />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <TrendingUp size={13} className="text-white/80" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Hari Ini</span>
            </div>
            <div className="text-white font-extrabold text-lg relative z-10">{todayTxCount} Transaksi</div>
            <div className="text-white/60 text-[10px] font-medium relative z-10">{lowStockCount} produk stok rendah</div>
          </div>
        )}

        {/* Nav items */}
        <div className="flex flex-col gap-1 p-2 flex-1 mt-1">
          {!isTablet && (
            <div className="px-3 py-1 mb-1">
              <span className="text-[9px] font-extrabold text-[#DDE1EF] uppercase tracking-widest">Menu Utama</span>
            </div>
          )}
          {tabs.map(tab => {
            const isActive = state.activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
                title={isTablet ? tab.label : undefined}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-150 group relative
                  ${isTablet ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-[#1A56DB] text-white shadow-md'
                    : 'text-[#9BA3BC] hover:bg-[#F4F6FD] hover:text-[#1A1F3A]'
                  }
                `}
              >
                {isActive && !isTablet && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-r-full" />
                )}
                <Icon size={isTablet ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {!isTablet && (
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-bold leading-tight ${isActive ? 'text-white' : ''}`}>{tab.label}</div>
                    <div className={`text-[10px] font-medium leading-tight ${isActive ? 'text-white/70' : 'text-[#DDE1EF] group-hover:text-[#9BA3BC]'}`}>{tab.desc}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* User avatar — click to open profile modal */}
        <div
          className={`p-3 border-t border-[#EEF0F6] flex items-center gap-3 cursor-pointer hover:bg-[#F8F9FC] transition-colors ${isTablet ? 'justify-center' : 'px-4'}`}
          onClick={handleOpenProfile}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-[#f9c97c] to-[#F97316]"
            style={{ boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}
          >
            {state.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!isTablet && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#1A1F3A] truncate">{state.user?.name || 'User'}</div>
              <div className="text-[10px] text-[#9BA3BC] font-medium truncate">{state.user?.email || ''}</div>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Modal */}
      <ModalSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Profil Saya">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f9c97c] to-[#F97316] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{state.user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <p className="text-xs text-[#9BA3BC]">{state.user?.email}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#3D4566]">Nama</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#EEF0F6] bg-[#F8F9FC] focus-within:border-[#1A56DB] transition-colors">
              <User size={17} className="text-[#9BA3BC]" />
              <input
                type="text" value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] outline-none"
                placeholder="Nama toko Anda"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#3D4566]">Email</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#EEF0F6] bg-[#F8F9FC]">
              <Mail size={17} className="text-[#9BA3BC]" />
              <input type="email" value={state.user?.email || ''} disabled
                className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] outline-none opacity-60 cursor-not-allowed" />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full h-11 bg-gradient-to-r from-[#1A56DB] to-[#1340b8] text-white font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            Simpan Perubahan
          </button>

          <div className="border-t border-[#EEF0F6] pt-4">
            <button
              onClick={handleLogout}
              className="w-full h-11 bg-[#fee2e2] text-[#ef4444] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-[#fecaca]"
            >
              <LogOut size={16} strokeWidth={2} />
              Keluar dari Akun
            </button>
          </div>
        </div>
      </ModalSheet>
    </>
  );
}
