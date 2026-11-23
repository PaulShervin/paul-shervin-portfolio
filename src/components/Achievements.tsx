import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { corkStyle, frameStyle } from './hallOfFame/decor';
import { toWin } from './hallOfFame/winUtils';
import { NextWinNote, PinnedWin, type Win } from './hallOfFame/PinnedWin';

const serif = { fontFamily: '"Cormorant Garamond", serif' };

const StatBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="min-w-[96px]">
    <p className="text-4xl font-semibold leading-none text-foreground md:text-5xl" style={{ ...serif, fontVariantNumeric: 'lining-nums' }}>
      {value}
    </p>
    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
  </div>
);

export const Achievements = () => {
  const { achievementsQuery, hackathonsQuery } = usePortfolioData();
  const hackathons = hackathonsQuery.data;

  const wins = useMemo<Win[]>(
    () => (achievementsQuery.data ?? []).map((a, i) => toWin(a, i, hackathons ?? [])),
    [achievementsQuery.data, hackathons],
  );

  if (wins.length === 0) return null;

  const firsts = wins.filter((w) => w.rank && !w.rank.isTop && w.rank.n === 1).length;
  const podiums = wins.filter((w) => w.rank?.podium).length;
  const cols = wins.length + 1 <= 2 ? 'sm:grid-cols-2' : wins.length + 1 === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="achievements" className="relative bg-background py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header: title left, summary stats right (same pattern as Skills) */}
        <div className="mb-14 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1e4d3a]">Achievements</p>
            <h2 className="mt-3 text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-6xl" style={serif}>
              Hall of Fame
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
              The wins I’ve pinned up along the way, with the photos to prove it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-8 md:gap-10"
          >
            <StatBlock value={wins.length} label="Achievements" />
            {podiums > 0 && <StatBlock value={podiums} label="Podium finishes" />}
            {firsts > 0 && <StatBlock value={firsts} label="First places" />}
          </motion.div>
        </div>

        {/* The board: wooden frame, cork surface */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[30px] p-3 sm:p-4"
          style={frameStyle}
        >
          {/* nameplate */}
          <div
            className="absolute -top-5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md px-6 py-1.5 text-center sm:px-7"
            style={{ background: 'linear-gradient(180deg, #f8f3e6, #e5dcc6)', boxShadow: 'inset 0 1px 0 #fff, 0 8px 14px -6px rgba(40,25,10,.55)' }}
          >
            <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#8a6a43]/70" aria-hidden />
            <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#8a6a43]/70" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4a3722] sm:text-sm sm:tracking-[0.3em]" style={serif}>
              Hall of Fame
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[22px] px-5 pb-12 pt-14 sm:px-10 md:px-14 md:pb-16" style={corkStyle}>
            <div className={`grid items-start gap-x-12 gap-y-14 [grid-auto-flow:dense] ${cols}`}>
              {wins.map((win, i) => (
                <PinnedWin key={win.id} win={win} index={i} />
              ))}
              <NextWinNote />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
