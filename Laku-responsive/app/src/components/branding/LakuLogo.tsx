import { useId } from 'react';

/**
 * LakuLogo — lambang khas aplikasi LAKU: kotak gradien biru dengan ikon
 * "L + chart" putih. Self-contained (punya latar sendiri), jadi tidak perlu
 * dibungkus kotak berwarna lagi. Sumber desain: src/assets/logos/laku.svg.
 */
interface LakuLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function LakuLogo({ size = 40, className = '', style }: LakuLogoProps) {
  const gid = useId(); // id gradien unik per instance (hindari duplikat id)
  return (
    <svg
      width={size}
      height={size}
      viewBox="20 12 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label="LAKU"
    >
      <rect x="20" y="12" width="96" height="96" rx="22" fill={`url(#${gid})`} />
      <path d="M59.9399 43.88H53.7399C52.7126 43.88 51.8799 44.7128 51.8799 45.74V76.74C51.8799 77.7673 52.7126 78.6 53.7399 78.6H59.9399C60.9671 78.6 61.7999 77.7673 61.7999 76.74V45.74C61.7999 44.7128 60.9671 43.88 59.9399 43.88Z" fill="white" />
      <path d="M84.7399 68.6801H53.7399C52.7126 68.6801 51.8799 69.5128 51.8799 70.5401V76.7401C51.8799 77.7673 52.7126 78.6001 53.7399 78.6001H84.7399C85.7671 78.6001 86.5999 77.7673 86.5999 76.7401V70.5401C86.5999 69.5128 85.7671 68.6801 84.7399 68.6801Z" fill="white" />
      <path d="M75.1298 56.9H65.8298C64.9737 56.9 64.2798 57.594 64.2798 58.45V66.51C64.2798 67.3661 64.9737 68.06 65.8298 68.06H75.1298C75.9858 68.06 76.6798 67.3661 76.6798 66.51V58.45C76.6798 57.594 75.9858 56.9 75.1298 56.9Z" fill="white" />
      <path d="M75.1298 44.5H65.8298C64.9737 44.5 64.2798 45.194 64.2798 46.05V54.11C64.2798 54.966 64.9737 55.66 65.8298 55.66H75.1298C75.9858 55.66 76.6798 54.966 76.6798 54.11V46.05C76.6798 45.194 75.9858 44.5 75.1298 44.5Z" fill="#9DB8FF" />
      <defs>
        <linearGradient id={gid} x1="35.2154" y1="3.21539" x2="100.785" y2="116.785" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A60F0" />
          <stop offset="1" stopColor="#1742C8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Alias historis — ikon kini sudah punya kotaknya sendiri.
export function LakuLogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <LakuLogo size={size} className={className} />;
}
