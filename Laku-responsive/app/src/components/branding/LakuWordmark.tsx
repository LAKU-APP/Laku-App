// Wordmark "LAKU": huruf "L" biru (#1E50DC) + "AKU" (default putih), font Sora.
// Mewarisi ukuran & letter-spacing dari elemen induk; cukup atur warna "AKU"
// sesuai latar (putih untuk latar gelap, gelap untuk latar terang).
interface LakuWordmarkProps {
  aku?: string;
  className?: string;
}

export default function LakuWordmark({ aku = '#FFFFFF', className = '' }: LakuWordmarkProps) {
  return (
    <span className={className} style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
      <span style={{ color: '#1E50DC' }}>L</span>
      <span style={{ color: aku }}>AKU</span>
    </span>
  );
}
