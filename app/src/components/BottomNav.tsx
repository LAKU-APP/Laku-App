import { useApp } from '@/context/AppContext';
import type { TabType } from '@/types';
import { LayoutDashboard, Package, Calculator, Receipt, BarChart3 } from 'lucide-react';

const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Stok', icon: Package },
  { key: 'pos', label: 'Kasir', icon: Calculator },
  { key: 'records', label: 'Catatan', icon: Receipt },
  { key: 'insights', label: 'Analisis', icon: BarChart3 },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
    <nav
      className="shrink-0 bg-white border-t border-[#EEF0F6] z-50 w-full"
      style={{ boxShadow: '0 -4px 24px rgba(26,79,214,0.08)' }}
    >
      <div
        className="flex items-stretch justify-around"
        style={{
          paddingTop: '10px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
          minHeight: '64px',
        }}
      >
        {tabs.map(tab => {
          const isActive = state.activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 px-1 active:scale-95 transition-transform duration-150"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`relative transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon
                  size={23}
                  className={`transition-colors duration-200 ${isActive ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-[#1A56DB]/10 rounded-full blur-md" />
                )}
              </div>
              <span className={`text-[10px] font-bold leading-tight transition-colors duration-200 ${isActive ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1A56DB] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
