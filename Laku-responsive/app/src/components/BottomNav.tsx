import { useApp } from '@/context/AppContext';
import type { TabType } from '@/types';
import { LayoutDashboard, Package, Calculator, Receipt, Sparkles } from 'lucide-react';

const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Stok', icon: Package },
  { key: 'pos', label: 'Kasir', icon: Calculator },
  { key: 'records', label: 'Catatan', icon: Receipt },
  { key: 'insights', label: 'Insight', icon: Sparkles },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
   <nav
  className="shrink-0 bg-white z-50 w-full"
  style={{
    boxShadow: '0 -4px 24px rgba(26,79,214,0.08)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  }}
>
      <div
  className="flex items-end justify-around"
  style={{
    paddingBottom: '8px',
    minHeight: 'clamp(54px, 14vw, 64px)',
  }}
>
        {tabs.map(tab => {
          const isActive = state.activeTab === tab.key;
          const Icon = tab.icon;
          const isPOS = tab.key === 'pos';

          if (isPOS) {
            return (
              <button
                key={tab.key}
                onClick={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
                className="relative flex flex-col items-center flex-1 min-w-0 focus:outline-none pb-1"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="relative mb-1" style={{ marginTop: 'clamp(-18px, -5vw, -22px)' }}>
                  <div
                    className={`rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 ${
                      isActive
                        ? 'bg-gradient-to-br from-[#1A56DB] to-[#1340b8] shadow-[0_6px_24px_rgba(26,79,214,0.55)]'
                        : 'bg-gradient-to-br from-[#1A56DB] to-[#1340b8] shadow-[0_4px_16px_rgba(26,79,214,0.35)]'
                    }`}
                   style={{
  width: 'clamp(46px, 12vw, 54px)',
  height: 'clamp(46px, 12vw, 54px)',
}}
                  >
                    <Calculator size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-[3px] border-[#1A56DB]/40 animate-ping" />
                  )}
                </div>
                <span
                  className={`font-bold leading-none transition-colors duration-200 ${isActive ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'}`}
                  style={{ fontSize: 'clamp(9px, 2.5vw, 11px)' }}
                >
                  Kasir
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 px-1 active:scale-95 transition-transform duration-150 focus:outline-none pb-1"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`relative transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${isActive ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-[#1A56DB]/10 rounded-full" />
                  </div>
                )}
              </div>
              <span
                className={`font-bold leading-none transition-colors duration-200 ${isActive ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'}`}
                style={{ fontSize: 'clamp(9px, 2.5vw, 11px)' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
