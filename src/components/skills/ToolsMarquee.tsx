import { motion } from 'framer-motion';
import { TOOLS, type ToolMeta } from './skillsMeta';

const FADE_MASK = 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)';
/** Approximate rendered width of one tile plus its gap, in px. */
const TILE_WIDTH = 112;
/** Each half of the track must be at least this wide so no row ever shows a gap. */
const MIN_HALF_WIDTH = 2600;

/**
 * The track is animated by exactly half its width, so it must hold an even
 * number of copies. Enough copies are added that half the track still covers
 * a wide viewport even when a row has only a few tools.
 */
const copiesFor = (count: number) => {
  const perHalf = Math.ceil(MIN_HALF_WIDTH / (Math.max(count, 1) * TILE_WIDTH));
  return Math.max(2, perHalf) * 2;
};

interface MarqueeRowProps {
  tools: ToolMeta[];
  direction: 'forward' | 'backward';
}

const MarqueeRow = ({ tools, direction }: MarqueeRowProps) => {
  const track = Array.from({ length: copiesFor(tools.length) }, () => tools).flat();
  const keyframes = direction === 'forward' ? ['0%', '-50%'] : ['-50%', '0%'];
  // Same px/second in both rows regardless of how many tools each one holds.
  const duration = (track.length / 2) * 2.2;

  return (
    <div
      className="group relative flex w-full overflow-hidden py-3"
      style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
    >
      <motion.div
        animate={{ x: keyframes }}
        transition={{ ease: 'linear', duration, repeat: Infinity }}
        className="flex w-max gap-5 pr-5 group-hover:[animation-play-state:paused] md:gap-6 md:pr-6"
      >
        {track.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={`${tool.name}-${idx}`}
              className="group/icon flex cursor-default flex-col items-center gap-2.5"
            >
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-border bg-card transition-all duration-300 group-hover/icon:-translate-y-1 group-hover/icon:border-foreground/30 md:h-20 md:w-20 2xl:h-[88px] 2xl:w-[88px]">
                <Icon
                  className={`h-9 w-9 md:h-10 md:w-10 2xl:h-11 2xl:w-11 ${tool.useForeground ? 'text-foreground' : ''}`}
                  style={tool.useForeground ? undefined : { color: tool.color }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground transition-colors group-hover/icon:text-foreground">
                {tool.name}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export const ToolsMarquee = () => {
  const midpoint = Math.ceil(TOOLS.length / 2);
  const firstRow = TOOLS.slice(0, midpoint);
  const secondRow = TOOLS.slice(midpoint);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Preferred Tools &amp; Technologies
        </h3>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Two rows scrolling in opposite directions, aligned with the grid above */}
      <MarqueeRow tools={firstRow} direction="forward" />
      <MarqueeRow tools={secondRow} direction="backward" />
    </motion.div>
  );
};
