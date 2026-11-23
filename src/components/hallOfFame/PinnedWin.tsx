import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Medal, Sparkles, Trophy, type LucideIcon } from 'lucide-react';
import { PIN_COLORS, Pin, Tape } from './decor';
import { Rosette, type Medal as MedalTier } from './Rosette';
import { normalizePhotoEdit, photoEditStyle, type PhotoEdit } from '../hackathons/photoEdit';

const serif = { fontFamily: '"Cormorant Garamond", serif' };
const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

export const CATEGORY: Record<string, { icon: LucideIcon; label: string }> = {
  hackathon: { icon: Trophy, label: 'Hackathon' },
  coding: { icon: Code, label: 'Coding' },
  project: { icon: Sparkles, label: 'Project' },
  other: { icon: Medal, label: 'Milestone' },
};

export interface Win {
  id: string;
  title: string;
  event: string;
  year: string;
  category: string;
  description: string;
  image?: string;
  photoEdit?: Partial<PhotoEdit>;
  cardSize?: 'auto' | 'normal' | 'large';
  rank: { big: string; small: string; n: number; podium: boolean; isTop: boolean } | null;
}

// a fixed set of tilts so the board looks hand-pinned but never changes between loads
const TILT = [-3.2, 2.6, -1.8, 3.2, -2.4, 1.6];
const NOTE_TILT = [2.2, -2.6, 1.8, -2.2, 2.6, -1.4];
const DROP = [0, 26, 8, 34, 2, 20];

const paperLines =
  'repeating-linear-gradient(180deg, transparent 0 21px, rgba(23,107,77,.07) 21px 22px)';

const Placeholder = ({ win }: { win: Win }) => {
  const { icon: Icon } = CATEGORY[win.category];
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #eaf3ee, #cfe5d8)' }}
    >
      {win.year && (
        <span className="absolute -bottom-4 right-2 text-[96px] font-bold leading-none text-[#176B4D]/10" style={serif} aria-hidden>
          {win.year}
        </span>
      )}
      <Icon className="relative h-16 w-16 text-[#176B4D]/55" strokeWidth={1.2} aria-hidden />
    </div>
  );
};

