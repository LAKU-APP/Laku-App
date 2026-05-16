import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, Zap, AlertCircle, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default function Login() {
  const { dispatch, showToast, login } = useApp();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'register') {
      if (!name.trim()) { setError('Nama harus diisi'); return; }
      if (!email.trim()) { setError('Email harus diisi'); return; }
      if (!password.trim()) { setError('Password harus diisi'); return; }
      if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
      if (password !== confirmPassword) { setError('Password tidak cocok'); return; }
      setLoading(true);
      setTimeout(() => {
        const user = { id: generateId(), name: name.trim(), email };
        login(user);
        dispatch({ type: 'SET_TAB', payload: 'dashboard' });
        showToast('Akun berhasil dibuat!');
        setLoading(false);
      }, 800);
    } else {
      if (!email.trim()) { setError('Email harus diisi'); return; }
      if (!password.trim()) { setError('Password harus diisi'); return; }
      setLoading(true);
      setTimeout(() => {
        const user = { id: generateId(), name: email.split('@')[0], email };
        login(user);
        dispatch({ type: 'SET_TAB', payload: 'dashboard' });
        showToast('Login berhasil!');
        setLoading(false);
      }, 600);
    }
  };

  const inputCls = (field: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
      focusedField === field
        ? 'border-[#1A56DB] bg-[#e8effe]'
        : 'border-[#EEF0F6] bg-[#F8F9FC] hover:border-[#d4e4fb]'
    }`;

  return (
    <div
      className="w-full flex items-center justify-center p-4 overflow-y-auto"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #0f1f5c 0%, #1A56DB 55%, #1340b8 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-white/5 pointer-events-none" />
      <div className="fixed bottom-[-80px] left-[-80px] w-[280px] h-[280px] rounded-full bg-white/5 pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 animate-fade-up animate-delay-1">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Zap size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <div className="text-white font-extrabold text-2xl tracking-tight">LAKU</div>
            <div className="text-white/60 text-xs font-medium">Sistem Manajemen Toko</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 mb-5 animate-fade-up animate-delay-2">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
              mode === 'login' ? 'bg-white text-[#1A56DB] shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
              mode === 'register' ? 'bg-white text-[#1A56DB] shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Form card */}
        <div
          className="bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-up animate-delay-3"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(10px) scale(0.98)' : 'translateY(0) scale(1)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          <div className="h-1 bg-gradient-to-r from-[#1A56DB] to-[#F97316]" />
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-[#1A1F3A]">
                {mode === 'login' ? 'Selamat Datang 👋' : 'Buat Akun Baru'}
              </h2>
              <p className="text-sm text-[#9BA3BC] mt-1">
                {mode === 'login' ? 'Masuk untuk mengelola toko Anda' : 'Daftar gratis, mulai kelola toko'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex gap-2 items-start">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#3D4566]">Nama Toko / Nama Anda</label>
                  <div className={inputCls('name')}>
                    <User size={17} className={focusedField === 'name' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
                    <input
                      type="text" value={name}
                      onChange={e => { setName(e.target.value); setError(null); }}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                      className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none"
                      placeholder="Warung Bu Sri"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#3D4566]">Email</label>
                <div className={inputCls('email')}>
                  <Mail size={17} className={focusedField === 'email' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
                  <input
                    type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError(null); }}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none"
                    placeholder="nama@domain.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#3D4566]">Password</label>
                <div className={inputCls('password')}>
                  <Lock size={17} className={focusedField === 'password' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(null); }}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none"
                    placeholder={mode === 'register' ? 'Min. 6 karakter' : 'Masukkan password'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#9BA3BC] hover:text-[#1A56DB] transition-colors shrink-0">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#3D4566]">Konfirmasi Password</label>
                  <div className={inputCls('confirm')}>
                    <Lock size={17} className={focusedField === 'confirm' ? 'text-[#1A56DB]' : 'text-[#9BA3BC]'} />
                    <input
                      type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError(null); }}
                      onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                      className="flex-1 bg-transparent text-sm font-medium text-[#1A1F3A] placeholder-[#DDE1EF] outline-none"
                      placeholder="Ulangi password"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-[#9BA3BC] hover:text-[#1A56DB] transition-colors shrink-0">
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full mt-1 h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1A56DB, #1340b8)', boxShadow: '0 4px 20px rgba(26,79,214,0.4)' }}
              >
                {loading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>{mode === 'login' ? 'Masuk' : 'Buat Akun'}<ArrowRight size={16} /></>
                }
              </button>

              {mode === 'login' && (
                <div className="p-3 rounded-xl bg-[#e8effe] border border-[#d4e4fb]">
                  <p className="text-xs text-[#1A56DB] font-medium text-center">
                    💡 Demo: gunakan email & password apapun
                  </p>
                </div>
              )}
            </form>

            <p className="text-center text-xs text-[#9BA3BC] mt-5">
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-[#1A56DB] font-bold hover:underline">
                {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Laku © 2026 • Warung Digital Indonesia</p>
      </div>
    </div>
  );
}
