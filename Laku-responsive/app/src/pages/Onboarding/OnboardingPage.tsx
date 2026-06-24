import { useState } from 'react';
import {
  LayoutDashboard, Package, Calculator, Receipt, BarChart3,
  ChevronRight, ChevronLeft, Sparkles, ArrowRight,
  Target, TrendingUp, Download, ShoppingCart, Store, User
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/utils/currency';
import SuccessCheck from '@/components/feedback/SuccessCheck';

interface OnboardingProps {
  onComplete: () => void;
  userName?: string;
  initialStoreName?: string;
}

const targetPresets = [100000, 200000, 300000, 500000];

const steps = [
  {
    id: 'welcome',
    icon: Store,
    iconBg: 'from-[#1A56DB] to-[#0B3A8D]',
    title: 'Selamat Datang di LAKU! 👋',
    subtitle: 'Aplikasi manajemen toko yang simpel & cerdas',
    description: 'Yuk kenalan dulu sama fitur-fitur LAKU biar kamu bisa langsung pakai dengan mudah.',
    tip: 'Tutorial ini cuma beberapa detik kok!',
    visual: 'welcome',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    iconBg: 'from-[#1A56DB] to-[#2563EB]',
    title: 'Dashboard — Pantau Bisnis',
    subtitle: 'Semua info penting dalam satu layar',
    description: 'Lihat laba hari ini, jumlah transaksi, dan kas di tangan. Kamu juga bisa set target harian biar makin semangat!',
    tip: '💡 Klik "Edit Target" untuk atur target laba harianmu',
    visual: 'dashboard',
  },
  {
    id: 'products',
    icon: Package,
    iconBg: 'from-[#059669] to-[#10B981]',
    title: 'Stok Barang — Kelola Produk',
    subtitle: 'Tambah, edit, dan atur stok dengan mudah',
    description: 'Daftarkan semua produk jualan kamu di sini. Upload foto produk, atur harga, dan pantau stok secara real-time.',
    tip: '💡 Klik tombol "+" biru untuk tambah produk baru',
    visual: 'products',
  },
  {
    id: 'pos',
    icon: Calculator,
    iconBg: 'from-[#7C3AED] to-[#8B5CF6]',
    title: 'Kasir — Proses Penjualan',
    subtitle: 'Transaksi cepat dalam hitungan detik',
    description: 'Tinggal klik produk untuk menambah ke keranjang, atur jumlah, lalu tekan "Bayar". Struk otomatis tercatat!',
    tip: '💡 Setelah bayar, kamu bisa cetak struk langsung',
    visual: 'pos',
  },
  {
    id: 'records',
    icon: Receipt,
    iconBg: 'from-[#D97706] to-[#F59E0B]',
    title: 'Catatan — Riwayat Lengkap',
    subtitle: 'Semua transaksi tercatat rapi',
    description: 'Filter berdasarkan waktu (hari ini, kemarin, 7 hari, 30 hari). Kamu juga bisa export laporan ke CSV atau PDF kapan saja.',
    tip: '💡 Tombol hijau "CSV" dan biru "PDF" ada di bawah filter waktu',
    visual: 'records',
  },
  {
    id: 'insights',
    icon: BarChart3,
    iconBg: 'from-[#DC2626] to-[#EF4444]',
    title: 'Analisis AI — Insight Cerdas',
    subtitle: 'Prediksi & analisis otomatis',
    description: 'LAKU menganalisis pola penjualanmu dan memberikan prediksi omzet minggu depan, peringatan stok rendah, dan saran restock.',
    tip: '💡 Buka "AI Prediction" untuk lihat detail prediksi',
    visual: 'insights',
  },
  {
    id: 'setup-store',
    icon: Store,
    iconBg: 'from-[#1A56DB] to-[#0B3A8D]',
    title: 'Atur Profil Toko',
    subtitle: 'Biar struk kamu tampil profesional',
    description: 'Isi nama toko. Nama ini akan muncul di struk penjualan, dan bisa diubah lagi kapan saja di Pengaturan.',
    tip: '💡 Boleh dikosongkan dulu, isi nanti juga bisa',
    visual: 'setup-store',
    interactive: true,
  },
  {
    id: 'setup-target',
    icon: Target,
    iconBg: 'from-[#059669] to-[#10B981]',
    title: 'Tentukan Target Harian',
    subtitle: 'Pacu semangat jualan tiap hari',
    description: 'Berapa target laba per hari yang ingin kamu capai? Progresnya akan tampil di Dashboard setiap hari.',
    tip: '💡 Pilih salah satu atau isi angka sendiri',
    visual: 'setup-target',
    interactive: true,
  },
  {
    id: 'ready',
    icon: Sparkles,
    iconBg: 'from-[#1A56DB] to-[#0B3A8D]',
    title: 'Siap Mulai! 🚀',
    subtitle: 'Kamu sudah siap pakai LAKU',
    description: 'Semua fitur sudah dipasang dan siap digunakan. Mulai dengan menambahkan produk, lalu coba proses penjualan pertamamu!',
    tip: 'Semoga bisnis kamu makin laku! 💙',
    visual: 'ready',
  },
];

// Bersihkan input angka menjadi bilangan bulat non-negatif.
function toAmount(value: string): number {
  const n = parseInt(value.replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function StepVisual({ visual }: { visual: string }) {
  const iconClass = 'text-white';
  const cardBase = 'bg-white/10 backdrop-blur-sm rounded-xl border border-white/10';

  switch (visual) {
    case 'welcome':
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {[LayoutDashboard, Package, Calculator, Receipt, BarChart3].map((Icon, i) => (
              <div key={i} className={`w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center animate-fade-up`}
                style={{ animationDelay: `${i * 0.08}s` }}>
                <Icon size={20} className={iconClass} strokeWidth={2} />
              </div>
            ))}
          </div>
          <div className={`${cardBase} px-4 py-2.5 flex items-center gap-2 animate-fade-up`} style={{ animationDelay: '0.4s' }}>
            <Sparkles size={14} className="text-yellow-300" />
            <span className="text-white/80 text-xs font-medium">5 fitur utama siap digunakan</span>
          </div>
        </div>
      );
    case 'dashboard':
      return (
        <div className="flex flex-col gap-2 w-full max-w-[260px]">
          <div className={`${cardBase} p-3 animate-fade-up`}>
            <div className="text-[10px] text-white/50 font-medium mb-1">Laba Hari Ini</div>
            <div className="text-lg font-extrabold text-white">Rp 125.000</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full w-[65%] bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-white/40">Target: Rp 200.000</span>
              <span className="text-[9px] text-white/60 font-bold">65%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className={`${cardBase} p-2.5`}>
              <Target size={14} className="text-blue-300 mb-1" />
              <div className="text-[10px] text-white/50">Transaksi</div>
              <div className="text-sm font-bold text-white">12</div>
            </div>
            <div className={`${cardBase} p-2.5`}>
              <TrendingUp size={14} className="text-green-300 mb-1" />
              <div className="text-[10px] text-white/50">Omzet</div>
              <div className="text-sm font-bold text-white">Rp 450k</div>
            </div>
          </div>
        </div>
      );
    case 'products':
      return (
        <div className="flex flex-col gap-2 w-full max-w-[260px]">
          {['Nasi Goreng', 'Es Teh', 'Beras 1kg'].map((name, i) => (
            <div key={i} className={`${cardBase} px-3 py-2.5 flex items-center justify-between animate-fade-up`}
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Package size={14} className="text-white/70" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{name}</div>
                  <div className="text-[10px] text-white/40">Stok: {[50, 30, 100][i]}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-green-300 bg-green-400/10 px-2 py-0.5 rounded">
                Tersedia
              </div>
            </div>
          ))}
        </div>
      );
    case 'pos':
      return (
        <div className="flex flex-col gap-2 w-full max-w-[260px]">
          <div className="grid grid-cols-3 gap-1.5 animate-fade-up">
            {['☕', '🍚', '🧊'].map((emoji, i) => (
              <div key={i} className={`${cardBase} p-2.5 flex flex-col items-center gap-1`}>
                <span className="text-lg">{emoji}</span>
                <div className="text-[9px] text-white/60 font-medium">Produk</div>
              </div>
            ))}
          </div>
          <div className={`${cardBase} p-3 flex items-center justify-between animate-fade-up`} style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-300" />
              <div>
                <div className="text-xs font-bold text-white">3 item</div>
                <div className="text-[10px] text-white/40">di keranjang</div>
              </div>
            </div>
            <div className="bg-blue-500 px-3 py-1.5 rounded-lg text-xs font-bold text-white">Bayar</div>
          </div>
        </div>
      );
    case 'records':
      return (
        <div className="flex flex-col gap-2 w-full max-w-[260px]">
          <div className="flex gap-1.5 animate-fade-up">
            {['Hari Ini', '7 Hari', '30 Hari'].map((f, i) => (
              <div key={i} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${i === 0 ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'}`}>
                {f}
              </div>
            ))}
          </div>
          <div className={`${cardBase} p-3 flex items-center justify-between animate-fade-up`} style={{ animationDelay: '0.1s' }}>
            <div>
              <div className="text-[10px] text-white/40">Omzet</div>
              <div className="text-sm font-bold text-white">Rp 450.000</div>
            </div>
            <div className="flex gap-1.5">
              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <Download size={10} /> CSV
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-blue-500 text-[10px] font-bold text-white flex items-center gap-1">
                <Download size={10} /> PDF
              </div>
            </div>
          </div>
        </div>
      );
    case 'insights':
      return (
        <div className="flex flex-col gap-2 w-full max-w-[260px] animate-fade-up">
          <div className={`${cardBase} p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={14} className="text-blue-300" />
              <span className="text-xs font-bold text-white">Omzet Mingguan</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 65, 35, 80, 55, 70, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                  style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.6 }} />
              ))}
            </div>
          </div>
          <div className={`${cardBase} p-2.5 flex items-center gap-2 animate-fade-up`} style={{ animationDelay: '0.1s' }}>
            <Sparkles size={14} className="text-yellow-300" />
            <span className="text-[11px] text-white/70 font-medium">Prediksi: +12% minggu depan</span>
          </div>
        </div>
      );
    case 'ready':
      return (
        <div className="flex flex-col items-center gap-3 animate-fade-up">
          <div className="text-5xl mb-1">🎉</div>
          <div className="flex gap-1.5">
            {['Dashboard', 'Produk', 'Kasir', 'Catatan', 'Analisis'].map((label, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white/70 font-medium">
                {label}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function Onboarding({ onComplete, userName, initialStoreName }: OnboardingProps) {
  const { state, updateStoreSettings, setDailyTarget } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Baca data pendaftaran yang tersimpan sementara di localStorage.
  const pendingUsername = (() => { try { return localStorage.getItem('pendingUsername') || ''; } catch { return ''; } })();
  const pendingStoreName = (() => { try { return localStorage.getItem('pendingStoreName') || ''; } catch { return ''; } })();

  // Data setup yang diisi pengguna baru selama onboarding.
  const [ownerName, setOwnerName] = useState(pendingUsername || userName || '');
  const [storeName, setStoreName] = useState(pendingStoreName || initialStoreName || userName || '');
  const [dailyTarget, setDailyTargetInput] = useState('200000');

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const Icon = step.icon;

  // Simpan data setup saat meninggalkan langkah interaktif, supaya tetap
  // tersimpan walau pengguna melewati langkah berikutnya.
  const commitStep = () => {
    if (step.id === 'setup-store') {
      // Nomor HP dari pendaftaran otomatis jadi nomor toko (tidak perlu diisi ulang).
      const phoneFromAccount = state.user?.phone
        ? (state.user.phone.startsWith('62') ? '0' + state.user.phone.slice(2) : state.user.phone)
        : '';
      updateStoreSettings({
        storeName: storeName.trim(),
        ...(phoneFromAccount ? { storePhone: phoneFromAccount } : {}),
      });
      // Bersihkan data sementara dari localStorage setelah diproses.
      try {
        localStorage.removeItem('pendingUsername');
        localStorage.removeItem('pendingStoreName');
      } catch { /* abaikan */ }
    }
    if (step.id === 'setup-target') {
      const target = toAmount(dailyTarget);
      if (target > 0) setDailyTarget(target);
    }
  };

  const goNext = () => {
    commitStep();
    if (isLast) { onComplete(); return; }
    setDirection('next');
    setCurrentStep(prev => prev + 1);
  };

  const goPrev = () => {
    if (isFirst) return;
    setDirection('prev');
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0a1540 0%, #1340b8 50%, #1e6ef5 100%)' }}>
      {/* Background decorations */}
      <div className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#1A56DB]/15 blur-[100px] pointer-events-none" />

      {/* Wrapper min-h-full + scroll: konten panjang tetap bisa di-scroll di layar pendek */}
      <div className="relative z-10 min-h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px] flex flex-col items-center">
        {/* Skip button */}
        {!isLast && (
          <button onClick={onComplete}
            className="absolute top-0 right-0 text-white/40 text-xs font-bold hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Lewati →
          </button>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
              i === currentStep ? 'w-6 bg-white' :
              i < currentStep ? 'w-1.5 bg-white/50' : 'w-1.5 bg-white/15'
            }`} />
          ))}
        </div>

        {/* Area tinggi-TETAP: tombol navigasi selalu di posisi yang sama tiap slide.
            Konten yang lebih tinggi men-scroll di dalam area, bukan mendorong tombol. */}
        <div className="w-full overflow-y-auto scrollbar-hide" style={{ height: 'min(64vh, 500px)' }}>
        <div className="min-h-full flex flex-col items-center justify-center text-center gap-5">

        {/* Step icon */}
        <div key={`icon-${currentStep}-${direction}`}
          className="w-16 h-16 rounded-2xl flex items-center justify-center animate-fade-up"
          style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center shadow-lg`}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <Icon size={28} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div key={`content-${currentStep}-${direction}`} className="text-center animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">
            {isFirst && (pendingUsername || userName) ? `Halo, ${pendingUsername || userName}! 👋` : step.title}
          </h2>
          <p className="text-sm font-semibold text-white/60 mb-4">{step.subtitle}</p>
          <p className="text-sm text-white/50 leading-relaxed max-w-[340px] mx-auto">{step.description}</p>
        </div>

        {/* Visual / Setup interaktif */}
        <div key={`visual-${currentStep}-${direction}`} className="w-full flex justify-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {step.id === 'setup-store' ? (
            <div className="w-full max-w-[300px] flex flex-col gap-3">
              <SetupInput icon={User} label="Nama Pengguna" value={ownerName} onChange={setOwnerName} placeholder="Nama kamu" autoFocus />
              <SetupInput icon={Store} label="Nama Toko" value={storeName} onChange={setStoreName} placeholder="Warung Bu Sri" />
            </div>
          ) : step.id === 'setup-target' ? (
            <div className="w-full max-w-[300px] flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {targetPresets.map(preset => {
                  const active = toAmount(dailyTarget) === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => setDailyTargetInput(String(preset))}
                      className={`h-11 rounded-xl text-sm font-bold transition-all border ${
                        active
                          ? 'bg-white text-[#1A56DB] border-white'
                          : 'bg-white/[0.06] text-white/80 border-white/15 hover:bg-white/10'
                      }`}
                    >
                      {formatRupiah(preset)}
                    </button>
                  );
                })}
              </div>
              <SetupInput
                icon={Target} label="Atau isi sendiri" value={dailyTarget}
                onChange={v => setDailyTargetInput(v.replace(/\D/g, ''))}
                placeholder="200000" type="tel"
              />
            </div>
          ) : step.id === 'ready' ? (
            <SuccessCheck size={120} color="#ffffff" ringColor="rgba(255,255,255,0.5)" />
          ) : (
            <StepVisual visual={step.visual} />
          )}
        </div>

        {/* Tip */}
        <div key={`tip-${currentStep}`} className="bg-white/8 border border-white/10 rounded-xl px-4 py-2.5 max-w-[340px] animate-fade-up"
          style={{ animationDelay: '0.15s', backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-white/60 font-medium text-center">{step.tip}</p>
        </div>
        </div>
        </div>
        {/* /Area tinggi-tetap */}

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 w-full max-w-[340px] mt-6">
          {!isFirst && (
            <button onClick={goPrev}
              className="h-12 px-4 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center gap-1.5
                         active:scale-[0.97] transition-all hover:bg-white/15">
              <ChevronLeft size={16} /> Kembali
            </button>
          )}
          <button onClick={goNext}
            className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                       active:scale-[0.97] transition-all"
            style={{
              background: isLast
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #ffffff, #e8effe)',
              color: isLast ? '#fff' : '#1A56DB',
              boxShadow: isLast
                ? '0 4px 20px rgba(34,197,94,0.4)'
                : '0 4px 20px rgba(255,255,255,0.2)',
            }}>
            {isLast ? (
              <>Mulai Sekarang <ArrowRight size={16} /></>
            ) : (
              <>Lanjut <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-[10px] text-white/25 font-medium mt-4">
          {currentStep + 1} dari {steps.length}
        </p>
      </div>
      </div>
    </div>
  );
}

// Input bergaya terang di atas latar gradien gelap untuk langkah setup.
function SetupInput({ icon: Icon, label, value, onChange, placeholder, type = 'text', autoFocus = false }: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="text-[11px] font-bold text-white/60">{label}</span>
      <div className="flex items-center gap-2.5 h-12 px-4 rounded-xl bg-white/[0.08] border border-white/15 focus-within:border-white/40 focus-within:bg-white/[0.12] transition-colors">
        <Icon size={16} className="text-white/50 shrink-0" strokeWidth={2.2} />
        <input
          type={type}
          inputMode={type === 'tel' ? 'numeric' : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-white placeholder-white/30 outline-none"
        />
      </div>
    </label>
  );
}
