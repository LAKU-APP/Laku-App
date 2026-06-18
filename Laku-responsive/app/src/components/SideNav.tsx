import { useApp } from '@/context/AppContext';
import type { TabType } from '@/types';
import { LayoutDashboard, Package, Calculator, Receipt, BarChart3, Settings } from 'lucide-react';
import LakuLogo from './LakuLogo';
import { useIsTablet } from '@/hooks/use-mobile';

const tabs: { key: TabType; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Ringkasan hari ini' },
  { key: 'products', label: 'Stok Barang', icon: Package, desc: 'Kelola inventori' },
  { key: 'pos', label: 'Kasir', icon: Calculator, desc: 'Proses transaksi' },
  { key: 'records', label: 'Catatan', icon: Receipt, desc: 'Riwayat transaksi' },
  { key: 'insights', label: 'Analisis AI', icon: BarChart3, desc: 'Insight cerdas' },
];

export default function SideNav() {
  const { state, dispatch } = useApp();
  const isTablet = useIsTablet();

  // Profil & akun dikelola lewat avatar di TopNav dan halaman Pengaturan,
  // jadi baris pengguna di sidebar ini hanya menampilkan info (tidak diklik).
  return (
      <nav
        className={`flex flex-col bg-white border-r border-[#EEF0F6] shrink-0 ${isTablet ? 'w-[72px]' : 'w-[260px]'}`}
        style={{ boxShadow: '4px 0 24px rgba(26,79,214,0.08)', minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 border-b border-[#EEF0F6] ${isTablet ? 'justify-center px-0 py-5' : 'px-5 py-5'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#1A56DB] to-[#1340b8] rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <LakuLogo size={22} className="text-white" />
          </div>
          {!isTablet && (
            <div>
              <div className="text-[#1A1F3A] font-extrabold text-base leading-tight tracking-tight">LAKU</div>
              <div className="text-[#9BA3BC] text-[10px] font-semibold leading-tight">Warung Digital</div>
            </div>
          )}
        </div>



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
            const isPOS = tab.key === 'pos';
            return (
              <button
                key={tab.key}
                onClick={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
                title={isTablet ? tab.label : undefined}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-150 group relative
                  ${isTablet ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isPOS && !isActive
                    ? 'bg-gradient-to-r from-[#e8effe] to-[#dbeafe] text-[#1A56DB] border border-[#1A56DB]/20'
                    : ''
                  }
                  ${isActive
                    ? 'bg-[#1A56DB] text-white shadow-md'
                    : !isPOS ? 'text-[#9BA3BC] hover:bg-[#F4F6FD] hover:text-[#1A1F3A]' : 'hover:bg-[#dbeafe]'
                  }
                `}
              >
                {isActive && !isTablet && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-r-full" />
                )}
                {isPOS && !isActive ? (
                  <div className={`${isTablet ? 'w-9 h-9' : 'w-8 h-8'} rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#1340b8] flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon size={isTablet ? 18 : 16} strokeWidth={2.5} className="text-white" />
                  </div>
                ) : (
                  <Icon size={isTablet ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                )}
                {!isTablet && (
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-bold leading-tight ${isActive ? 'text-white' : isPOS ? 'text-[#1A56DB]' : ''}`}>{tab.label}</div>
                    <div className={`text-[10px] font-medium leading-tight ${isActive ? 'text-white/70' : isPOS ? 'text-[#1A56DB]/60' : 'text-[#DDE1EF] group-hover:text-[#9BA3BC]'}`}>{tab.desc}</div>
                  </div>
                )}
                {isPOS && !isActive && !isTablet && (
                  <div className="w-2 h-2 rounded-full bg-[#1A56DB] shrink-0" />
                )}
              </button>
            );
          })}

          {/* Separator + Settings */}
          <div className="mt-auto pt-2">
            {!isTablet && (
              <div className="px-3 py-1 mb-1">
                <span className="text-[9px] font-extrabold text-[#DDE1EF] uppercase tracking-widest">Lainnya</span>
              </div>
            )}
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'settings' })}
              title={isTablet ? 'Pengaturan' : undefined}
              className={`
                flex items-center gap-3 rounded-xl transition-all duration-150 w-full
                ${isTablet ? 'justify-center p-3' : 'px-3 py-2.5'}
                ${state.activeTab === 'settings'
                  ? 'bg-[#1A56DB] text-white shadow-md'
                  : 'text-[#9BA3BC] hover:bg-[#F4F6FD] hover:text-[#1A1F3A]'
                }
              `}
            >
              <Settings size={isTablet ? 22 : 18} strokeWidth={state.activeTab === 'settings' ? 2.5 : 2} className="shrink-0" />
              {!isTablet && (
                <div className="flex-1 text-left">
                  <div className={`text-sm font-bold leading-tight ${state.activeTab === 'settings' ? 'text-white' : ''}`}>Pengaturan</div>
                  <div className={`text-[10px] font-medium leading-tight ${state.activeTab === 'settings' ? 'text-white/70' : 'text-[#DDE1EF]'}`}>Konfigurasi toko</div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Info pengguna (statis) — kelola profil via TopNav atau Pengaturan */}
        <div className={`p-3 border-t border-[#EEF0F6] flex items-center gap-3 ${isTablet ? 'justify-center' : 'px-4'}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] overflow-hidden"
            style={{ boxShadow: '0 2px 8px rgba(26,86,219,0.28)' }}
          >
            {state.user?.image ? (
              <img src={state.user.image} alt={state.user?.name || 'Profil'} className="w-full h-full object-cover" />
            ) : (
              state.user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          {!isTablet && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#1A1F3A] truncate">{state.user?.name || 'User'}</div>
              <div className="text-[10px] text-[#9BA3BC] font-medium truncate">{state.user?.email || ''}</div>
            </div>
          )}
        </div>
      </nav>
  );
}
