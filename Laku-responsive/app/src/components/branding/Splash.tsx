import LakuLogo from '@/components/branding/LakuLogo';

// Layar pembuka singkat saat aplikasi dimuat: logo + tulisan "laku..." di
// tengah dengan titik beranimasi. Memberi kesan transisi masuk yang halus.
export default function Splash() {
  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0a1540 0%, #1340b8 60%, #1e6ef5 100%)' }}
    >
      <div className="mb-5 animate-fade-up" style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))' }}>
        <LakuLogo size={76} />
      </div>
      <div className="flex items-end text-white font-extrabold tracking-tight"
        style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: 'clamp(28px, 9vw, 40px)' }}>
        <span style={{ color: '#1E50DC' }}>l</span><span>aku</span>
        <span className="laku-dot">.</span>
        <span className="laku-dot" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="laku-dot" style={{ animationDelay: '0.4s' }}>.</span>
      </div>
      <p className="text-white/40 text-xs font-medium mt-2">Warung digital untuk UMKM</p>
    </div>
  );
}
