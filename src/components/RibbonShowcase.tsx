import { useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Palette from the portfolio brand
const FOREST = '#176B4D';
const MINT = '#DDF3E8';
const OFF_WHITE = '#F7F7F0';
const CHARCOAL = '#20292B';

const LIGHT_ITEMS = [
  'AI & ML BUILDER',
  'HACKATHON WINNER',
  'OPEN SOURCE',
  'FULL-STACK DEVELOPER',
  'BUILDING REAL-WORLD PRODUCTS',
];
const DARK_ITEMS = [
  'PRODUCT DEVELOPMENT',
  'RESEARCH & AI',
  'DEPLOYMENT & CLOUD',
  'SYSTEM DESIGN',
  'DSA & PROBLEM SOLVING',
];

type Tone = 'light' | 'dark';

const TONES: Record<Tone, { background: string; color: string; dot: string; shadow: string; border: string }> = {
  light: {
    background: `linear-gradient(180deg, #E6F6EE 0%, ${MINT} 100%)`,
    color: CHARCOAL,
    dot: FOREST,
    shadow: `0 10px 26px -12px ${FOREST}80`,
    border: `${FOREST}33`,
  },
  dark: {
    background: `linear-gradient(90deg, ${FOREST} 0%, #1d7a57 50%, ${FOREST} 100%)`,
    color: '#FFFFFF',
    dot: MINT,
    shadow: `0 14px 30px -10px ${CHARCOAL}99`,
    border: FOREST,
  },
};

const Track = ({ items, tone, direction }: { items: string[]; tone: Tone; direction: 'left' | 'right' }) => {
  const { dot } = TONES[tone];
  // Each copy holds the list twice so it is always wider than the ribbon; two copies loop seamlessly at -50%
  const copy = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden>
      {[0, 1].map((round) => (
        <div key={round} className="flex shrink-0 items-center">
          {items.map((text) => (
            <span key={text} className="flex shrink-0 items-center">
              <span className="whitespace-nowrap px-5 text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs md:px-8 md:text-[15px] md:tracking-[0.14em]">
                {text}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full md:h-2 md:w-2" style={{ backgroundColor: dot }} />
            </span>
          ))}
          <Sparkles className="mx-5 h-4 w-4 shrink-0 md:mx-8 md:h-[18px] md:w-[18px]" style={{ color: dot }} strokeWidth={2.2} />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`flex w-max items-center will-change-transform motion-reduce:animate-none group-hover/ribbons:[animation-play-state:paused] ${
        direction === 'left' ? 'animate-ribbon-left' : 'animate-ribbon-right'
      }`}
    >
      {copy('a')}
      {copy('b')}
    </div>
  );
};

/**
 * One continuous strip. Both ribbons use the identical anchor (50% / 50%) and rotate about their own
 * centre, so they cross at exactly one point: the middle of the section.
 */
const Ribbon = ({
  tone,
  items,
  direction,
  tiltSign,
  zIndex,
}: {
  tone: Tone;
  items: string[];
  direction: 'left' | 'right';
  tiltSign: 1 | -1;
  zIndex: number;
}) => {
  const t = TONES[tone];
  return (
    <div
      className="absolute overflow-hidden border-y"
      style={{
        left: '-15%',
        width: '130%',
        height: 'var(--ribbon-h)',
        top: 'calc(50% - var(--ribbon-h) / 2)',
        transformOrigin: 'center center',
        transform: `rotate(calc(var(--tilt) * ${tiltSign}))`,
        zIndex,
        background: t.background,
        color: t.color,
        boxShadow: t.shadow,
        borderColor: t.border,
      }}
    >
      <div className="flex h-full items-center">
        <Track items={items} tone={tone} direction={direction} />
      </div>
    </div>
  );
};

const CenterBadge = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
    <div className={reduceMotion ? '' : 'animate-badge-float'}>
      <div
        className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full md:h-[124px] md:w-[124px]"
        style={{
          backgroundColor: OFF_WHITE,
          border: `3px solid ${FOREST}`,
          boxShadow: `0 0 0 6px ${OFF_WHITE}, 0 0 0 7px ${FOREST}33, 0 18px 40px -10px ${FOREST}80`,
        }}
      >
        <svg
          viewBox="0 0 120 120"
          className={`absolute inset-0 h-full w-full ${reduceMotion ? '' : 'animate-badge-spin'}`}
          aria-hidden
        >
          <defs>
            <path id="ribbon-badge-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
          </defs>
          <text fill={FOREST} fontSize="11.5" fontWeight="700" letterSpacing="2.2" style={{ fontFamily: 'inherit' }}>
            <textPath href="#ribbon-badge-circle" textLength="278" lengthAdjust="spacing">
              BUILD • LEARN • ITERATE • GROW •
            </textPath>
          </text>
        </svg>
        <span
          className="relative text-[22px] font-bold leading-none md:text-[30px]"
          style={{ color: FOREST, fontFamily: '"JetBrains Mono", "Courier New", monospace' }}
          aria-hidden
        >
          {'</>'}
        </span>
      </div>
    </div>
  </div>
);

export const RibbonShowcase = () => {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-label="Highlights"
      className="group/ribbons relative -mt-px h-[200px] overflow-hidden bg-background [--ribbon-h:36px] [--tilt:8deg] sm:h-[225px] sm:[--ribbon-h:42px] sm:[--tilt:6.5deg] md:h-[270px] md:[--ribbon-h:54px] md:[--tilt:5.5deg] min-[1800px]:[--tilt:3.5deg]"
    >
      {/* soft mint glow behind the ribbons */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(60% 55% at 50% 50%, ${MINT}80, transparent 70%)` }}
      />

      {/* screen-reader friendly version of the marquee */}
      <ul className="sr-only">
        {[...LIGHT_ITEMS, ...DARK_ITEMS].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      {/* Back: mint ribbon, descends left-to-right, text moves right-to-left */}
      <Ribbon tone="light" items={LIGHT_ITEMS} direction="left" tiltSign={1} zIndex={10} />
      {/* Front: dark ribbon, rises left-to-right, passes OVER the mint one, text moves left-to-right */}
      <Ribbon tone="dark" items={DARK_ITEMS} direction="right" tiltSign={-1} zIndex={20} />

      {/* Top: badge sits exactly on the crossing point */}
      <CenterBadge reduceMotion={reduceMotion} />
    </section>
  );
};
