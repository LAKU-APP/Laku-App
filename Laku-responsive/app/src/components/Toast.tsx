import { useApp } from '@/context/AppContext';
import { CheckCircle } from 'lucide-react';

export default function Toast() {
  const { state } = useApp();

  return (
    <div
      className={`fixed top-6 left-1/2 z-[999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl
                  bg-[#1A1F3A] text-white text-sm font-semibold whitespace-nowrap
                  transition-all duration-300 pointer-events-none shadow-2xl
                  ${state.toast.visible
                    ? '-translate-x-1/2 translate-y-0 opacity-100 scale-100'
                    : '-translate-x-1/2 -translate-y-20 opacity-0 scale-95'
                  }`}
      style={{
        transitionTimingFunction: state.toast.visible
          ? 'cubic-bezier(0.34,1.56,0.64,1)'
          : 'ease-in',
      }}
    >
      <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 flex items-center justify-center shrink-0">
        <CheckCircle size={14} className="text-[#22c55e]" strokeWidth={2.5} />
      </div>
      {state.toast.message}
    </div>
  );
}
