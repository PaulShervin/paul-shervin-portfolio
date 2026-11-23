import type { CSSProperties } from 'react';

/** Soft cork: warm base + fine noise + a few darker flecks. Pure CSS / inline SVG, no image files. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .36 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const corkStyle: CSSProperties = {
  backgroundColor: '#d5b17f',
  backgroundImage: [
    'radial-gradient(circle at 18% 22%, rgba(120,78,36,.28) 0 2px, transparent 3px)',
    'radial-gradient(circle at 72% 64%, rgba(120,78,36,.24) 0 2.5px, transparent 3.5px)',
    'radial-gradient(circle at 44% 88%, rgba(255,240,210,.35) 0 2px, transparent 3px)',
    'radial-gradient(circle at 88% 14%, rgba(255,240,210,.3) 0 2px, transparent 3px)',
    NOISE,
  ].join(','),
  backgroundSize: '90px 90px, 130px 130px, 70px 70px, 110px 110px, 180px 180px',
  boxShadow: 'inset 0 0 70px rgba(92,58,24,.38), inset 0 2px 6px rgba(70,42,16,.35)',
};

export const frameStyle: CSSProperties = {
  background: 'linear-gradient(145deg, #a8794d 0%, #8a5d37 45%, #6f4727 100%)',
  boxShadow: '0 40px 70px -34px rgba(60,38,18,.65), 0 10px 24px -12px rgba(60,38,18,.45), inset 0 1px 0 rgba(255,225,190,.35)',
};

export const PIN_COLORS = ['#176B4D', '#C2694A', '#4B8B70', '#20292B'] as const;

/** Round push pin with a soft cast shadow. */
export const Pin = ({ color, className = '' }: { color: string; className?: string }) => (
  <span className={`pointer-events-none absolute z-20 block h-7 w-7 ${className}`} aria-hidden>
    <span className="absolute left-[7px] top-[14px] h-3 w-6 rotate-[28deg] rounded-full bg-black/25 blur-[3px]" />
    <span
      className="absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,.75) 0 12%, ${color} 38%, rgba(0,0,0,.35) 120%)`,
        boxShadow: `0 2px 0 rgba(0,0,0,.18), inset 0 -3px 5px rgba(0,0,0,.28)`,
      }}
    />
  </span>
);

/** Translucent washi tape with torn ends. */
export const Tape = ({ className = '', tint = 'rgba(221,243,232,.82)' }: { className?: string; tint?: string }) => (
  <span
    className={`pointer-events-none absolute z-20 block h-7 w-24 ${className}`}
    style={{
      background: `linear-gradient(180deg, rgba(255,255,255,.35), transparent 40%), ${tint}`,
      clipPath:
        'polygon(0 8%, 4% 0, 8% 10%, 12% 0, 100% 0, 96% 12%, 100% 24%, 96% 36%, 100% 48%, 96% 60%, 100% 72%, 96% 84%, 100% 100%, 12% 100%, 8% 90%, 4% 100%, 0 92%, 4% 80%, 0 68%, 4% 56%, 0 44%, 4% 32%, 0 20%)',
      boxShadow: '0 2px 4px rgba(0,0,0,.18)',
      backdropFilter: 'blur(1px)',
    }}
    aria-hidden
  />
);
