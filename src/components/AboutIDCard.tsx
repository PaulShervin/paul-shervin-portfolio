import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Matter from 'matter-js';
import type { CardTheme } from './about/cardTheme';

export interface AboutIDCardProps {
  name: string;
  theme: CardTheme;
  /** Changes whenever the face changes so the card is re-measured for the physics body. */
  faceKey: string;
  /** Called on a tap (pointer down and up without dragging). */
  onFlip: () => void;
  children: ReactNode;
}

/* ─── geometry ─── */
const CARD_W = 336;
const ANCHOR_Y = 16;
const SEGMENTS = 5;          // short rope: 6 × 22px ≈ 132px from mount to card
const SEG_GAP = 22;
const SLOT_INSET = 16;       // badge slot sits 16px below the card's top edge
const STRAP_LEAD_IN = 24;    // the strap is drawn this far above the container so its start is never visible
const HOOK_LEN = 36;         // visible swivel + hook between the strap's metal crimp and the card slot
const ROPE_LEN = (SEGMENTS + 1) * SEG_GAP;
const SWING_SLACK = 20;

/* ─── tap detection ─── */
const TAP_MAX_DISTANCE = 6;  // px of pointer travel allowed for a tap
const TAP_MAX_DURATION = 450; // ms

/* ─── flip timing ─── */
const FLIP_HALF_MS = 240;

/* Smooth quadratic path through a list of points. */
const buildPath = (pts: [number, number][]): string => {
  if (pts.length < 2) return '';
  const [first, ...rest] = pts;
  const mids = rest.slice(0, -1).map((p, i) => {
    const n = rest[i + 1];
    return ` Q ${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + n[0]) / 2).toFixed(1)},${((p[1] + n[1]) / 2).toFixed(1)}`;
  });
  const last = rest[rest.length - 1];
  return `M ${first[0].toFixed(1)},${first[1].toFixed(1)}${mids.join('')} L ${last[0].toFixed(1)},${last[1].toFixed(1)}`;
};

/**
 * Developer ID card hanging from a short lanyard. Matter.js drives a small rope so the
 * card can be grabbed, dragged and swung; a plain tap flips it to the next face.
 * Under prefers-reduced-motion it renders at rest and flips without the 3D turn.
 */
