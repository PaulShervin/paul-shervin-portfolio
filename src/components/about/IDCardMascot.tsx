import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Home } from 'lucide-react';
import { SiGithub, SiLeetcode, SiLinkedin } from 'react-icons/si';
import robotBody from '@/assets/mascot/robot-body.png';
import robotHand from '@/assets/mascot/robot-hand.png';
import type { CardFace } from './cardTheme';
import { HELMET_ICON_BY_FACE, SPEECH_BUBBLE_BY_FACE, type BubbleIconKey, type HelmetIconKey } from './mascotMappings';

const FOREST = '#176B4D';
const SAGE = '#4B8B70';
const MINT = '#DDF3E8';
const OFF_WHITE = '#F7F7F0';

/*
 * The robot is the supplied 3D render, cut out onto a transparent background. The only parts that
 * ever change are the helmet-screen content and the speech bubble. Source image is 177 x 278;
 * the geometry below is expressed as a percentage of that image.
 */
const VISOR = { left: '57%', top: '41.7%', size: '24%' } as const;
const HAND = { left: '76.84%', top: '38.85%', width: '23.16%', height: '24.46%' } as const;
const HEAD_TOP_PERCENT = 24; // helmet top as % of the image height (where the bubble's tail points)

const HelmetLogo = ({ icon, initial }: { icon: HelmetIconKey; initial: string }) => {
  switch (icon) {
    case 'leetcode':
      return <SiLeetcode className="h-full w-full" style={{ color: '#FFA116' }} aria-hidden />;
    case 'github':
      return <SiGithub className="h-full w-full" style={{ color: '#ffffff' }} aria-hidden />;
    case 'linkedin':
      return <SiLinkedin className="h-full w-full" style={{ color: '#3b9bff' }} aria-hidden />;
    default:
      return (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-bold leading-none text-white"
          style={{ fontSize: '12cqw', background: `linear-gradient(135deg, ${SAGE}, ${FOREST})`, boxShadow: `0 0 0 1.5px ${MINT}66` }}
        >
          {initial}
        </span>
      );
  }
};

const BubbleLogo = ({ icon }: { icon: BubbleIconKey }) => {
  switch (icon) {
    case 'leetcode':
      return <SiLeetcode className="h-full w-full" style={{ color: '#FFA116' }} aria-hidden />;
    case 'github':
      return <SiGithub className="h-full w-full" style={{ color: '#20292B' }} aria-hidden />;
    case 'linkedin':
      return <SiLinkedin className="h-full w-full" style={{ color: '#0A66C2' }} aria-hidden />;
    default:
      return <Home className="h-full w-full" style={{ color: FOREST }} strokeWidth={2.2} aria-hidden />;
  }
};

/* ───────────── cloud speech bubble ───────────── */

// Union of circles + a rounded rect = cloud silhouette. Drawn twice: thick sage stroke underneath,
// off-white fill on top, which leaves a clean thin outline around the whole silhouette.
const CLOUD_CIRCLES: [number, number, number][] = [
  [34, 22, 15], [62, 16, 16], [92, 17, 15], [114, 24, 13],
  [30, 60, 13], [58, 64, 14], [88, 64, 14], [112, 58, 13],
  [18, 41, 17], [118, 41, 17],
];

const CloudShape = ({ fill }: { fill: boolean }) => {
  const paint = fill
    ? { fill: OFF_WHITE, stroke: 'none' }
    : { fill: SAGE, stroke: SAGE, strokeWidth: 3.4, strokeLinejoin: 'round' as const };
  return (
    <g>
      <rect x="16" y="16" width="104" height="50" rx="22" {...paint} />
      {CLOUD_CIRCLES.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} {...paint} />
      ))}
    </g>
  );
};

