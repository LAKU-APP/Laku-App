/**
 * LakuLogo — lambang khas aplikasi LAKU.
 *
 * Sebuah tas belanja dengan garis tren naik di dalamnya: melambangkan ritel
 * yang "laku"/laris. Memakai `currentColor` agar warnanya mengikuti teks induk
 * (mis. putih di atas latar gradien biru), dengan sorotan tipis untuk kedalaman.
 */
interface LakuLogoProps {
  size?: number;
  className?: string;
}

export default function LakuLogo({ size = 24, className = '' }: LakuLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="LAKU"
    >
      {/* Pegangan tas */}
      <path
        d="M11.5 10V7.5C11.5 5.01472 13.5147 3 16 3C18.4853 3 20.5 5.01472 20.5 7.5V10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Badan tas — sudut membulat lembut */}
      <path
        d="M6.5 12C6.5 10.6193 7.61929 9.5 9 9.5H23C24.3807 9.5 25.5 10.6193 25.5 12V23.5C25.5 25.7091 23.7091 27.5 21.5 27.5H10.5C8.29086 27.5 6.5 25.7091 6.5 23.5V12Z"
        fill="currentColor"
      />
      {/* Sorotan tipis di tepi atas badan tas untuk kesan dimensi */}
      <path
        d="M9 9.5H23C24.3807 9.5 25.5 10.6193 25.5 12V12.5H6.5V12C6.5 10.6193 7.61929 9.5 9 9.5Z"
        fill="white"
        opacity="0.22"
      />
      {/* Garis tren naik (pertumbuhan penjualan) */}
      <path
        d="M11 21L14.5 17.5L17.5 20L21 15.5"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Kepala panah di ujung garis tren */}
      <path
        d="M18.4 15.5H21V18.1"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * LakuLogoMark — lambang di dalam kotak gradien, untuk area branding.
 */
export function LakuLogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}>
      <LakuLogo size={size * 0.6} className="text-white" />
    </div>
  );
}