export const PinnedWin = ({ win, index }: { win: Win; index: number }) => {
  const [broken, setBroken] = useState(false);
  const place = win.rank && !win.rank.isTop ? win.rank.n : 0;
  const winner = place === 1;
  const large = win.cardSize === 'large' || (win.cardSize !== 'normal' && winner);
  const edit = normalizePhotoEdit(win.photoEdit);
  const medal: MedalTier | null = place === 1 ? 'gold' : place === 2 ? 'silver' : place === 3 ? 'bronze' : null;
  const noteTilt = NOTE_TILT[index % NOTE_TILT.length];
  const useTape = !winner && index % 2 === 1;
  const pinColor = winner ? '#c9962f' : PIN_COLORS[index % PIN_COLORS.length];
  const { icon: Icon, label } = CATEGORY[win.category];
  const showPhoto = win.image && !broken;
  const tilt = winner ? -1.2 : TILT[index % TILT.length];

  return (
    <motion.article
      className={`relative ${large ? 'sm:col-span-2' : 'lg:mt-[var(--drop)]'}`}
      style={{ ['--drop' as string]: `${large ? 0 : DROP[index % DROP.length]}px` }}
      initial={{ opacity: 0, y: -40, rotate: tilt + 7 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ type: 'spring', stiffness: winner ? 90 : 120, damping: winner ? 12 : 14, delay: winner ? 0 : Math.min(index * 0.12, 0.36) }}
      whileHover={{ rotate: 0, y: -8, scale: 1.025, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
    >
      {/* the photo */}
      <div
        className={`relative bg-[#fdfcf8] shadow-[0_18px_26px_-14px_rgba(55,32,12,.6),0_2px_4px_rgba(55,32,12,.28)] ${
          winner ? 'p-3.5 shadow-[0_0_0_2px_rgba(226,180,64,.85),0_30px_44px_-18px_rgba(150,105,20,.6)]' : 'p-2.5'
        }`}
      >
        <div className={`relative overflow-hidden bg-[#e7e2d6] ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
          {showPhoto ? (
            <img
              src={win.image}
              alt={`${win.title}${win.rank ? `, ${win.rank.big}${win.rank.small} place` : ''}`}
              loading="lazy"
              draggable={false}
              onError={() => setBroken(true)}
              className="h-full w-full select-none"
              style={photoEditStyle(edit)}
            />
          ) : (
            <Placeholder win={win} />
          )}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_22px_rgba(0,0,0,.12)]" />
        </div>
      </div>

      {useTape ? (
        <>
          <Tape className="-left-6 -top-2 -rotate-[38deg]" />
          <Tape className="-right-6 -top-2 rotate-[38deg]" />
        </>
      ) : (
        <Pin color={pinColor} className="-top-3 left-1/2 -translate-x-1/2" />
      )}

      {medal && win.rank && (
        <Rosette
          medal={medal}
          big={win.rank.big}
          small={win.rank.small}
          className={winner ? '-right-5 -top-7 h-[112px] w-[86px]' : '-right-4 -top-6 h-[84px] w-[64px]'}
        />
      )}

      {/* the note, laid over the photo */}
      <div
        className={`relative z-10 -mt-10 ml-[-10px] bg-[#fcf8ee] px-3.5 pb-3 pt-4 shadow-[0_14px_22px_-12px_rgba(55,32,12,.55),0_1px_3px_rgba(55,32,12,.25)] ${
          large ? 'w-[88%] sm:w-[58%] sm:min-w-[300px]' : 'w-[78%]'} ${winner ? 'border-t-4 border-[#d9a93c]' : ''
        }`}
        style={{ transform: `rotate(${noteTilt}deg)`, backgroundImage: paperLines, backgroundPositionY: 8 }}
      >
        <Tape className="-top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-3deg]" tint="rgba(245,222,190,.85)" />
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 ${
              winner ? 'bg-gradient-to-br from-[#f3d27a] to-[#d4a32f] text-[#5b3d07] shadow-sm' : 'bg-[#176B4D]/10 text-[#176B4D]'
            }`}
          >
            {win.rank ? (
              <span className="flex items-start leading-none" style={{ ...serif, fontVariantNumeric: 'lining-nums' }}>
                <span className="text-xl font-semibold">{win.rank.big}</span>
                <span className="mt-0.5 text-[10px] italic">{win.rank.small}</span>
              </span>
            ) : (
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-[#176B4D]" style={mono}>
            {label}
            {win.year ? ` · ${win.year}` : ''}
          </span>
          {winner && (
            <span className="ml-auto hidden rounded-sm bg-[#d9a93c]/20 px-1.5 py-0.5 text-[9px] sm:inline font-bold uppercase tracking-[0.2em] text-[#8a5f0e]" style={mono}>
              Winner
            </span>
          )}
        </div>
        <h3 className={`mt-2 line-clamp-2 font-semibold leading-[1.1] text-[#1f2d27] ${large ? 'text-[27px]' : 'text-[21px]'}`} style={serif}>
          {win.title}
        </h3>
        {win.event && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#1f2d27]/60" style={mono}>
            {win.event}
          </p>
        )}
      </div>
    </motion.article>
  );
};

/** An empty sticky note: the spot for the next win. */
export const NextWinNote = () => (
  <motion.div
    className="relative mx-auto w-[210px] self-center rotate-[2.5deg] bg-[#e5f3ea] px-5 py-7 text-center shadow-[0_14px_22px_-12px_rgba(55,32,12,.55)] sm:mx-0 sm:justify-self-center"
    initial={{ opacity: 0, y: -30, rotate: 8 }}
    whileInView={{ opacity: 1, y: 0, rotate: 2.5 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.3 }}
    whileHover={{ rotate: 0, y: -6 }}
  >
    <Pin color="#C2694A" className="-top-3 left-1/2 -translate-x-1/2" />
    <div className="rounded-md border-2 border-dashed border-[#176B4D]/35 px-3 py-5">
      <Trophy className="mx-auto h-7 w-7 text-[#176B4D]/60" strokeWidth={1.4} aria-hidden />
      <p className="mt-2 text-sm font-semibold text-[#173a2c]" style={serif}>
        Next win goes here
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#173a2c]/55" style={mono}>
        still collecting
      </p>
    </div>
  </motion.div>
);
