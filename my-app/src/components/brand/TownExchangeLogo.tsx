import { useId } from "react";
import { cn } from "@/lib/utils";

export const APP_NAME = "Town Exchange";

type TownExchangeLogoProps = {
  size?: number;
  className?: string;
};

/**
 * Town Exchange mark — roofline + twin towers + exchange arc.
 * Scales cleanly from favicon to header sizes.
 */
export function TownExchangeLogo({ size = 40, className }: TownExchangeLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `te-grad-${uid}`;
  const glowId = `te-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={APP_NAME}
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <radialGradient
          id={glowId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(24 18) rotate(90) scale(22)"
        >
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Badge */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradId})`} />
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${glowId})`} />

      {/* Exchange orbit */}
      <path
        d="M34 16.5C31.2 12.8 27 10.5 22.2 10.5 14.8 10.5 8.8 16.5 8.8 23.9"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 31.5C16.8 35.2 21 37.5 25.8 37.5 33.2 37.5 39.2 31.5 39.2 24.1"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M33.5 14.5L34.8 17.2L32.1 18.5"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 33.5L13.2 30.8L15.9 29.5"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Roofline */}
      <path
        d="M13.5 24.5L24 15.5L34.5 24.5"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Twin towers — direct owner ↔ buyer exchange */}
      <rect x="15.5" y="24.5" width="7" height="13" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="25.5" y="24.5" width="7" height="13" rx="1.5" fill="white" fillOpacity="0.95" />

      {/* Doorways */}
      <rect x="18" y="32" width="2.5" height="5.5" rx="0.75" fill="#2563EB" fillOpacity="0.85" />
      <rect x="27.5" y="32" width="2.5" height="5.5" rx="0.75" fill="#2563EB" fillOpacity="0.85" />

      {/* Center bridge — the "exchange" */}
      <path
        d="M22.5 28.5H25.5"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="28.5" r="1.25" fill="white" />
    </svg>
  );
}

type TownExchangeBrandProps = {
  logoSize?: number;
  tagline?: string;
  showTagline?: boolean;
  className?: string;
  wordmarkClassName?: string;
  onClick?: () => void;
  asButton?: boolean;
};

export function TownExchangeBrand({
  logoSize = 36,
  tagline,
  showTagline = false,
  className,
  wordmarkClassName,
  onClick,
  asButton = false,
}: TownExchangeBrandProps) {
  const content = (
    <>
      <TownExchangeLogo size={logoSize} className="shadow-soft-sm" />
      <div className="min-w-0 flex flex-col text-left">
        <span
          className={cn(
            "font-display text-base font-semibold text-gray-900 leading-tight tracking-wide",
            wordmarkClassName
          )}
        >
          {APP_NAME}
        </span>
        {showTagline && tagline && (
          <span className="text-xs text-gray-500 leading-tight hidden sm:block">{tagline}</span>
        )}
      </div>
    </>
  );

  const sharedClass = cn("flex items-center gap-2.5 hover:opacity-90 transition-opacity", className);

  if (asButton || onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClass}>
        {content}
      </button>
    );
  }

  return <div className={sharedClass}>{content}</div>;
}

export default TownExchangeLogo;
