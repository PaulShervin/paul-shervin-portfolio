import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export type Medal = 'gold' | 'silver' | 'bronze';

const PALETTE: Record<Medal, { light: string; mid: string; dark: string; text: string }> = {
  gold: { light: '#fbe9a8', mid: '#e2b440', dark: '#a8761a', text: '#5b3d07' },
  silver: { light: '#f3f6f8', mid: '#b9c3cb', dark: '#7f8b95', text: '#3d4750' },
  bronze: { light: '#f0c9a0', mid: '#c98a4e', dark: '#85511f', text: '#4a2a0b' },
};

/** An award rosette with two ribbon tails, like the ones pinned to a prize entry. */
export const Rosette = ({ medal, big, small, className = '' }: { medal: Medal; big: string; small: string; className?: string }) => {
  const c = PALETTE[medal];
  const id = `rosette-${medal}`;
  const scallops = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { x: 40 + Math.cos(a) * 27, y: 40 + Math.sin(a) * 27 };
  });
  const isGold = medal === 'gold';

  return (
    <motion.span
      className={`pointer-events-none absolute z-30 block drop-shadow-[0_10px_8px_rgba(55,32,12,.35)] ${className}`}
      initial={{ rotate: 8 }}
      animate={isGold ? { rotate: [8, 13, 8] } : { rotate: 8 }}
      transition={isGold ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{ transformOrigin: '50% 10%' }}
      aria-hidden
    >
      <svg viewBox="0 0 80 104" className="h-full w-full">
        <defs>
          <radialGradient id={id} cx="35%" cy="30%" r="85%">
            <stop offset="0" stopColor={c.light} />
            <stop offset="0.55" stopColor={c.mid} />
            <stop offset="1" stopColor={c.dark} />
          </radialGradient>
        </defs>
        {/* ribbon tails */}
        <path d="M24 62 L14 102 L28 92 L36 103 L42 66 Z" fill="#176B4D" />
        <path d="M56 62 L66 102 L52 92 L44 103 L38 66 Z" fill="#0f4a35" />
        {/* scalloped rosette */}
        {scallops.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="7" fill={`url(#${id})`} />
        ))}
        <circle cx="40" cy="40" r="28" fill={`url(#${id})`} />
        <circle cx="40" cy="40" r="21" fill="none" stroke={c.dark} strokeOpacity="0.55" strokeWidth="1.4" />
        <circle cx="40" cy="40" r="23.5" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />
        <text
          x="40"
          y="50"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill={c.text}
          style={{ fontFamily: '"Cormorant Garamond", serif', fontVariantNumeric: 'lining-nums' }}
        >
          {big}
          <tspan fontSize="12" fontStyle="italic" dy="-11" dx="1">
            {small}
          </tspan>
        </text>
      </svg>
      {isGold && (
        <>
          <motion.span
            className="absolute -left-3 top-1 text-[#e2b440]"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.15, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.span>
          <motion.span
            className="absolute -right-2 top-9 text-[#f3d27a]"
            animate={{ opacity: [1, 0.2, 1], scale: [1.1, 0.7, 1.1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.span>
        </>
      )}
    </motion.span>
  );
};
