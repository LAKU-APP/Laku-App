import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, AlertCircle, User, Eye, EyeOff, ArrowRight, TrendingUp, Package, Receipt, Rocket } from 'lucide-react';
import { apiLogin, apiRegister, saveToken } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import LakuLogo from '@/components/LakuLogo';

// Sorotan fitur utama pada panel branding halaman login.
const loginHighlights = [
  { icon: TrendingUp, title: 'Pantau Laba', desc: 'Lihat untung harian secara real-time' },
  { icon: Package, title: 'Kelola Stok', desc: 'Peringatan otomatis saat stok menipis' },
  { icon: Receipt, title: 'Catat Transaksi', desc: 'Struk & laporan tercatat otomatis' },
];

export default function Login() {
  const { dispatch, showToast, login, restartOnboarding } = useApp();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [animating, setAnimating] = useState(false);

  const switchMode = (newMode: 'login' | 'register') => {
    if (newMode === mode) return;
    setAnimating(true);
    setError(null);
    setTimeout(() => {
      setMode(newMode);
      setEmail(''); setPassword(''); setName(''); setConfirmPassword('');
      setShowPass(false); setShowConfirmPass(false);
      setAnimating(false);
    }, 180);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) { setError('Nama harus diisi'); return; }
      if (!email.trim()) { setError('Email harus diisi'); return; }
      if (!password.trim()) { setError('Password harus diisi'); return; }
      if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
      if (password !== confirmPassword) { setError('Password tidak cocok'); return; }
    } else {
      if (!email.trim()) { setError('Email harus diisi'); return; }
      if (!password.trim()) { setError('Password harus diisi'); return; }
    }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await apiLogin(email.trim(), password)
        : await apiRegister(name.trim(), email.trim(), password);
      saveToken(res.token);
      login(res.user);
      dispatch({ type: 'SET_TAB', payload: 'dashboard' });
      showToast(mode === 'login' ? 'Login berhasil!' : 'Akun berhasil dibuat!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin('admin@laku.id', 'admin123');
      saveToken(res.token);
      // Mode demo selalu memutar ulang langkah pengenalan, bukan langsung masuk.
      restartOnboarding();
      login(res.user);
      dispatch({ type: 'SET_TAB', payload: 'dashboard' });
      showToast('Login sebagai Admin Demo berhasil!');
    } catch {
      setError('Gagal login demo');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string, compact = false) =>
    `flex items-center gap-2.5 ${compact ? 'px-3 py-2' : 'px-4 py-3'} rounded-xl border-2 transition-all duration-200 ${
      focusedField === field
        ? 'border-[#1A56DB] bg-[#e8effe]'
        : 'border-[#EEF0F6] bg-[#F8F9FC] hover:border-[#d4e4fb]'
    }`;

  const renderForm = (compact = false) => (
    <div
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div className={compact ? 'mb-3' : 'mb-6'}>
        <h2 className={`font-extrabold text-[#1A1F3A] ${compact ? 'text-base' : 'text-xl'}`}>
          {mode === 'login' ? 'Masuk' : 'Buat Akun'}
        </h2>
        <p className={`text-[#9BA3BC] mt-0.5 ${compact ? 'text-[11px]' : 'text-sm'}`}>
          {mode === 'login' ? 'Selamat datang kembali' : 'Isi data untuk memulai'}
        </p>
      </div>

      {error && (
        <div className={`${compact ? 'mb-3' : 'mb-4'} p-2.5 rounded-xl bg-red-50 border border-red-200 flex gap-2 items-start`}>
          <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`flex flex-col ${compact ? 'gap-2.5' : 'gap-4'}`}>
        {mode === 'register' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#3D4566]">Nama Toko</label>
            <div className={inputCls('name', compact)}>
              <User size={compact ? 15 : 17} className={focusedField === 'name' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
              <input
                type="text" value={name}
                onChange={e => { setName(e.target.value); setError(null); }}
                onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
                placeholder="Warung Bu Sri"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#3D4566]">Email</label>
          <div className={inputCls('email', compact)}>
            <Mail size={compact ? 15 : 17} className={focusedField === 'email' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
            <input
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
              className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
              placeholder="nama@domain.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#3D4566]">Password</label>
          <div className={inputCls('password', compact)}>
            <Lock size={compact ? 15 : 17} className={focusedField === 'password' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
              className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
              placeholder={mode === 'register' ? 'Min. 6 karakter' : 'Masukkan password'}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#9BA3BC] hover:text-[#1A56DB] transition-colors shrink-0">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#3D4566]">Konfirmasi Password</label>
            <div className={inputCls('confirm', compact)}>
              <Lock size={compact ? 15 : 17} className={focusedField === 'confirm' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
              <input
                type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(null); }}
                onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
                placeholder="Ulangi password"
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-[#9BA3BC] hover:text-[#1A56DB] transition-colors shrink-0">
                {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className={`w-full rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${compact ? 'h-9 mt-0.5 text-xs' : 'h-12 mt-1 text-sm'}`}
          style={{ background: 'linear-gradient(135deg, #1A56DB, #1340b8)', boxShadow: '0 4px 20px rgba(26,79,214,0.35)' }}
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <>{mode === 'login' ? 'Masuk' : 'Buat Akun'}<ArrowRight size={14} /></>
          }
        </button>

        {mode === 'login' && (
          <div className={`flex flex-col items-center ${compact ? 'gap-2' : 'gap-3'}`}>
            {/* Separator */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-[#EEF0F6]" />
              <span className="text-[10px] text-[#9BA3BC] font-medium">atau</span>
              <div className="flex-1 h-px bg-[#EEF0F6]" />
            </div>

            {/* Demo login button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className={`w-full rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60
                bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] border-2 border-[#bbf7d0] text-[#16a34a]
                hover:from-[#dcfce7] hover:to-[#bbf7d0] ${compact ? 'h-9 text-xs' : 'h-11 text-sm'}`}
            >
              <Rocket size={compact ? 14 : 16} strokeWidth={2.4} /> Masuk Demo (Admin)
            </button>

            <p className={`text-[#9BA3BC] text-center ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
              Atau gunakan email & password apapun untuk masuk
            </p>
          </div>
        )}
      </form>

      <p className={`text-center text-[#9BA3BC] ${compact ? 'text-[11px] mt-3' : 'text-xs mt-5'}`}>
        {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
        <button
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="text-[#1A56DB] font-bold hover:underline"
        >
          {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
        </button>
      </p>
    </div>
  );

  // ── MOBILE ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center px-4 overflow-y-auto"
        style={{
          minHeight: '100dvh',
          background: 'linear-gradient(160deg, #0f1f5c 0%, #1A56DB 60%, #1e6ef5 100%)',
        }}
      >
        <div className="fixed top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="fixed bottom-[-40px] left-[-40px] w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="w-full max-w-[320px] relative z-10 py-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-5 animate-fade-up animate-delay-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <LakuLogo size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-base tracking-tight leading-none">LAKU</div>
              <div className="text-white/50 text-[10px] font-medium mt-0.5">Manajemen Toko</div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up animate-delay-2 transition-all duration-300 ease-out">
            <div className="h-[3px] bg-gradient-to-r from-[#1A56DB] to-[#1340b8]" />
            <div className="p-4">
              {renderForm(true)}
            </div>
          </div>

          {/* Sorotan fitur — biar layar masuk terasa kaya & meyakinkan */}
          <div className="grid grid-cols-3 gap-2 mt-4 animate-fade-up animate-delay-3">
            {loginHighlights.map(({ icon: Icon, title }) => (
              <div key={title} className="flex flex-col items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-xl py-2.5 px-1">
                <Icon size={16} className="text-white/80" strokeWidth={2.2} />
                <span className="text-[9px] font-semibold text-white/60 text-center leading-tight">{title}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-white/20 text-[10px] mt-4">© 2026 Laku</p>
        </div>
      </div>
    );
  }

  // ── DESKTOP ─────────────────────────────────────────────
  return (
    <div className="w-full flex overflow-hidden" style={{ minHeight: '100dvh' }}>

      {/* Left — minimal branding */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1540 0%, #1340b8 100%)' }}
      >
        {/* Geometric shapes */}
        <div className="absolute top-[-160px] right-[-160px] w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute bottom-[-140px] left-[-140px] w-[420px] h-[420px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[240px] h-[240px] rounded-full border border-white/5 pointer-events-none" />
        {/* Subtle glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#1A56DB]/20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <LakuLogo size={42} className="text-white" />
          </div>
          <div className="text-white font-extrabold tracking-[0.15em] text-3xl mb-2">LAKU</div>
          <div className="text-white/50 text-sm font-medium mb-10 text-center">Warung digital untuk UMKM Indonesia</div>

          <div className="flex flex-col gap-3 w-[300px]">
            {loginHighlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-white text-sm font-bold leading-tight">{title}</div>
                  <div className="text-white/45 text-[11px] font-medium leading-tight mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div
        className="w-[460px] shrink-0 flex flex-col items-center justify-center bg-white relative overflow-y-auto"
        style={{ borderRadius: '40px 0 0 40px', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)' }}
      >
        <div className="w-full max-w-[340px] px-2 py-12">
          <div className="mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A56DB] to-[#0B3A8D] flex items-center justify-center">
              <LakuLogo size={18} className="text-white" />
            </div>
            <div className="text-[11px] font-bold text-[#1A56DB] tracking-widest uppercase">LAKU</div>
          </div>

          {renderForm(false)}

          <p className="text-center text-[#DDE1EF] text-[11px] mt-8">© 2026 Laku</p>
        </div>
      </div>
    </div>
  );
}
