import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

const IDLE_SIZE = 44;
const LOCK_PADDING = 8;
const MAX_LOCK_WIDTH = 520;
const MAX_LOCK_HEIGHT = 320;
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, .cursor-pointer';

const COLOR = '#000000';
const COLOR_LOCKED = '#000000';
const OUTLINE = 'drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff)';
const LOCK_OUT_MS = 700;

type Tag = 'none' | 'in' | 'out';
const TAG_TEXT: Record<Exclude<Tag, 'none'>, string> = {
  in: 'LOCK IN',
  out: 'LOCK OUT',
};

const CORNERS = [
  'top-0 left-0 border-t-2 border-l-2 rounded-tl-md',
  'top-0 right-0 border-t-2 border-r-2 rounded-tr-md',
  'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md',
  'bottom-0 right-0 border-b-2 border-r-2 rounded-br-md',
];

const findLockTarget = (el: HTMLElement | null): HTMLElement | null => {
  if (!el) return null;
  const candidate =
    (el.closest(INTERACTIVE) as HTMLElement | null) ??
    (window.getComputedStyle(el).cursor === 'pointer' ? el : null);
  if (!candidate) return null;
  const rect = candidate.getBoundingClientRect();
  if (rect.width > MAX_LOCK_WIDTH || rect.height > MAX_LOCK_HEIGHT) return null;
  return candidate;
};

export const CustomCursor = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [tag, setTag] = useState<Tag>('none');
  const tagTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lockedEl = useRef<HTMLElement | null>(null);
  const lastMouse = useRef({ x: -100, y: -100 });

  // Exact pointer position (the center dot)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // The bracket frame: springs so it can glide between "following" and "locked"
  const frameSpring = { damping: 28, stiffness: 320, mass: 0.5 };
  const frameX = useSpring(-100, frameSpring);
  const frameY = useSpring(-100, frameSpring);
  const frameW = useSpring(IDLE_SIZE, frameSpring);
  const frameH = useSpring(IDLE_SIZE, frameSpring);
  const frameScale = useSpring(1, { damping: 18, stiffness: 400 });

  useEffect(() => {
    frameScale.set(isClicking ? 0.85 : 1);
  }, [isClicking, frameScale]);

  useEffect(() => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      setIsDesktop(false);
      return;
    }

    document.body.style.cursor = 'none';

    const followMouse = () => {
      const { x, y } = lastMouse.current;
      frameX.set(x - IDLE_SIZE / 2);
      frameY.set(y - IDLE_SIZE / 2);
      frameW.set(IDLE_SIZE);
      frameH.set(IDLE_SIZE);
    };

    const lockOnto = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      frameX.set(rect.left - LOCK_PADDING);
      frameY.set(rect.top - LOCK_PADDING);
      frameW.set(rect.width + LOCK_PADDING * 2);
      frameH.set(rect.height + LOCK_PADDING * 2);
    };

    const handleMove = (e: MouseEvent) => {
      lastMouse.current = { x: e.clientX, y: e.clientY };
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
      if (!lockedEl.current) followMouse();
    };

    const clearTagTimer = () => {
      if (tagTimer.current) clearTimeout(tagTimer.current);
      tagTimer.current = null;
    };

    const handleOver = (e: MouseEvent) => {
      const target = findLockTarget(e.target as HTMLElement);
      const wasLocked = lockedEl.current !== null;
      lockedEl.current = target;
      if (target) {
        lockOnto(target);
        setIsLocked(true);
        clearTagTimer();
        setTag('in');
      } else {
        setIsLocked(false);
        followMouse();
        if (wasLocked) {
          clearTagTimer();
          setTag('out');
          tagTimer.current = setTimeout(() => setTag('none'), LOCK_OUT_MS);
        }
      }
    };

    // Keep the lock glued to the element while the page scrolls or resizes
    const handleReflow = () => {
      if (lockedEl.current) {
        if (!lockedEl.current.isConnected) {
          lockedEl.current = null;
          setIsLocked(false);
          followMouse();
        } else {
          lockOnto(lockedEl.current);
        }
      }
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('scroll', handleReflow, true);
    window.addEventListener('resize', handleReflow);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      clearTagTimer();
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('scroll', handleReflow, true);
      window.removeEventListener('resize', handleReflow);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [mouseX, mouseY, frameX, frameY, frameW, frameH]);

  if (!isDesktop) return null;

  const color = isLocked ? COLOR_LOCKED : COLOR;

  return (
    <>
      {/* Targeting frame: rotates while hunting, snaps square onto the target when locked */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: frameX,
          y: frameY,
          width: frameW,
          height: frameH,
          scale: frameScale,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <motion.div
          className="relative h-full w-full"
          animate={isLocked ? { rotate: 0 } : { rotate: 360 }}
          transition={
            isLocked
              ? { type: 'spring', damping: 18, stiffness: 220 }
              : { duration: 6, ease: 'linear', repeat: Infinity }
          }
        >
          {/* soft target fill while locked */}
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              backgroundColor: isLocked ? 'rgba(0, 0, 0, 0.07)' : 'rgba(0, 0, 0, 0)',
            }}
            transition={{ duration: 0.25 }}
          />

          {CORNERS.map((corner) => (
            <motion.span
              key={corner}
              className={`absolute ${corner}`}
              initial={false}
              animate={{
                borderColor: color,
                width: isLocked ? 14 : 10,
                height: isLocked ? 14 : 10,
              }}
              transition={{ duration: 0.2 }}
              style={{ filter: OUTLINE }}
            />
          ))}
        </motion.div>

        {/* Status tag */}
        <AnimatePresence mode="wait">
          {tag !== 'none' && (
            <motion.div
              key={tag}
              className="absolute left-full top-0 flex items-center"
              style={{ transformOrigin: '0% 50%', filter: OUTLINE }}
              initial={{ opacity: 0, rotate: 55 }}
              animate={{ opacity: 1, rotate: [40, 8, 22, 14, 18] }}
              exit={{ opacity: 0, rotate: 40 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              {/* string tied to the frame corner */}
              <span className="block h-px w-4 bg-black" />
              {/* price tag body: pointed end, punched hole */}
              <span
                className="relative flex h-[22px] items-center whitespace-nowrap bg-black pl-5 pr-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                style={{ clipPath: 'polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)' }}
              >
                <span className="absolute left-[7px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white" />
                {TAG_TEXT[tag]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Crosshair tick marks + center dot, always exactly on the pointer */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10001]"
        style={{
          x: mouseX,
          y: mouseY,
          opacity: isVisible ? 1 : 0,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="relative h-6 w-6"
          animate={{ scale: isClicking ? 0.7 : isLocked ? 1.15 : 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 400 }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2" style={{ background: color }} />
          <span className="absolute left-1/2 bottom-0 h-1.5 w-px -translate-x-1/2" style={{ background: color }} />
          <span className="absolute top-1/2 left-0 h-px w-1.5 -translate-y-1/2" style={{ background: color }} />
          <span className="absolute top-1/2 right-0 h-px w-1.5 -translate-y-1/2" style={{ background: color }} />
        </motion.div>
      </motion.div>
    </>
  );
};
