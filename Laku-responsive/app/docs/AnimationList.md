# 🌟 Panduan Lengkap Animasi & UI Interaktif LAKU App

Dokumen ini berisi kumpulan ide fitur *front-end* kreatif, panduan letak animasi *keyframe* untuk *micro-interactions*, serta referensi teknis implementasi **Maskot Login Interaktif**. 

Gunakan dokumen ini sebagai referensi (konteks) di Claude 3 Opus untuk mengembangkan komponen UI kamu.

---

## Bagian 1: Ide Fitur Front-End Kreatif (Tanpa Scroll)

**1. "Smart Tips" Marquee Banner (Banner Berjalan)**
- **Lokasi:** Paling atas halaman `Dashboard` atau di bawah `TopNav`.
- **Konsep:** Banner horizontal tipis berisi tips penggunaan atau pengumuman.
- **Animasi:** Animasi CSS `translate-x` dari `100%` ke `-100%` yang *looping infinite*.

**2. Gamifikasi: Konfeti Target Harian**
- **Lokasi:** `Dashboard`.
- **Konsep:** Jika omzet harian menyentuh "Target Omzet" (dari Pengaturan), muncul ledakan konfeti di layar selama 3 detik.
- **Efek:** Sangat memotivasi *user* (UMKM) untuk terus berjualan.

**3. Skeleton Shimmer (Loading State)**
- **Lokasi:** Daftar Produk (`ProductsPage`) & Riwayat Transaksi (`RecordsPage`).
- **Konsep:** Saat *fetch* data, tampilkan bentuk kerangka elemen dengan animasi gradien terang yang melintang dari kiri ke kanan.
- **Efek:** Memberi kesan aplikasi sedang berpikir dengan sangat cepat.

---

## Bagian 2: Titik Lokasi Wajib untuk Animasi Keyframe

**1. Ikon Lonceng/Keranjang Bergoyang (*The Jiggle*)**
- **Lokasi:** Ikon Lonceng di `TopNav.tsx` atau Keranjang di `POS`.
- **Keyframe:** Rotasi cepat antara `15deg` dan `-15deg`.
- **Kapan Aktif:** Otomatis bergoyang 2 detik tiap kali ada notifikasi baru masuk atau barang ditambahkan ke keranjang.

**2. Tombol Checkout Berdetak (*Breathing / Pulse*)**
- **Lokasi:** Tombol utama di halaman kasir (`POS`).
- **Keyframe:** Memperbesar ukuran tombol (`scale: 1.05`) dan memancarkan efek *glow* di luar tombol (`box-shadow`), lalu kembali normal perlahan.
- **Kapan Aktif:** Saat barang sudah di keranjang dan siap dibayar.

**3. Ornamen Latar Mengambang (*Levitate*)**
- **Lokasi:** Elemen dekoratif latar belakang di `LoginPage.tsx`.
- **Keyframe:** `translateY(0px)` ke `translateY(-20px)` dan kembali secara mulus dalam siklus 6 detik.
- **Kapan Aktif:** Selalu aktif di latar belakang agar halaman tidak terasa kaku.

**4. Menggambar Centang (*SVG Draw*)**
- **Lokasi:** Pop-up sukses di `POS` atau layar sukses `Onboarding`.
- **Keyframe:** Manipulasi properti `stroke-dasharray` dan `stroke-dashoffset`. Ikon tidak langsung muncul, melainkan seperti sedang digambar tinta.

### Contoh CSS Dasar untuk Keyframes:
```css
/* Ikon Bergoyang */
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
.animate-wiggle { animation: wiggle 0.3s ease-in-out infinite; }

/* Objek Mengambang (LoginPage) */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

/* Tombol Berdetak (POS Checkout) */
@keyframes pulse-soft {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(26, 86, 219, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(26, 86, 219, 0); }
}
.animate-pulse-soft { animation: pulse-soft 2s infinite; }
```

---

