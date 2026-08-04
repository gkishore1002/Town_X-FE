import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const SIZE_PX = {
  xs: 20,
  sm: 32,
  md: 48,
  lg: 64,
} as const;

export type TownLoaderSize = keyof typeof SIZE_PX;

type TownLoaderProps = {
  size?: TownLoaderSize;
  label?: string;
  className?: string;
  /** Centers loader in a full viewport shell */
  fullScreen?: boolean;
  /** Minimum height wrapper for section loads; omit for inline use */
  minHeight?: string;
};

function RoofMark({ px }: { px: number }) {
  const icon = Math.max(10, px * 0.38);
  return (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 11L12 4l9 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 11v8h12v-8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx="12" cy="15" r="1.25" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Branded orbital loader — roof core + exchange rings. */
export function TownLoader({
  size = "md",
  label,
  className,
  fullScreen = false,
  minHeight,
}: TownLoaderProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const px = SIZE_PX[size];
  const showLabel = Boolean(label) && size !== "xs";

  const loader = (
    <div
      className={cn("relative inline-flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <div className="relative" style={{ width: px, height: px }}>
        {/* Soft glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-500/15 blur-md"
          animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer exchange ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-brand-400/50"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle ring + orbiting dots */}
        <motion.div
          className="absolute inset-[12%] rounded-full border border-brand-500/25"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
        >
          {[0, 120, 240].map((deg) => (
            <motion.span
              key={deg}
              className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(37,99,235,0.8)]"
              style={{ transformOrigin: `50% ${px * 0.44}px` }}
              initial={{ rotate: deg }}
              animate={reduceMotion ? undefined : { rotate: deg + 360 }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </motion.div>

        {/* Inner pulse ring */}
        <motion.div
          className="absolute inset-[28%] rounded-full border-2 border-brand-500/40"
          animate={reduceMotion ? undefined : { scale: [0.92, 1.04, 0.92], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Roof core */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-brand-600"
          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          <RoofMark px={px} />
        </motion.div>

        {/* Crossing exchange arcs */}
        {!reduceMotion && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-[18%] rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(37,99,235,0.35) 40deg, transparent 80deg)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="pointer-events-none absolute inset-[18%] rounded-full"
              style={{
                background:
                  "conic-gradient(from 180deg, transparent 0deg, rgba(59,130,246,0.28) 40deg, transparent 80deg)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 4.1, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}
      </div>

      {showLabel && (
        <motion.p
          className="text-xs font-medium tracking-wide text-muted-foreground"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {label}
          <motion.span
            className="inline-block"
            animate={reduceMotion ? undefined : { opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            …
          </motion.span>
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">{loader}</div>
    );
  }

  if (minHeight) {
    return (
      <div className="flex w-full items-center justify-center" style={{ minHeight }}>
        {loader}
      </div>
    );
  }

  return loader;
}

export default TownLoader;