const SpeechBubble = ({ text, icon, reduce }: { text: string; icon: BubbleIconKey; reduce: boolean }) => (
  <motion.div
    data-bubble-box
    className="absolute left-0 h-[80px] w-[136px] min-[1440px]:left-auto min-[1440px]:right-0"
    style={{ bottom: `calc(${100 - HEAD_TOP_PERCENT}% + 17px)` }}
    animate={reduce ? undefined : { y: [0, -3, 0] }}
    transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
  >
    <svg
      viewBox="0 0 136 80"
      className="absolute inset-0 h-full w-full overflow-visible"
      style={{ filter: 'drop-shadow(0 6px 9px rgba(23,107,77,0.2))' }}
      aria-hidden
    >
      <CloudShape fill={false} />
      <CloudShape fill />
    </svg>

    {/* tail: two small circles stepping toward the robot's helmet */}
    <span
      className="absolute left-[var(--tail-x)] top-full -mt-1 h-[11px] w-[11px] rounded-full"
      style={{ background: OFF_WHITE, border: `2px solid ${SAGE}`, filter: 'drop-shadow(0 3px 4px rgba(23,107,77,0.15))' }}
      aria-hidden
    />
    <span
      className="absolute left-[calc(var(--tail-x)+3px)] top-full mt-[10px] h-[6px] w-[6px] rounded-full"
      style={{ background: OFF_WHITE, border: `1.5px solid ${SAGE}` }}
      aria-hidden
    />

    {/* one message + one icon at a time; the cloud itself never changes size */}
    <div className="absolute inset-x-[19px] inset-y-[16px] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={text}
          data-bubble-content
          className="flex w-full items-center gap-1.5"
          initial={reduce ? false : { opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.9, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <motion.span
            className="h-[18px] w-[18px] shrink-0"
            initial={reduce ? false : { scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.05 }}
          >
            <BubbleLogo icon={icon} />
          </motion.span>
          <span className="text-[11px] font-semibold leading-[13.5px]" style={{ color: FOREST }}>
            {text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  </motion.div>
);

/* ───────────── mascot ───────────── */

export const IDCardMascot = ({ face, initial, className = '' }: { face: CardFace; initial: string; className?: string }) => {
  const reduce = useReducedMotion() ?? false;

  // Separate lookups, both derived from the same ID-card state on every render (no state of their own).
  const helmetIcon = HELMET_ICON_BY_FACE[face];
  const { text: speechBubbleText, icon: speechBubbleIcon } = SPEECH_BUBBLE_BY_FACE[face];

  return (
    <div
      data-mascot-face={face}
      data-mascot-helmet={helmetIcon}
      data-mascot-bubble={speechBubbleText}
      data-mascot-bubble-icon={speechBubbleIcon}
      className={`pointer-events-none absolute z-30 aspect-[177/278] w-[80px] select-none [--tail-x:35px] min-[1440px]:w-[92px] min-[1440px]:[--tail-x:85px] ${className}`}
      style={{ containerType: 'inline-size' }}
      aria-hidden="true"
    >
      {/* gentle float */}
      <motion.div
        className="relative h-full w-full"
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <SpeechBubble text={speechBubbleText} icon={speechBubbleIcon} reduce={reduce} />

        {/* soft ground shadow */}
        <div
          className="absolute bottom-[-3px] left-[18%] h-[9px] w-[64%] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(21,77,54,0.28), transparent)' }}
        />

        {/* occasional, very subtle sway of the whole figure (body itself never changes) */}
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: '50% 100%' }}
          animate={reduce ? undefined : { rotate: [0, 0, -0.9, 0.7, 0, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', times: [0, 0.55, 0.62, 0.7, 0.78, 1] }}
        >
          <img src={robotBody} alt="" draggable={false} className="absolute inset-0 h-full w-full" />

          {/* pointing hand: duplicate layer nudged around the cuff, lies exactly over the original */}
          <motion.img
            src={robotHand}
            alt=""
            draggable={false}
            className="absolute"
            style={{ ...HAND, transformOrigin: '10% 85%' }}
            animate={reduce ? undefined : { rotate: [-1.5, 2.5, -1.5], x: [0, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* helmet screen: the only part that changes between states */}
          <div
            className="absolute flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: VISOR.left, top: VISOR.top, width: VISOR.size, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.18))' }}
          >
            <motion.div
              className="flex h-full w-full items-center justify-center"
              animate={reduce ? undefined : { scaleY: [1, 1, 0.08, 1, 1] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={helmetIcon}
                  className="flex h-full w-full items-center justify-center"
                  initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <HelmetLogo icon={helmetIcon} initial={initial} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
