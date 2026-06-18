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
    if (!open) return;
    document.body.style.overflow = 'hidden';
    // Tutup modal saat menekan tombol Escape (umum & membantu aksesibilitas).
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Tablet/Desktop: centered dialog
  const isWide = typeof window !== 'undefined' && window.innerWidth >= 768;

  if (isWide) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay"
        style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="bg-white rounded-2xl flex flex-col w-full max-w-md modal-sheet"
          style={{ maxHeight: '85dvh', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-[#EEF0F6]">
            <h3 className="text-base font-extrabold text-[#1A1F3A]">{title}</h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#F8F9FC] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#EEF0F6]"
            >
              <X size={17} className="text-[#9BA3BC]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: bottom sheet
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end modal-overlay"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full bg-white rounded-t-3xl modal-sheet flex flex-col"
        style={{
          maxHeight: '88dvh',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#DDE1EF] rounded-full mx-auto mt-3 mb-2 shrink-0" />
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-[#EEF0F6]">
          <h3 className="text-base font-extrabold text-[#1A1F3A]">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F9FC] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#EEF0F6]"
          >
            <X size={17} className="text-[#9BA3BC]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
