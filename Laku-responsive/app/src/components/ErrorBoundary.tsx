import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Menangkap error render React agar pengguna tidak melihat layar kosong saat
// terjadi crash, melainkan pesan yang ramah beserta tombol untuk memuat ulang.
// Error boundary harus berupa class component (belum ada padanan versi hook).
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Dicatat ke console untuk keperluan debugging pengembang.
    console.error('Terjadi error yang tidak tertangani:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-dvh w-full bg-[#F5F8FC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl card-shadow max-w-sm w-full p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fee2e2] flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-[#ef4444]" strokeWidth={2} />
          </div>
          <h1 className="text-lg font-extrabold text-[#1A1F3A]">Terjadi Kesalahan</h1>
          <p className="text-sm font-medium text-[#9BA3BC] mt-1.5">
            Maaf, aplikasi mengalami gangguan. Data kamu tetap aman tersimpan. Coba muat ulang halaman.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-5 h-11 px-6 rounded-xl bg-[#1A56DB] text-white text-sm font-bold flex items-center gap-2 active:scale-[0.97] transition-transform"
            style={{ boxShadow: '0 4px 20px rgba(26,79,214,0.3)' }}
          >
            <RotateCcw size={16} strokeWidth={2.5} /> Muat Ulang
          </button>
        </div>
      </div>
    );
  }
}
