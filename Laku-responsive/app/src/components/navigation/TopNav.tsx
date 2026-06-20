import { useRef, useState, type ChangeEvent } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, User, Mail, Camera, X, Check, AlertTriangle, Info, CheckCircle, XCircle, Settings } from 'lucide-react';
import ModalSheet from '@/components/modals/ModalSheet';
import LakuWordmark from '@/components/branding/LakuWordmark';

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Selamat datang kembali' },
  products: { title: 'Stok Barang', subtitle: 'Kelola inventori warung' },
  pos: { title: 'Kasir', subtitle: 'Proses transaksi penjualan' },
  records: { title: 'Catatan', subtitle: 'Riwayat semua transaksi' },
  insights: { title: 'Analisis AI', subtitle: 'Insight cerdas untuk bisnismu' },
  settings: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' },
};

const notifIcon = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const notifColor = {
  info: 'text-[#1A56DB] bg-[#E8F1FF]',
  success: 'text-[#22c55e] bg-[#dcfce7]',
  warning: 'text-[#d97706] bg-[#fef3c7]',
  error: 'text-[#ef4444] bg-[#fee2e2]',
};

export default function TopNav({ isDesktop = false }: { isDesktop?: boolean }) {
  const { state, showToast, updateUser, dispatch } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const currentTab = tabTitles[state.activeTab] || tabTitles.dashboard;

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const handleOpenProfile = () => {
    setProfileName(state.user?.name || '');
    setProfileImage(state.user?.image || '');
    setProfileOpen(true);
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) { showToast('Nama tidak boleh kosong'); return; }
    updateUser({ name: profileName.trim(), image: profileImage || undefined });
    showToast('Profil berhasil diperbarui');
    setProfileOpen(false);
  };

  const handleOpenSettings = () => {
    setProfileOpen(false);
    dispatch({ type: 'SET_TAB', payload: 'settings' });
  };

  const handleMarkAllRead = () => {
    state.notifications.forEach(n => {
      if (!n.read) dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
    });
  };

  // Mobile TopNav
  if (!isDesktop) {
    return (
      <>
        <div
          className="shrink-0 bg-gradient-to-r from-[#0B3A8D] via-[#1340b8] to-[#1A56DB] flex justify-between items-center relative overflow-hidden"
         style={{
  paddingLeft: 'clamp(12px, 4vw, 18px)',
  paddingRight: 'clamp(12px, 4vw, 18px)',
  paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
  paddingBottom: '8px',
  minHeight: 'clamp(48px, 12vw, 58px)',
}}
        >
          <div className="absolute right-[-30px] top-[-30px] w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="font-extrabold leading-tight tracking-tight" style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}><LakuWordmark aku="#FFFFFF" /></div>
            <div className="text-white/70 font-semibold leading-tight mt-0.5" style={{ fontSize: 'clamp(10px, 3vw, 12px)' }}>
              {tabTitles[state.activeTab]?.subtitle || 'Dashboard'}
            </div>
          </div>
          <div className="flex gap-2 items-center relative z-10">
            <button
              className="relative rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center active:bg-white/30 transition-all active:scale-95"
              style={{ width: 'clamp(32px, 9vw, 38px)', height: 'clamp(32px, 9vw, 38px)' }}
              onClick={() => setNotifOpen(true)}
            >
              {unreadCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] rounded-full border-2 border-white/30 flex items-center justify-center animate-pulse">
                  <span className="text-[8px] font-extrabold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
              <Bell size={17} className="text-white" strokeWidth={2} />
            </button>
            <button
              className="rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] border-2 border-white/30 active:scale-95 transition-smooth shadow-md overflow-hidden"
              style={{ width: 'clamp(32px, 9vw, 38px)', height: 'clamp(32px, 9vw, 38px)', fontSize: 'clamp(11px, 3vw, 13px)' }}
              onClick={handleOpenProfile}
            >
              {state.user?.image ? (
                <img src={state.user.image} alt={state.user?.name || 'Profil'} className="w-full h-full object-cover" />
              ) : (
                state.user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </button>
          </div>
        </div>

        {/* Notification Modal */}
        <ModalSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifikasi">
          <NotificationList
            notifications={state.notifications}
            onMarkRead={(id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })}
            onMarkAllRead={handleMarkAllRead}
            onClearAll={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
          />
        </ModalSheet>

        <ModalSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Profil Saya">
          <ProfileForm
            profileName={profileName}
            setProfileName={setProfileName}
            email={state.user?.email || ''}
            userName={state.user?.name || ''}
            image={profileImage}
            setImage={setProfileImage}
            onImageError={showToast}
            onSave={handleSaveProfile}
            onOpenSettings={handleOpenSettings}
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
            onClick={() => setNotifOpen(true)}
          >
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] rounded-full flex items-center justify-center">
                <span className="text-[8px] font-extrabold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </div>
            )}
            <Bell size={16} className="text-[#1A1F3A]" strokeWidth={2} />
          </button>

          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] active:scale-95 transition-smooth hover:shadow-md overflow-hidden"
            onClick={handleOpenProfile}
            title="Profil"
          >
            {state.user?.image ? (
              <img src={state.user.image} alt={state.user?.name || 'Profil'} className="w-full h-full object-cover" />
            ) : (
              state.user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <ModalSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifikasi">
        <NotificationList
          notifications={state.notifications}
          onMarkRead={(id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })}
          onMarkAllRead={handleMarkAllRead}
          onClearAll={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
        />
      </ModalSheet>

      <ModalSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Profil Saya">
        <ProfileForm
          profileName={profileName}
          setProfileName={setProfileName}
          email={state.user?.email || ''}
          userName={state.user?.name || ''}
          image={profileImage}
          setImage={setProfileImage}
          onImageError={showToast}
          onSave={handleSaveProfile}
          onOpenSettings={handleOpenSettings}
        />
      </ModalSheet>
    </>
  );
}

