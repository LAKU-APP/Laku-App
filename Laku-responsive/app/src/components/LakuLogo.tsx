/**
 * LakuLogo — Custom SVG logo for LAKU app.
 * A stylized shopping bag with a checkmark, representing store/retail management.
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
    >
      {/* Shopping bag body */}
      <path
        d="M6 10C6 8.89543 6.89543 8 8 8H24C25.1046 8 26 8.89543 26 10V25C26 26.6569 24.6569 28 23 28H9C7.34315 28 6 26.6569 6 25V10Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Bag handle */}
      <path
        d="M12 8V7C12 4.79086 13.7909 3 16 3C18.2091 3 20 4.79086 20 7V8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Checkmark inside bag */}
      <path
        d="M12 17.5L15 20.5L21 14.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * LakuLogoFull — Logo + text for branding areas.
 */
export function LakuLogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}>
      <LakuLogo size={size * 0.6} className="text-white" />
    </div>
  );
}
