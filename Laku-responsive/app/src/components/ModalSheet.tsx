import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ModalSheet({ open, onClose, title, children }: ModalSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end modal-overlay"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl modal-sheet flex flex-col"
        style={{
          maxHeight: '88dvh',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-[#DDE1EF] rounded-full mx-auto mt-3 mb-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-[#EEF0F6]">
          <h3 className="text-base font-extrabold text-[#1A1F3A]">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F9FC] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#EEF0F6]"
          >
            <X size={17} className="text-[#9BA3BC]" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