// ---- Notification List Component ----
function NotificationList({ notifications, onMarkRead, onMarkAllRead, onClearAll }: {
  notifications: { id: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; read: boolean; createdAt: string }[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}) {
  const unread = notifications.filter(n => !n.read).length;
  // Notifikasi yang sedang dibuka penuh (klik untuk baca selengkapnya).
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell size={40} className="text-[#DDE1EF] mb-3" strokeWidth={1.5} />
        <p className="text-sm font-bold text-[#9BA3BC]">Tidak ada notifikasi</p>
        <p className="text-xs text-[#DDE1EF] mt-1">Notifikasi stok rendah & target akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Action buttons */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-[#9BA3BC]">{unread} belum dibaca</span>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={onMarkAllRead} className="text-[10px] font-bold text-[#1A56DB] flex items-center gap-1 active:opacity-70">
              <Check size={12} /> Tandai semua dibaca
            </button>
          )}
          <button onClick={onClearAll} className="text-[10px] font-bold text-[#ef4444] flex items-center gap-1 active:opacity-70">
            <X size={12} /> Hapus semua
          </button>
        </div>
      </div>

      {/* Notification items — klik untuk baca penuh & tandai sudah dibaca */}
      {notifications.map(n => {
        const Icon = notifIcon[n.type];
        const colorClass = notifColor[n.type];
        const time = new Date(n.createdAt);
        const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        const expanded = expandedId === n.id;
        return (
          <button
            key={n.id}
            onClick={() => {
              if (!n.read) onMarkRead(n.id);
              setExpandedId(prev => (prev === n.id ? null : n.id));
            }}
            aria-expanded={expanded}
            className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
              n.read ? 'bg-[#F8F9FC]' : 'bg-white card-shadow'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold ${n.read ? 'text-[#3D4566]' : 'text-[#1A1F3A]'} ${expanded ? '' : 'truncate'}`}>{n.title}</span>
                {!n.read && <div className="w-2 h-2 bg-[#1A56DB] rounded-full shrink-0" />}
              </div>
              <p className={`text-[11px] text-[#9BA3BC] font-medium mt-0.5 ${expanded ? '' : 'line-clamp-2'}`}>{n.message}</p>
              <span className="text-[9px] text-[#DDE1EF] font-bold mt-1 block">
                {timeStr}{!expanded && n.message.length > 60 ? ' · ketuk untuk baca' : ''}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---- Profile Form Component ----
// FIX: Camera icon no longer overlaps into the photo — now positioned outside overflow:hidden
function ProfileForm({ profileName, setProfileName, email, userName, image, setImage, onImageError, onSave, onOpenSettings }: {
  profileName: string;
  setProfileName: (v: string) => void;
  email: string;
  userName: string;
  image: string;
  setImage: (v: string) => void;
  onImageError: (message: string) => void;
  onSave: () => void;
  onOpenSettings?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      onImageError('Ukuran foto maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 py-2">
        {/* Profile photo container — camera icon is OUTSIDE the overflow:hidden circle */}
        <div className="relative w-20 h-20">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] flex items-center justify-center shadow-lg overflow-hidden border-4 border-white active:scale-95 transition-smooth"
          >
            {image ? (
              <img src={image} alt={userName || 'Profil'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{userName?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </button>
          {/* Camera badge — positioned outside the overflow:hidden button */}
          <span
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1A56DB] border-2 border-white flex items-center justify-center pointer-events-none z-10"
          >
            <Camera size={13} className="text-white" strokeWidth={2.5} />
          </span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {image && (
          <button
            type="button"
            onClick={() => setImage('')}
            className="text-[10px] font-bold text-[#dc2626] flex items-center gap-1"
          >
            <X size={11} strokeWidth={2.5} /> Hapus Foto
          </button>
        )}
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

      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="w-full h-11 bg-[#F4F6FD] text-[#1A1F3A] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-[#EEF0F6]"
        >
          <Settings size={16} strokeWidth={2} />
          Buka Pengaturan
        </button>
      )}
    </div>
  );
}