export const AboutIDCard = ({ name, theme, faceKey, onFlip, children }: AboutIDCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const strapShadowRef = useRef<SVGPathElement>(null);
  const strapBaseRef = useRef<SVGPathElement>(null);
  const strapEdgeRef = useRef<SVGPathElement>(null);
  const strapSheenRef = useRef<SVGPathElement>(null);
  const strapRouteRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGGElement>(null);
  const hookRef = useRef<SVGPathElement>(null);

  const [cardH, setCardH] = useState(600);
  const [layoutKey, setLayoutKey] = useState(0);

  /* 3D turn: rotate to 90°, swap the face, snap to -90°, rotate back to 0. */
  const [turn, setTurn] = useState({ deg: 0, animate: true });
  const flipBusyRef = useRef(false);
  const onFlipRef = useRef(onFlip);
  onFlipRef.current = onFlip;

  const requestFlip = () => {
    if (flipBusyRef.current) return;
    flipBusyRef.current = true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onFlipRef.current();
      flipBusyRef.current = false;
      return;
    }
    setTurn({ deg: 90, animate: true });
    window.setTimeout(() => {
      onFlipRef.current();
      setTurn({ deg: -90, animate: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTurn({ deg: 0, animate: true });
          window.setTimeout(() => {
            flipBusyRef.current = false;
          }, FLIP_HALF_MS);
        });
      });
    }, FLIP_HALF_MS);
  };

  /* Measure the card whenever its face changes so the physics body matches it. */
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const measure = () => {
      const h = card.offsetHeight;
      if (h > 0) setCardH((prev) => (Math.abs(prev - h) > 1 ? h : prev));
    };
    measure();
    // Faces such as LeetCode grow after their stats load, so keep the body in step with the card.
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    return () => ro.disconnect();
  }, [faceKey]);

  /* Re-run the simulation when the column width changes (orientation, breakpoints). */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    let last = container.offsetWidth;
    const ro = new ResizeObserver(() => {
      const w = container.offsetWidth;
      if (Math.abs(w - last) > 4) {
        last = w;
        setLayoutKey(k => k + 1);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const strapShadow = strapShadowRef.current;
    const strapBase = strapBaseRef.current;
    const strapEdge = strapEdgeRef.current;
    const strapSheen = strapSheenRef.current;
    const strapRoute = strapRouteRef.current;
    const clip = clipRef.current;
    const hook = hookRef.current;
    if (!container || !card || !strapShadow || !strapBase || !strapEdge || !strapSheen || !strapRoute || !clip || !hook) return;

    const W = container.offsetWidth || CARD_W;
    const anchorX = W / 2;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Paint one frame of the lanyard + card for a given rope and card pose. */
    const paint = (ropePts: [number, number][], cx: number, cy: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      card.style.left = `${cx - CARD_W / 2}px`;
      card.style.top = `${cy - cardH / 2}px`;
      card.style.transform = `rotate(${(angle * 180) / Math.PI}deg)`;

      const topX = cx + (cardH / 2) * sin;
      const topY = cy - (cardH / 2) * cos;
      const slotX = topX - SLOT_INSET * sin;
      const slotY = topY + SLOT_INSET * cos;

      const d = buildPath(ropePts);
      /* One strap that continues above the container; the svg mask fades the top so it has no visible start. */
      const straps = buildPath([[ropePts[0][0], -STRAP_LEAD_IN], ...ropePts]);
      strapShadow.setAttribute('d', straps);
      strapBase.setAttribute('d', straps);
      strapEdge.setAttribute('d', straps);
      strapSheen.setAttribute('d', straps);
      strapRoute.setAttribute('d', d);

      const [ex, ey] = ropePts[ropePts.length - 1];
      const dist = Math.hypot(slotX - ex, slotY - ey) || 1;
      const deg = (Math.atan2(slotY - ey, slotX - ex) * 180) / Math.PI - 90;
      clip.setAttribute('transform', `translate(${ex}, ${ey}) rotate(${deg})`);
      hook.setAttribute('d', `M -2.5,24 L -2.5,${dist} Q -2.5,${dist + 4} 0,${dist + 4} Q 2.5,${dist + 4} 2.5,${dist} L 2.5,24 Z`);
    };

    /* Reduced motion: hang straight, no engine, tap still flips. */
    if (reduceMotion) {
      const pts: [number, number][] = Array.from({ length: SEGMENTS + 1 }, (_, i) => [anchorX, ANCHOR_Y + i * SEG_GAP]);
      paint(pts, anchorX, ANCHOR_Y + ROPE_LEN + cardH / 2, 0);
      card.style.cursor = 'pointer';
      const onClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('a')) return;
        requestFlip();
      };
      card.addEventListener('click', onClick);
      return () => card.removeEventListener('click', onClick);
    }

    /* ── Physics ── */
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 3.2 }, enableSleeping: true });
    (Matter.Sleeping as unknown as { _motionSleepThreshold: number })._motionSleepThreshold = 0.015;
    const anchor = Matter.Bodies.circle(anchorX, ANCHOR_Y, 4, { isStatic: true, collisionFilter: { mask: 0 } });
    const segs = Array.from({ length: SEGMENTS }, (_, i) =>
      Matter.Bodies.circle(anchorX, ANCHOR_Y + (i + 1) * SEG_GAP, 3, { mass: 0.25, frictionAir: 0.3, collisionFilter: { mask: 0 } }),
    );
    const cardBody = Matter.Bodies.rectangle(anchorX, ANCHOR_Y + ROPE_LEN + cardH / 2, CARD_W, cardH, {
      mass: 6,
      frictionAir: 0.34,
      restitution: 0.01,
      collisionFilter: { mask: 0 },
    });
    const link = (a: Matter.Body, b: Matter.Body, pointB?: Matter.Vector, length = SEG_GAP) =>
      Matter.Constraint.create({ bodyA: a, bodyB: b, pointB: pointB ?? { x: 0, y: 0 }, length, stiffness: 0.95, damping: 0.3 });
    const links = [
      link(anchor, segs[0]),
      ...segs.slice(0, -1).map((s, i) => link(s, segs[i + 1])),
      link(segs[SEGMENTS - 1], cardBody, { x: 0, y: -cardH / 2 + SLOT_INSET }, HOOK_LEN),
    ];
    Matter.World.add(engine.world, [anchor, ...segs, cardBody, ...links]);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    /* ── Drag (manual, pointer-based) with tap detection ── */
    let drag: Matter.Constraint | null = null;
    let downAt = { x: 0, y: 0, t: 0 };
    const toLocal = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a')) return;
      const pos = toLocal(e);
      if (Matter.Query.point([cardBody], pos).length === 0) return;
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      card.style.cursor = 'grabbing';
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      drag = Matter.Constraint.create({
        pointA: pos,
        bodyB: cardBody,
        pointB: { x: pos.x - cardBody.position.x, y: pos.y - cardBody.position.y },
        stiffness: 0.22,
        damping: 0.12,
        length: 0,
      });
      Matter.World.add(engine.world, drag);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const pos = toLocal(e);
      drag.pointA = { x: pos.x, y: pos.y };
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      Matter.World.remove(engine.world, drag);
      drag = null;
      card.style.cursor = 'grab';
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);

      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const held = performance.now() - downAt.t;
      if (e.type === 'pointerup' && moved <= TAP_MAX_DISTANCE && held <= TAP_MAX_DURATION) {
        requestFlip();
      }
    };
    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);

    /* ── Render loop ── */
    let raf = 0;
    let lastPose = '';
    const tick = () => {
      const pose = `${cardBody.position.x.toFixed(2)}|${cardBody.position.y.toFixed(2)}|${cardBody.angle.toFixed(4)}|${segs.map(s => s.position.x.toFixed(1) + ',' + s.position.y.toFixed(1)).join(';')}`;
      if (pose !== lastPose) {
        lastPose = pose;
        const pts: [number, number][] = [[anchorX, ANCHOR_Y], ...segs.map((s): [number, number] => [s.position.x, s.position.y])];
        paint(pts, cardBody.position.x, cardBody.position.y, cardBody.angle);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
    // requestFlip only reads refs, so it is stable for the life of the component.
  }, [cardH, layoutKey]);


  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[360px] select-none"
      style={{ height: ANCHOR_Y + ROPE_LEN + cardH + SWING_SLACK, perspective: '1200px' }}
    >
      {/* ── Lanyard and clip (top of the strap fades out, no visible mount) ── */}
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, #000 44px)', maskImage: 'linear-gradient(to bottom, transparent 0px, #000 44px)' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="idcard-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7d8a86" />
            <stop offset="30%" stopColor="#e4eae7" />
            <stop offset="60%" stopColor="#b3bdb9" />
            <stop offset="100%" stopColor="#6f7c78" />
          </linearGradient>
          <pattern id="idcard-brush" width="2" height="4" patternUnits="userSpaceOnUse">
            <rect width="1" height="4" fill="rgba(255,255,255,0.16)" />
            <rect x="1" width="1" height="4" fill="rgba(0,0,0,0.07)" />
          </pattern>
          <radialGradient id="idcard-screw" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f0f5f2" />
            <stop offset="60%" stopColor="#9aa9a2" />
            <stop offset="100%" stopColor="#4c5c55" />
          </radialGradient>
          {/* fine twill weave */}
          <pattern id="idcard-weave" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <rect width="3" height="3" style={{ fill: theme.strap, transition: 'fill 0.6s ease' }} />
            <rect width="3" height="1.2" fill="rgba(255,255,255,0.09)" />
            <rect y="1.8" width="3" height="0.8" fill="rgba(0,0,0,0.14)" />
          </pattern>
          <path id="idcard-route" ref={strapRouteRef} d="" />
        </defs>

        {/* woven fabric strap: soft shadow, darker edge, twill body, centre sheen */}
        <path ref={strapShadowRef} d="" fill="none" stroke="#000" strokeWidth="22" strokeLinejoin="round" opacity="0.18" style={{ filter: 'blur(4px)' }} />
        <path ref={strapEdgeRef} d="" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="17.5" strokeLinejoin="round" />
        <path ref={strapBaseRef} d="" fill="none" stroke="url(#idcard-weave)" strokeWidth="15.5" strokeLinejoin="round" />
        <path ref={strapSheenRef} d="" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5.5" strokeLinejoin="round" style={{ mixBlendMode: 'soft-light' }} />

        {/* brushed-silver crimp, swivel and hook into the card eyelet */}
        <g ref={clipRef} style={{ filter: 'drop-shadow(0 1.5px 1.5px rgba(0,0,0,0.35))' }}>
          {/* crimp barrel clamping the fabric */}
          <rect x="-12" y="-4" width="24" height="16" rx="3" fill="url(#idcard-metal)" stroke="#3f4f48" strokeWidth="0.8" />
          <rect x="-12" y="-4" width="24" height="16" rx="3" fill="url(#idcard-brush)" />
          <rect x="-12" y="-4" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
          <rect x="-9" y="3" width="18" height="1" rx="0.5" fill="rgba(0,0,0,0.22)" />
          {/* swivel ring */}
          <ellipse cx="0" cy="16" rx="4.2" ry="4.6" fill="none" stroke="url(#idcard-metal)" strokeWidth="2.2" />
          <ellipse cx="0" cy="16" rx="4.2" ry="4.6" fill="none" stroke="#3f4f48" strokeWidth="0.5" opacity="0.6" />
          {/* swivel body */}
          <rect x="-3.6" y="19" width="7.2" height="8" rx="1.8" fill="url(#idcard-metal)" stroke="#3f4f48" strokeWidth="0.7" />
          <rect x="-3.6" y="19" width="7.2" height="8" rx="1.8" fill="url(#idcard-brush)" />
          <rect x="-3.6" y="22.6" width="7.2" height="0.9" fill="rgba(0,0,0,0.28)" />
          {/* hook stem reaching into the eyelet */}
          <path ref={hookRef} d="" fill="url(#idcard-metal)" stroke="#3f4f48" strokeWidth="0.7" />
        </g>
      </svg>

      {/* ── Card (positioned by the simulation; inner wrapper does the 3D flip) ── */}
      <article
        ref={cardRef}
        aria-label={`${name} developer ID card`}
        className="absolute z-10 w-[336px] cursor-grab touch-none will-change-transform"
        style={{ left: 0, top: ANCHOR_Y + ROPE_LEN, transformStyle: 'preserve-3d' }}
      >
        <div
          className={`relative overflow-hidden rounded-[22px] border shadow-[0_24px_60px_-18px_rgba(0,0,0,0.45),0_6px_18px_-8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.6)] ${theme.shell}`}
          style={{
            transform: `rotateY(${turn.deg}deg)`,
            transition: turn.animate ? `transform ${FLIP_HALF_MS}ms ${turn.deg === 0 ? 'ease-out' : 'ease-in'}` : 'none',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Header band with the badge slot at the top */}
          <div className={`relative h-[96px] ${theme.header}`}>
            {/* reinforced metal eyelet around the badge slot */}
            <div
              className="absolute left-1/2 top-[8px] flex h-4 w-[50px] -translate-x-1/2 items-center justify-center rounded-full border border-[#4a5a54] bg-[linear-gradient(180deg,#e9eeec,#aab5b1_55%,#d3dbd8)] shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]"
              aria-hidden="true"
            >
              <div className="h-2 w-9 rounded-full bg-[#0f1f18] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]" />
            </div>

            {/* smart-card chip */}
            <div
              className="absolute left-5 top-4 h-[22px] w-[28px] rounded-[5px] border border-black/25 bg-[linear-gradient(135deg,#f6dc8c,#c9962f_55%,#f1d27a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
              aria-hidden="true"
            >
              <span className="absolute left-1/2 top-0 h-full w-px bg-black/25" />
              <span className="absolute left-0 top-1/2 h-px w-full bg-black/25" />
              <span className="absolute left-1/2 top-1/2 h-2.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-black/25" />
            </div>

            {/* printed labels */}
            <span className="absolute bottom-3 left-5 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/70" aria-hidden="true">
              Developer
            </span>
            <span className="absolute bottom-3 right-5 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/70" aria-hidden="true">
              ID Card
            </span>
          </div>
          {children}

          {/* glossy sheen across the whole card */}
          <div
            className={`pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_28%,rgba(255,255,255,0.5)_46%,transparent_62%)] ${
              theme.dark ? 'opacity-[0.12]' : 'opacity-40'
            }`}
            aria-hidden="true"
          />
        </div>
      </article>
    </div>
  );
};
