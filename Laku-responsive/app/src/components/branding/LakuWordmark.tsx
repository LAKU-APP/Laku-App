// Wordmark "Laku": huruf "L" biru (#1E50DC) + "aku" (default putih), font Sora.
// Sengaja TITLE CASE (bukan "LAKU" uppercase) supaya "L" tidak menyatu/melebur
// dengan "AKU" — capital L jadi penanda awal kata, sisanya huruf kecil.
// `textTransform: none` memaksa kapitalisasi ini walau induk memakai `uppercase`.
// Mewarisi ukuran & letter-spacing dari elemen induk; cukup atur warna "aku"
// sesuai latar (putih untuk latar gelap, gelap untuk latar terang).
interface LakuWordmarkProps {
  aku?: string;
  className?: string;
}

export default function LakuWordmark({ aku = '#FFFFFF', className = '' }: LakuWordmarkProps) {
  return (
    <span
      className={className}
      style={{ fontFamily: "'Sora', system-ui, sans-serif", textTransform: 'none' }}
    >
      <span style={{ color: '#1E50DC' }}>L</span>
      <span style={{ color: aku }}>aku</span>
    </span>
  );
}
