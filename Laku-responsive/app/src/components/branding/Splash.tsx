import LakuLogo from '@/components/branding/LakuLogo';

// Layar pembuka singkat saat aplikasi dimuat: logo + tulisan "laku..." di
// tengah dengan titik beranimasi. Memberi kesan transisi masuk yang halus.
export default function Splash() {
  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0a1540 0%, #1340b8 60%, #1e6ef5 100%)' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5 animate-fade-up"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <LakuLogo size={34} className="text-white" />
      </div>
      <div className="flex items-end text-white font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px, 9vw, 40px)' }}>
        <span>laku</span>
        <span className="laku-dot">.</span>
        <span className="laku-dot" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="laku-dot" style={{ animationDelay: '0.4s' }}>.</span>
      </div>
      <p className="text-white/40 text-xs font-medium mt-2">Warung digital untuk UMKM</p>
    </div>
  );
}