## Bagian 3: Panduan Implementasi Maskot Login Interaktif

Berikut adalah 3 metode untuk membuat maskot login (seperti boneka yang menutup mata saat mengetik password) di React/Tailwind.

### Konsep State Dasar (di `LoginPage.tsx`)
```tsx
const [isEmailFocused, setIsEmailFocused] = useState(false);
const [isPasswordFocused, setIsPasswordFocused] = useState(false);
const [showPassword, setShowPassword] = useState(false);
```

### Metode 1: Pure SVG + CSS Transforms (Paling Ringan & Cepat)
Tidak perlu *library* eksternal. Hanya menggunakan utility class Tailwind.

```tsx
import React from 'react';

export const MascotSVG = ({ isPasswordFocused, showPassword }) => {
  return (
    <div className="relative w-32 h-32 mx-auto overflow-hidden bg-blue-100 rounded-full">
      {/* Badan */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-blue-500 rounded-lg"></div>
      </div>

      {/* Mata */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4">
        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-black rounded-full" />
        </div>
        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-black rounded-full" />
        </div>
      </div>

      {/* Tangan penutup mata */}
      <div 
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-6 transition-transform duration-300 ease-out ${
          isPasswordFocused && !showPassword ? '-translate-y-12' : 'translate-y-10'
        } ${isPasswordFocused && showPassword ? '-translate-y-8 translate-x-4' : ''}`}
      >
        <div className="w-6 h-8 bg-blue-400 rounded-t-full" />
        <div className="w-6 h-8 bg-blue-400 rounded-t-full" />
      </div>
    </div>
  );
};
```

### Metode 2: Lottie Animation (Standar Industri)
Menggunakan file JSON animasi dari Adobe After Effects.
**Setup:** `npm install lottie-react`

```tsx
import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import mascotAnimation from '@/assets/animations/mascot.json';

export const MascotLottie = ({ isPasswordFocused, showPassword }) => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (!lottieRef.current) return;
    if (isPasswordFocused && !showPassword) {
      lottieRef.current.playSegments([30, 60], true); // Tutup Mata
    } else if (isPasswordFocused && showPassword) {
      lottieRef.current.playSegments([60, 90], true); // Ngintip
    } else {
      lottieRef.current.playSegments([0, 30], true); // Idle
    }
  }, [isPasswordFocused, showPassword]);

  return (
    <div className="w-48 h-48 mx-auto">
      <Lottie lottieRef={lottieRef} animationData={mascotAnimation} loop={false} autoplay={false} />
    </div>
  );
};
```

### Metode 3: Rive (Paling Modern, Interaktif, & Ringan)
Rive menggunakan *State Machine* (mendengarkan perubahan nilai variabel dari React) dengan performa setingkat game *engine*.
**Setup:** `npm install @rive-app/react-canvas`

```tsx
import React, { useEffect } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

export const MascotRive = ({ isEmailFocused, isPasswordFocused, showPassword }) => {
  const { rive, RiveComponent } = useRive({
    src: '/mascot.riv',
    stateMachines: 'Login Machine',
    autoplay: true,
  });

  const isCheckingInput = useStateMachineInput(rive, 'Login Machine', 'isChecking');
  const isHandsUpInput = useStateMachineInput(rive, 'Login Machine', 'isHandsUp');
  const isPeekingInput = useStateMachineInput(rive, 'Login Machine', 'isPeeking');

  useEffect(() => {
    if (isCheckingInput) isCheckingInput.value = isEmailFocused;
    if (isHandsUpInput) isHandsUpInput.value = isPasswordFocused && !showPassword;
    if (isPeekingInput) isPeekingInput.value = isPasswordFocused && showPassword;
  }, [isEmailFocused, isPasswordFocused, showPassword, isCheckingInput, isHandsUpInput, isPeekingInput]);

  return (
    <div className="w-48 h-48 mx-auto">
      <RiveComponent />
    </div>
  );
};
```
