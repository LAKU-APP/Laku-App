import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, AlertCircle, User, Eye, EyeOff, ArrowRight, TrendingUp, Package, Receipt, AtSign } from 'lucide-react';
import { apiLogin, apiRegister, saveToken } from '@/services/auth/authService';
import { useIsMobile } from '@/hooks/useMobile';
import LakuLogo from '@/components/branding/LakuLogo';
import LakuWordmark from '@/components/branding/LakuWordmark';
import LoginMascot from '@/components/branding/LoginMascot';

// Sorotan fitur utama pada panel branding halaman login.
const loginHighlights = [
  { icon: TrendingUp, title: 'Pantau Laba', desc: 'Lihat untung harian secara real-time' },
  { icon: Package, title: 'Kelola Stok', desc: 'Peringatan otomatis saat stok menipis' },
  { icon: Receipt, title: 'Catat Transaksi', desc: 'Struk & laporan tercatat otomatis' },
];

export default function Login({ initialMode = 'login' }: { initialMode?: 'login' | 'register' } = {}) {
  const { dispatch, showToast, login, completeOnboarding, restartOnboarding } = useApp();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [identifier, setIdentifier] = useState(''); // email (login & register)
  const [username, setUsername] = useState(''); // username khusus register
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
      setIdentifier(''); setUsername(''); setPassword(''); setName(''); setConfirmPassword('');
      setShowPass(false); setShowConfirmPass(false);
      setAnimating(false);
    }, 180);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) { setError('Nama toko harus diisi'); return; }
      if (!username.trim()) { setError('Username harus diisi'); return; }
      if (!/^[a-zA-Z0-9._]{3,20}$/.test(username.trim())) {
        setError('Username 3-20 karakter (huruf, angka, titik, underscore)'); return;
      }
      if (!identifier.trim()) { setError('Email harus diisi'); return; }
      // Daftar baru mendukung email (backend belum menerima nomor HP, lihat docs/API.md §1).
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
        setError('Masukkan email yang valid'); return;
      }
      if (!password.trim()) { setError('Password harus diisi'); return; }
      if (password.length < 8) { setError('Password minimal 8 karakter'); return; }
      if (password !== confirmPassword) { setError('Password tidak cocok'); return; }
    } else {
      if (!identifier.trim()) { setError('Email harus diisi'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
        setError('Masukkan email yang valid'); return;
      }
      if (!password.trim()) { setError('Password harus diisi'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        // Daftar akun saja — TIDAK langsung masuk aplikasi. User baru wajib
        // login dulu (validasi), baru melewati langkah pengenalan.
        // Alur: buat akun → kembali ke login → langkah-langkah → masuk aplikasi.
        const regEmail = identifier.trim().toLowerCase();
        await apiRegister(name.trim(), regEmail, password);
        // Simpan username & nama toko di localStorage supaya onboarding bisa pra-isi
        try {
          localStorage.setItem('pendingUsername', username.trim());
          localStorage.setItem('pendingStoreName', name.trim());
        } catch { /* abaikan */ }
        setMode('login');
        setName(''); setUsername(''); setPassword(''); setConfirmPassword('');
        setShowPass(false); setShowConfirmPass(false);
        setIdentifier(regEmail); // identifier diisi otomatis agar tinggal masukkan password
        showToast('Akun berhasil dibuat! Silakan login untuk melanjutkan.');
        return;
      }

      const res = await apiLogin(identifier.trim(), password);
      saveToken(res.token);
      // User baru → tampilkan langkah pengenalan dulu; user lama → langsung masuk.
      const { onboardingCompleted, ...user } = res.user;
      if (onboardingCompleted) completeOnboarding(); else restartOnboarding();
      login(user);
      dispatch({ type: 'SET_TAB', payload: 'dashboard' });
      showToast('Login berhasil!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  const inputCls = (field: string, compact = false) =>
    `flex items-center gap-2.5 ${compact ? 'px-3 py-2' : 'px-4 py-3'} rounded-xl border-2 transition-all duration-200 ${focusedField === field
      ? 'border-[#1A56DB] bg-[#e8effe]'
      : 'border-[#EEF0F6] bg-[#F8F9FC] hover:border-[#d4e4fb]'
    }`;

  // Maskot menutup mata saat mengetik password (field password/konfirmasi fokus
  // & disembunyikan), dan mengintip saat password ditampilkan.
  const pwFieldActive = focusedField === 'password' || focusedField === 'confirm';
  const pwShown = (focusedField === 'password' && showPass) || (focusedField === 'confirm' && showConfirmPass);
  const mascotCovering = pwFieldActive && !pwShown;
  const mascotPeeking = pwFieldActive && pwShown;

  const renderForm = (compact = false) => (
    <div
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Maskot interaktif */}
      <div className="flex justify-center mb-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#1A56DB]/12 blur-xl scale-90" aria-hidden="true" />
          <div className="relative">
            <LoginMascot
              covering={mascotCovering}
              peeking={mascotPeeking}
              error={!!error}
              loading={loading}
              size={compact ? 68 : 84}
            />
          </div>
        </div>
      </div>

      <div className={`text-center ${compact ? 'mb-3' : 'mb-6'}`}>
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
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#3D4566]">Nama Toko</label>
              <div className={inputCls('name', compact)}>
                <User size={compact ? 15 : 17} className={focusedField === 'name' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
                <input
                  type="text" value={name}
                  onChange={e => { setName(e.target.value); setError(null); }}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
                  placeholder="Nama toko"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#3D4566]">Username</label>
              <div className={inputCls('username', compact)}>
                <AtSign size={compact ? 15 : 17} className={focusedField === 'username' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
                <input
                  type="text" value={username}
                  onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '')); setError(null); }}
                  onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                  className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
                  placeholder="username"
                />
              </div>
            </div>
          </>
        )}

        {/* Email — dipakai untuk login & register. */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#3D4566]">Email</label>
          <div className={inputCls('identifier', compact)}>
            <Mail size={compact ? 15 : 17} className={focusedField === 'identifier' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
            <input
              type="email" value={identifier}
              onChange={e => { setIdentifier(e.target.value); setError(null); }}
              onFocus={() => setFocusedField('identifier')} onBlur={() => setFocusedField(null)}
              className={`flex-1 bg-transparent font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none ${compact ? 'text-xs' : 'text-sm'}`}
              placeholder="nama@email.com"
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
              placeholder={mode === 'register' ? 'Min. 8 karakter' : 'Masukkan password'}
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
        <div className="fixed top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/5 pointer-events-none animate-float" />
        <div className="fixed bottom-[-40px] left-[-40px] w-36 h-36 rounded-full bg-white/5 pointer-events-none animate-float-slow" />

        <div className="w-full max-w-[340px] relative z-10 py-7">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-5 animate-fade-up animate-delay-1">
            <LakuLogo size={38} className="shrink-0" style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.25))' }} />
            <div>
              <div className="font-extrabold text-lg tracking-tight leading-none"><LakuWordmark aku="#FFFFFF" /></div>
              <div className="text-white/55 text-[10px] font-medium mt-0.5">Warung digital untuk UMKM</div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-up animate-delay-2 transition-all duration-300 ease-out">
            <div className="h-1 bg-gradient-to-r from-[#1A56DB] via-[#3b82f6] to-[#1340b8]" />
            <div className="p-5">
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
        {/* Geometric shapes — mengambang halus (levitate) */}
        <div className="absolute top-[-160px] right-[-160px] w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none animate-float-slow" />
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full border border-white/5 pointer-events-none animate-float" />
        <div className="absolute bottom-[-140px] left-[-140px] w-[420px] h-[420px] rounded-full border border-white/5 pointer-events-none animate-float-fast" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[240px] h-[240px] rounded-full border border-white/5 pointer-events-none animate-float" />
        {/* Subtle glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#1A56DB]/20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center px-12">
          <LakuLogo size={84} className="mb-6" style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.3))' }} />
          <div className="font-extrabold tracking-tight text-4xl mb-2"><LakuWordmark aku="#FFFFFF" /></div>
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
            <LakuLogo size={30} />
            <div className="text-sm font-extrabold tracking-tight"><LakuWordmark aku="#1A1F3A" /></div>
          </div>

          {renderForm(false)}

          <p className="text-center text-[#DDE1EF] text-[11px] mt-8">© 2026 Laku</p>
        </div>
      </div>
    </div>
  );
}
