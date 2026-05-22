import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, LogOut, User, Mail } from 'lucide-react';
import ModalSheet from './ModalSheet';

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Selamat datang kembali 👋' },
  products: { title: 'Stok Barang', subtitle: 'Kelola inventori warung' },
  pos: { title: 'Kasir', subtitle: 'Proses transaksi penjualan' },
  records: { title: 'Catatan', subtitle: 'Riwayat semua transaksi' },
  insights: { title: 'Analisis AI', subtitle: 'Insight cerdas untuk bisnismu' },
};

export default function TopNav({ isDesktop = false }: { isDesktop?: boolean }) {
  const { state, showToast, logout, updateUser } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const currentTab = tabTitles[state.activeTab] || tabTitles.dashboard;

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

  // Mobile TopNav
  if (!isDesktop) {
    return (
      <>
        <div className="shrink-0 bg-gradient-to-r from-[#1340b8] to-[#1A56DB] flex justify-between items-center px-5 py-4 relative overflow-hidden">
          <div className="absolute right-[-30px] top-[-30px] w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="text-white font-extrabold text-xl leading-tight tracking-tight">LAKU</div>
            <div className="text-white/70 text-xs font-semibold leading-tight mt-0.5">
              {tabTitles[state.activeTab]?.subtitle || 'Dashboard'}
            </div>
          </div>
          <div className="flex gap-2.5 items-center relative z-10">
            <button
              className="relative w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center active:bg-white/30 transition-all active:scale-95"
              onClick={() => showToast('3 notifikasi baru')}
            >
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full border-2 border-white/30 animate-pulse" />
              <Bell size={18} className="text-white" strokeWidth={2} />
            </button>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#f9c97c] to-[#F97316] border-2 border-white/30 active:scale-95 transition-transform shadow-md"
              onClick={handleOpenProfile}
            >
              {state.user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>

        <ModalSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Profil Saya">
          <ProfileForm
            profileName={profileName}
            setProfileName={setProfileName}
            email={state.user?.email || ''}
            userName={state.user?.name || ''}
            onSave={handleSaveProfile}
            onLogout={handleLogout}
          />
        </ModalSheet>
      </>
    );
  }

  // Desktop/Tablet TopNav
  return (
    <>
      <div
        className="shrink-0 bg-white border-b border-[#EEF0F6] flex justify-between items-center px-6 py-4"
        style={{ boxShadow: '0 2px 16px rgba(26,79,214,0.06)' }}
      >
        <div>
          <h1 className="text-xl font-extrabold text-[#1A1F3A] leading-tight">{currentTab.title}</h1>
          <p className="text-sm text-[#9BA3BC] font-medium leading-tight mt-0.5">{currentTab.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative w-9 h-9 rounded-xl bg-[#F4F6FD] flex items-center justify-center hover:bg-[#E8EDF8] transition-colors active:scale-95"
            onClick={() => showToast('3 notifikasi baru')}
          >
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full" />
            <Bell size={16} className="text-[#1A1F3A]" strokeWidth={2} />
          </button>

          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#f9c97c] to-[#F97316] active:scale-95 transition-transform hover:shadow-md"
            onClick={handleOpenProfile}
            title="Profil"
          >
            {state.user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      <ModalSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Profil Saya">
        <ProfileForm
          profileName={profileName}
          setProfileName={setProfileName}
          email={state.user?.email || ''}
          userName={state.user?.name || ''}
          onSave={handleSaveProfile}
          onLogout={handleLogout}
        />
      </ModalSheet>
    </>
  );
}

function ProfileForm({ profileName, setProfileName, email, userName, onSave, onLogout }: {
  profileName: string;
  setProfileName: (v: string) => void;
  email: string;
  userName: string;
  onSave: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f9c97c] to-[#F97316] flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{userName?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <p className="text-xs text-[#9BA3BC]">{email}</p>
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
          <input type="email" value={email} disabled
            className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] outline-none opacity-60 cursor-not-allowed" />
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full h-11 bg-gradient-to-r from-[#1A56DB] to-[#1340b8] text-white font-bold rounded-xl transition-all active:scale-[0.98]"
      >
        Simpan Perubahan
      </button>

      <div className="border-t border-[#EEF0F6] pt-4">
        <button
          onClick={onLogout}
          className="w-full h-11 bg-[#fee2e2] text-[#ef4444] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-[#fecaca]"
        >
          <LogOut size={16} strokeWidth={2} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
