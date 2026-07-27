import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { SiLeetcode } from 'react-icons/si';
import demoData from '../data/demo-data.json';
import portrait from '@/assets/hero-portrait.png';

/* ─── constants ─── */
const CARD_W = 280;
const CARD_H = 490;
const CONTAINER_H = 760;
const ANCHOR_Y = 14;
const SEGMENTS = 10;
const SEG_GAP = 20;

/* smooth path through points */
function buildPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i][0] + pts[i + 1][0]) / 2).toFixed(1);
    const my = ((pts[i][1] + pts[i + 1][1]) / 2).toFixed(1);
    d += ` Q ${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mx},${my}`;
  }
  const l = pts[pts.length - 1];
  d += ` L ${l[0].toFixed(1)},${l[1].toFixed(1)}`;
  return d;
}

export const HangingIDCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Left strap refs
  const leftStrapRef = useRef<SVGPathElement>(null);
  const leftWeaveRef = useRef<SVGPathElement>(null);
  const leftHighRef = useRef<SVGPathElement>(null);
  const leftTextRouteRef = useRef<SVGPathElement>(null);

  // Right strap refs
  const rightStrapRef = useRef<SVGPathElement>(null);
  const rightWeaveRef = useRef<SVGPathElement>(null);
  const rightHighRef = useRef<SVGPathElement>(null);
  const rightTextRouteRef = useRef<SVGPathElement>(null);

  // Clip system refs
  const clipGroupRef = useRef<SVGGElement>(null);
  const vinylStrapRef = useRef<SVGPathElement>(null);
  const snapButtonRef = useRef<SVGCircleElement>(null);
  const snapButtonInnerRef = useRef<SVGCircleElement>(null);

  // Peg refs
  const pegRef = useRef<SVGCircleElement>(null);
  const pegHighRef = useRef<SVGCircleElement>(null);
  const pegScrewRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const leftStrap = leftStrapRef.current;
    const leftWeave = leftWeaveRef.current;
    const leftHigh = leftHighRef.current;
    const leftTextRoute = leftTextRouteRef.current;
    const rightStrap = rightStrapRef.current;
    const rightWeave = rightWeaveRef.current;
    const rightHigh = rightHighRef.current;
    const rightTextRoute = rightTextRouteRef.current;
    const clipGroup = clipGroupRef.current;
    const vinylStrap = vinylStrapRef.current;
    const snapButton = snapButtonRef.current;
    const snapButtonInner = snapButtonInnerRef.current;
    const peg = pegRef.current;
    const pegHigh = pegHighRef.current;
    const pegScrew = pegScrewRef.current;

    if (
      !container || !card || !peg || !pegHigh || !pegScrew ||
      !leftStrap || !leftWeave || !leftHigh || !leftTextRoute ||
      !rightStrap || !rightWeave || !rightHigh || !rightTextRoute ||
      !clipGroup || !vinylStrap || !snapButton || !snapButtonInner
    ) return;

    const W = container.offsetWidth || 320;
    const anchorX = W / 2;
    const anchorY = ANCHOR_Y;

    /* ── Engine ── */
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 4.5 } });

    /* ── Anchor ── */
    const anchorBody = Matter.Bodies.circle(anchorX, anchorY, 5, {
      isStatic: true,
      collisionFilter: { mask: 0 },
    });

    /* ── Rope segments ── */
    const segs: Matter.Body[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      segs.push(
        Matter.Bodies.circle(anchorX, anchorY + (i + 1) * SEG_GAP, 3, {
          mass: 0.3,
          frictionAir: 0.22,
          collisionFilter: { mask: 0 },
        }),
      );
    }

    /* ── Card body ── */
    const cardStartY = anchorY + (SEGMENTS + 1) * SEG_GAP + CARD_H / 2;
    const cardBody = Matter.Bodies.rectangle(anchorX, cardStartY, CARD_W, CARD_H, {
      mass: 6,
      frictionAir: 0.28,
      restitution: 0.01,
      collisionFilter: { mask: 0 },
    });

    /* ── Rope constraints ── */
    const makeLink = (a: Matter.Body, b: Matter.Body, pB?: Matter.Vector) =>
      Matter.Constraint.create({
        bodyA: a, bodyB: b,
        pointA: { x: 0, y: 0 },
        pointB: pB ?? { x: 0, y: 0 },
        length: SEG_GAP,
        stiffness: 0.95,
        damping: 0.18,
        render: { visible: false },
      });

    const links = [
      makeLink(anchorBody, segs[0]),
      ...Array.from({ length: SEGMENTS - 1 }, (_, i) => makeLink(segs[i], segs[i + 1])),
      makeLink(segs[SEGMENTS - 1], cardBody, { x: 0, y: -CARD_H / 2 }),
    ];

    Matter.World.add(engine.world, [anchorBody, ...segs, cardBody, ...links]);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    /* ─────────────────────────────────────────────────────────
       MANUAL DRAG — avoids Matter.js MouseConstraint coord bugs
    ───────────────────────────────────────────────────────── */
    let dragConstraint: Matter.Constraint | null = null;
    let isDragging = false;

    /** Converts window clientX/Y → physics-space coordinates */
    const toLocal = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      // Don't interfere with link clicks
      if ((e.target as HTMLElement).closest('a')) return;

      const pos = toLocal(e.clientX, e.clientY);

      /* Hit-test the card body */
      const hits = Matter.Query.point([cardBody], pos);
      if (hits.length === 0) return;

      e.preventDefault();
      isDragging = true;
      card.style.cursor = 'grabbing';
      container.setPointerCapture(e.pointerId);

      /* Offset in body-local space where user clicked */
      const localX = pos.x - cardBody.position.x;
      const localY = pos.y - cardBody.position.y;

      dragConstraint = Matter.Constraint.create({
        pointA: { x: pos.x, y: pos.y },   // world-space anchor (updated on move)
        bodyB: cardBody,
        pointB: { x: localX, y: localY },  // body-local attach point
        stiffness: 0.25,
        damping: 0.15,
        length: 0,
        render: { visible: false },
      });
      Matter.World.add(engine.world, dragConstraint);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !dragConstraint) return;
      const pos = toLocal(e.clientX, e.clientY);
      // Mutate the constraint anchor point directly
      (dragConstraint as Matter.Constraint & { pointA: Matter.Vector }).pointA.x = pos.x;
      (dragConstraint as Matter.Constraint & { pointA: Matter.Vector }).pointA.y = pos.y;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      card.style.cursor = 'grab';
      container.releasePointerCapture(e.pointerId);
      if (dragConstraint) {
        Matter.World.remove(engine.world, dragConstraint);
        dragConstraint = null;
      }
    };

    /* Attach to CONTAINER so whole area is responsive */
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    /* ── RAF sync loop ── */
    let raf: number;

    const sync = () => {
      const { x, y } = cardBody.position;
      const angle = cardBody.angle;
      const angleDeg = angle * (180 / Math.PI);

      /* Card DOM */
      card.style.left = `${x - CARD_W / 2}px`;
      card.style.top = `${y - CARD_H / 2}px`;
      card.style.transform = `rotate(${angleDeg}deg)`;

      /* Card top-centre in world space via rotation matrix */
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const topX = x + (CARD_H / 2) * sinA;
      const topY = y - (CARD_H / 2) * cosA;

      /* SVG lanyard path (from anchor to the last rope segment) */
      const pts: [number, number][] = [[anchorX, anchorY]];
      segs.forEach(s => pts.push([s.position.x, s.position.y]));

      // Calculate Left and Right strap coordinates using perpendicular normals
      const leftPts: [number, number][] = [];
      const rightPts: [number, number][] = [];

      for (let i = 0; i < pts.length; i++) {
        let dx = 0;
        let dy = 0;

        if (i === 0) {
          dx = pts[1][0] - pts[0][0];
          dy = pts[1][1] - pts[0][1];
        } else if (i === pts.length - 1) {
          dx = pts[i][0] - pts[i - 1][0];
          dy = pts[i][1] - pts[i - 1][1];
        } else {
          dx = pts[i + 1][0] - pts[i - 1][0];
          dy = pts[i + 1][1] - pts[i - 1][1];
        }

        const segmentLen = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / segmentLen;
        const ny = dx / segmentLen;

        // V-shape offset that starts at 18px at the anchor and reduces to 0 at the clip
        const progress = i / (pts.length - 1);
        const offsetDist = 18 * (1 - progress);

        leftPts.push([pts[i][0] + nx * offsetDist, pts[i][1] + ny * offsetDist]);
        rightPts.push([pts[i][0] - nx * offsetDist, pts[i][1] - ny * offsetDist]);
      }

      const dLeft = buildPath(leftPts);
      const dRight = buildPath(rightPts);

      leftStrap.setAttribute('d', dLeft);
      leftWeave.setAttribute('d', dLeft);
      leftHigh.setAttribute('d', dLeft);
      leftTextRoute.setAttribute('d', dLeft);

      rightStrap.setAttribute('d', dRight);
      rightWeave.setAttribute('d', dRight);
      rightHigh.setAttribute('d', dRight);
      rightTextRoute.setAttribute('d', dRight);

      /* Clip / Hook System coordinates */
      const clipX = segs[SEGMENTS - 1].position.x;
      const clipY = segs[SEGMENTS - 1].position.y;

      // Slot is located 20px inside the card from the top edge
      const slotX = topX - 20 * sinA;
      const slotY = topY + 20 * cosA;

      const dxClip = slotX - clipX;
      const dyClip = slotY - clipY;
      const clipDist = Math.sqrt(dxClip * dxClip + dyClip * dyClip) || 1;
      const clipAngleRad = Math.atan2(dyClip, dxClip);
      const clipAngleDeg = clipAngleRad * (180 / Math.PI) - 90;

      // Dynamic transform for the metal clip group
      clipGroup.setAttribute('transform', `translate(${clipX}, ${clipY}) rotate(${clipAngleDeg})`);

      // Vinyl connector strap height updates dynamically
      // vinyl loop goes from swivel hook (y=15) through card slot (y=clipDist)
      const dVinyl = `M -5.5,15 L -5.5,${clipDist + 3} C -5.5,${clipDist + 6} 5.5,${clipDist + 6} 5.5,${clipDist + 3} L 5.5,15 Z`;
      vinylStrap.setAttribute('d', dVinyl);

      // Position vinyl snap button in the middle
      const snapY = 15 + (clipDist - 15) / 2;
      snapButton.setAttribute('cx', '0');
      snapButton.setAttribute('cy', String(snapY));
      snapButtonInner.setAttribute('cx', '0');
      snapButtonInner.setAttribute('cy', String(snapY));

      /* Peg Position */
      const ps = String(anchorX);
      const py = String(anchorY);
      peg.setAttribute('cx', ps); peg.setAttribute('cy', py);
      pegHigh.setAttribute('cx', ps); pegHigh.setAttribute('cy', String(anchorY - 2));
      pegScrew.setAttribute('cx', ps); pegScrew.setAttribute('cy', py);

      raf = requestAnimationFrame(sync);
    };

    raf = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  const socialLinks = [
    { icon: Github, href: demoData.socials.github, label: 'GitHub' },
    { icon: Linkedin, href: demoData.socials.linkedin, label: 'LinkedIn' },
    { icon: SiLeetcode, href: demoData.socials.leetcode, label: 'LeetCode' },
    { icon: Mail, href: `mailto:${demoData.socials.email}`, label: 'Email' },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: CONTAINER_H,
        userSelect: 'none',
        touchAction: 'none',       /* required for pointer events on mobile */
        overflow: 'visible',
      }}
    >
      {/* ── SVG: lanyard + peg ── */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <defs>
          {/* Woven fabric texture pattern */}
          <pattern id="lanyard-weave" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <rect width="10" height="10" fill="#4A8B6F" />
            <path d="M0,0 L5,5 L10,0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
            <path d="M0,10 L5,5 L10,10" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
          </pattern>

          {/* Brushed sage metal gradient for clips */}
          <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d6b55" />
            <stop offset="25%" stopColor="#5a9a7a" />
            <stop offset="50%" stopColor="#8dc4a8" />
            <stop offset="75%" stopColor="#6aad88" />
            <stop offset="85%" stopColor="#4A8B6F" />
            <stop offset="100%" stopColor="#2d5040" />
          </linearGradient>

          {/* Sage gradient for rivets and buttons */}
          <radialGradient id="gold-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#b8e0cc" />
            <stop offset="50%" stopColor="#4A8B6F" />
            <stop offset="100%" stopColor="#1e3a2c" />
          </radialGradient>

          {/* Path routes that text will follow */}
          <path id="leftTextRoute" ref={leftTextRouteRef} d="" />
          <path id="rightTextRoute" ref={rightTextRouteRef} d="" />
        </defs>

        {/* LEFT STRAP SHADOW */}
        <path
          ref={leftStrapRef}
          d="" fill="none"
          stroke="#1e3a2c"
          strokeWidth="28"
          strokeLinecap="round" strokeLinejoin="round"
          opacity="0.18"
          style={{ filter: 'blur(3px)' }}
        />

        {/* RIGHT STRAP SHADOW */}
        <path
          ref={rightStrapRef}
          d="" fill="none"
          stroke="#1e3a2c"
          strokeWidth="28"
          strokeLinecap="round" strokeLinejoin="round"
          opacity="0.18"
          style={{ filter: 'blur(3px)' }}
        />

        {/* LEFT STRAP BASE (woven texture) */}
        <path
          ref={leftWeaveRef}
          d="" fill="none"
          stroke="url(#lanyard-weave)"
          strokeWidth="23"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* RIGHT STRAP BASE (woven texture) */}
        <path
          ref={rightWeaveRef}
          d="" fill="none"
          stroke="url(#lanyard-weave)"
          strokeWidth="23"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* LEFT STRAP HIGHLIGHT */}
        <path
          ref={leftHighRef}
          d="" fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* RIGHT STRAP HIGHLIGHT */}
        <path
          ref={rightHighRef}
          d="" fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* LEFT STRAP TEXT */}
        <text
          fill="#e8f5ee"
          fontSize="9.5"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          letterSpacing="3"
          dominantBaseline="central"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)', pointerEvents: 'none' }}
        >
          <textPath href="#leftTextRoute" startOffset="8%">
            {'PAUL SHERVIN • '.repeat(15)}
          </textPath>
        </text>

        {/* RIGHT STRAP TEXT */}
        <text
          fill="#e8f5ee"
          fontSize="9.5"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          letterSpacing="3"
          dominantBaseline="central"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)', pointerEvents: 'none' }}
        >
          <textPath href="#rightTextRoute" startOffset="8%">
            {'PAUL SHERVIN • '.repeat(15)}
          </textPath>
        </text>

        {/* Peg / Mount */}
        <circle ref={pegRef} r="14" fill="url(#metal-grad)" stroke="#1e3a2c" strokeWidth="2.5" />
        <circle ref={pegHighRef} r="7" fill="url(#gold-grad)" />
        <circle ref={pegScrewRef} r="2.5" fill="#1e3a2c" />

        {/* Metallic Clip System */}
        <g ref={clipGroupRef} style={{ pointerEvents: 'none' }}>
          {/* Strap clasp / crimp (metal band clamping the two strap ends) */}
          <rect
            x="-14" y="-8" width="28" height="16" rx="3"
            fill="url(#metal-grad)"
            stroke="#1e3a2c" strokeWidth="1"
          />
          <circle cx="0" cy="0" r="3.5" fill="url(#gold-grad)" stroke="#1e3a2c" strokeWidth="0.8" />

          {/* D-Ring */}
          <path
            d="M-9,8 L-9,12 A9,9 0 0 0 9,12 L9,8"
            fill="none"
            stroke="url(#metal-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Swivel metal loop */}
          <rect
            x="-4.5" y="15" width="9" height="5" rx="1.5"
            fill="url(#metal-grad)"
            stroke="#1e3a2c" strokeWidth="0.8"
          />

          {/* Vinyl connector strap */}
          <path
            ref={vinylStrapRef}
            d=""
            fill="rgba(255,255,255,0.4)"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1.2"
            style={{ backdropFilter: 'blur(1px)' }}
          />

          {/* Vinyl strap snap button */}
          <circle
            ref={snapButtonRef}
            cx="0" cy="0" r="5"
            fill="url(#metal-grad)"
            stroke="#1e3a2c" strokeWidth="0.8"
          />
          <circle
            ref={snapButtonInnerRef}
            cx="0" cy="0" r="2"
            fill="#1e3a2c"
          />
        </g>
      </svg>

      {/* ── DOM card ── */}
      <div
        ref={cardRef}
        style={{
          position: 'absolute',
          width: CARD_W,
          height: CARD_H,
          cursor: 'grab',
          transformOrigin: 'center center',
          willChange: 'transform, left, top',
          zIndex: 10,
          borderRadius: 20,
          background: 'linear-gradient(165deg,#f7faf8 0%,#eef5f0 55%,#dfeae2 100%)',
          border: '1.5px solid rgba(74,139,111,0.35)',
          boxShadow: '0 28px 70px -12px rgba(30,58,44,0.22),0 8px 24px -6px rgba(30,58,44,0.12),inset 0 1px 0 rgba(255,255,255,0.95)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Badge slot */}
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          width: 36, height: 8, borderRadius: 4,
          background: '#0f1f18',
          border: '1.5px solid rgba(74,139,111,0.5)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.1)',
          zIndex: 3,
        }} />

        {/* Top stripe */}
        <div style={{
          width: '100%', height: 72, flexShrink: 0,
          background: 'linear-gradient(135deg,#4A8B6F 0%,#3d7a60 50%,#2d5a46 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 1px,transparent 0,transparent 50%)',
            backgroundSize: '6px 6px'
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: 700,
            letterSpacing: 3.5, fontFamily: 'Inter,sans-serif', textTransform: 'uppercase', position: 'relative'
          }}>
            AI &amp; ML • 2026
          </span>
        </div>

        {/* Avatar */}
        <div style={{ marginTop: -34, position: 'relative', zIndex: 2, flexShrink: 0 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg,#4A8B6F,#3d7a60)', padding: 3,
            boxShadow: '0 4px 18px rgba(30,58,44,0.35)'
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img
                src={portrait}
                alt="Paul Shervin avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Name & role */}
        <div style={{ textAlign: 'center', padding: '11px 20px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a2c', fontFamily: 'Karla, sans-serif', lineHeight: 1.2 }}>
            {demoData.meta.name}
          </div>
          <div style={{ fontSize: 13, color: '#4A8B6F', fontWeight: 600, marginTop: 4, letterSpacing: 0.5, fontFamily: 'Karla, sans-serif' }}>
            {demoData.meta.role}
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, flexShrink: 0 }}>
          <MapPin size={12} color="#3d7a60" />
          <span style={{ fontSize: 11, color: '#2d5a46', fontFamily: 'Karla, sans-serif' }}>
            {demoData.meta.location}
          </span>
        </div>

        {/* Divider */}
        <div style={{
          width: 'calc(100% - 40px)', height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(74,139,111,0.4),transparent)',
          margin: '11px 20px 0', flexShrink: 0
        }} />

        {/* Skill chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '9px 14px 0', justifyContent: 'center', flexShrink: 0 }}>
          {['Machine Learning', 'Deep Learning', 'Generative AI'].map(s => (
            <span key={s} style={{
              fontSize: 10, fontWeight: 600, color: '#2d5a46',
              background: 'rgba(74,139,111,0.14)', border: '1px solid rgba(74,139,111,0.3)',
              borderRadius: 20, padding: '4px 10px', fontFamily: 'Karla, sans-serif'
            }}>{s}</span>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, padding: '10px 16px 0', width: '100%', flexShrink: 0 }}>
          {[{ val: demoData.leetcode.rating, label: 'LC Rating' }, { val: demoData.leetcode.streak, label: 'Day Streak' }].map(({ val, label }) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center', padding: '10px 4px',
              background: 'rgba(74,139,111,0.1)', borderRadius: 12, border: '1px solid rgba(74,139,111,0.22)'
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#4A8B6F', fontFamily: 'Karla, sans-serif' }}>{val}</div>
              <div style={{ fontSize: 10, color: '#5a8a72', fontFamily: 'Karla, sans-serif', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px 0', justifyContent: 'center', flexShrink: 0 }}>
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              title={label}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(74,139,111,0.12)', border: '1px solid rgba(74,139,111,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#2d5a46', textDecoration: 'none'
              }}>
              <Icon size={15} />
            </a>
          ))}
        </div>

        {/* Barcode strip */}
        <div style={{
          marginTop: 'auto', width: '100%', padding: '7px 14px',
          background: 'rgba(74,139,111,0.07)', borderTop: '1px solid rgba(74,139,111,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {[3, 1, 4, 1, 5, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3].map((h, i) => (
              <div key={i} style={{ width: 1.5, height: h * 2 + 5, background: '#2d5a46', borderRadius: 1, opacity: 0.72 }} />
            ))}
          </div>
          <span style={{ fontSize: 8, color: '#3d7a60', fontFamily: 'monospace', letterSpacing: 1.2 }}>PS-2026-AIML</span>
        </div>
      </div>
    </div>
  );
};
