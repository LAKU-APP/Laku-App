import LoginPage from './LoginPage';

// Layar auth dengan mode awal "Buat Akun". App saat ini memakai satu layar auth
// dengan toggle (lihat LoginPage), jadi komponen ini menyediakan entry terpisah
// untuk rute /register bila nanti app memakai URL routing.
export default function RegisterPage() {
  return <LoginPage initialMode="register" />;
}
