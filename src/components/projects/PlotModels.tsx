import { useContext, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionContext } from './motionContext';
import type { PlotKind } from './projectTheme';

type V3 = [number, number, number];

const GOLD = '#d9a83a';
const STONE = '#e2dac9';

/* ── primitives ── */

interface BlockProps {
  p: V3;
  s: V3;
  color?: string;
  material?: THREE.Material;
  rotY?: number;
  rough?: number;
  metal?: number;
  opacity?: number;
}

const Block = ({ p, s, color = STONE, material, rotY = 0, rough = 0.85, metal = 0, opacity = 1 }: BlockProps) => (
  <mesh position={p} rotation={[0, rotY, 0]} castShadow receiveShadow material={material}>
    <boxGeometry args={s} />
    {!material && (
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} transparent={opacity < 1} opacity={opacity} />
    )}
  </mesh>
);

const Cyl = ({ p, r, h, color, segments = 12 }: { p: V3; r: number; h: number; color: string; segments?: number }) => (
  <mesh position={p} castShadow receiveShadow>
    <cylinderGeometry args={[r, r, h, segments]} />
    <meshStandardMaterial color={color} roughness={0.8} />
  </mesh>
);

/** Triangular prism: triangle in the xy plane (apex up) extruded along z. Used for roofs and pediments. */
const Prism = ({ p, w, h, d, color }: { p: V3; w: number; h: number; d: number; color: string }) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(0, h);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    return g;
  }, [w, h, d]);
  return (
    <mesh position={p} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

/** Window material whose glow rises when the plot is selected. */
const useGlow = (selected: boolean) => {
  const { reduced } = useContext(MotionContext);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffe9c4',
        emissive: new THREE.Color('#ffb45a'),
        emissiveIntensity: 0.45,
        roughness: 0.4,
      }),
    []
  );
  const target = selected ? 1.9 : 0.45;
  if (reduced) material.emissiveIntensity = target;
  useFrame((_, dt) => {
    material.emissiveIntensity = THREE.MathUtils.damp(material.emissiveIntensity, target, 4, dt);
  });
  return material;
};

/** Row of windows on a facade at depth z. Each entry: [x, y, width, height]. */
const Windows = ({ list, z, material }: { list: [number, number, number, number][]; z: number; material: THREE.Material }) => (
  <>
    {list.map(([x, y, w, h]) => (
      <Block key={`${x}-${y}`} p={[x, y, z]} s={[w, h, 0.02]} material={material} />
    ))}
  </>
);

/** Gentle vertical float for emblems; static under reduced motion. */
const Floating = ({ children, y, amplitude = 0.05 }: { children: ReactNode; y: number; amplitude?: number }) => {
  const { reduced } = useContext(MotionContext);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && !reduced) ref.current.position.y = y + Math.sin(clock.elapsedTime * 1.4) * amplitude;
  });
  return (
    <group ref={ref} position={[0, y, 0]}>
      {children}
    </group>
  );
};

/* ── environments ── */

interface ModelProps {
  selected: boolean;
}

const School = ({ selected }: ModelProps) => {
  const glow = useGlow(selected);
  return (
    <group>
      <Block p={[0, 0.05, 0.35]} s={[1.3, 0.1, 0.4]} color="#d6cdbb" />
      <Block p={[0, 0.45, 0]} s={[1.2, 0.7, 0.65]} color="#e4dccb" />
      <Block p={[0, 0.85, 0]} s={[1.28, 0.08, 0.72]} color="#b9a98f" />
      <Block p={[0, 1.1, -0.05]} s={[0.4, 0.4, 0.4]} color="#e8e0cf" />
      <mesh position={[0, 1.42, -0.05]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.32, 0.25, 4]} />
        <meshStandardMaterial color="#8a6f58" roughness={0.8} />
      </mesh>
      {[-0.45, -0.15, 0.15, 0.45].map((x) => (
        <Cyl key={x} p={[x, 0.45, 0.4]} r={0.04} h={0.7} color="#f4efe4" />
      ))}
      <Windows
        z={0.33}
        material={glow}
        list={[[-0.54, 0.52, 0.1, 0.2], [-0.27, 0.52, 0.1, 0.2], [0, 0.52, 0.1, 0.2], [0.27, 0.52, 0.1, 0.2], [0.54, 0.52, 0.1, 0.2]]}
      />
      <Floating y={1.95}>
        <Block p={[0, 0, 0]} s={[0.55, 0.045, 0.55]} rotY={Math.PI / 4} color="#2f7a58" rough={0.5} />
        <Cyl p={[0, -0.1, 0]} r={0.16} h={0.16} color="#2f7a58" />
        <Block p={[0.2, -0.1, 0.2]} s={[0.02, 0.2, 0.02]} color={GOLD} />
      </Floating>
    </group>
  );
};

const Scales = ({ selected }: ModelProps) => {
  const glow = useGlow(selected);
  const beam = useRef<THREE.Group>(null);
  const { reduced } = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (beam.current && !reduced) beam.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.06;
  });
  return (
    <group>
      <Block p={[0, 0.5, 0]} s={[1.15, 0.8, 0.6]} color="#d8d0c0" />
      <Block p={[0, 0.94, 0.02]} s={[1.25, 0.08, 0.7]} color="#bfb5a2" />
      <Prism p={[0, 0.98, 0.02]} w={1.2} h={0.3} d={0.68} color="#cfc6b3" />
      <Block p={[0, 0.3, 0.31]} s={[0.22, 0.4, 0.03]} color="#a8423a" />
      <Windows
        z={0.31}
        material={glow}
        list={[[-0.45, 0.68, 0.14, 0.2], [-0.2, 0.68, 0.14, 0.2], [0.2, 0.68, 0.14, 0.2], [0.45, 0.68, 0.14, 0.2], [-0.45, 0.35, 0.14, 0.2], [0.45, 0.35, 0.14, 0.2]]}
      />
      <group position={[0, 1.48, 0.02]}>
        <Block p={[0, 0.1, 0]} s={[0.04, 0.5, 0.04]} color={GOLD} metal={0.4} rough={0.4} />
        <group ref={beam} position={[0, 0.36, 0]}>
          <Block p={[0, 0, 0]} s={[0.72, 0.035, 0.035]} color={GOLD} metal={0.4} rough={0.4} />
          {[-0.3, 0.3].map((x) => (
            <group key={x}>
              <Block p={[x, -0.15, 0]} s={[0.01, 0.3, 0.01]} color={GOLD} />
              <Cyl p={[x, -0.31, 0]} r={0.13} h={0.02} color={GOLD} segments={16} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};

const Station = ({ selected }: ModelProps) => {
  const glow = useGlow(selected);
  return (
    <group>
      <Block p={[0, 0.06, 0]} s={[1.7, 0.12, 0.85]} color="#cfc8ba" />
      <Block p={[0, 0.3, -0.3]} s={[0.7, 0.36, 0.22]} color="#ddd3c1" />
      <Block p={[0, 0.5, -0.3]} s={[0.78, 0.06, 0.28]} color="#8a6f58" />
      <Windows z={-0.18} material={glow} list={[[-0.2, 0.32, 0.12, 0.16], [0.2, 0.32, 0.12, 0.16]]} />
      {[-0.66, 0.66].flatMap((x) => [-0.12, 0.2].map((z) => <Cyl key={`${x}-${z}`} p={[x, 0.45, z]} r={0.03} h={0.66} color="#6a7d80" segments={8} />))}
      <Block p={[0, 0.82, 0.04]} s={[1.65, 0.06, 0.55]} color="#5f8d92" />
      <Block p={[0, 0.14, 0.34]} s={[1.7, 0.03, 0.04]} color="#555a5c" />
      <Block p={[0, 0.14, 0.44]} s={[1.7, 0.03, 0.04]} color="#555a5c" />
      <Block p={[0, 0.34, 0.39]} s={[1.4, 0.32, 0.28]} color="#e7eceb" rough={0.5} />
      <Block p={[0.72, 0.31, 0.39]} s={[0.14, 0.26, 0.25]} color="#d3dbd8" />
      <Block p={[0, 0.3, 0.532]} s={[1.4, 0.07, 0.01]} color="#2f7a58" />
      <Windows z={0.535} material={glow} list={[[-0.5, 0.4, 0.14, 0.1], [-0.25, 0.4, 0.14, 0.1], [0, 0.4, 0.14, 0.1], [0.25, 0.4, 0.14, 0.1], [0.5, 0.4, 0.14, 0.1]]} />
    </group>
  );
};

const Bars = ({ selected }: ModelProps) => {
  const glow = useGlow(selected);
  const glass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#a4c8d8', metalness: 0.35, roughness: 0.15, transparent: true, opacity: 0.92 }),
    []
  );
  return (
    <group>
      <Block p={[-0.25, 0.65, -0.05]} s={[0.6, 1.2, 0.55]} material={glass} />
      {[0.25, 0.43, 0.61, 0.79, 0.97, 1.15].map((y) => (
        <Block key={y} p={[-0.25, y, 0.226]} s={[0.56, 0.05, 0.01]} color="#5d8aa0" />
      ))}
      <Windows z={0.23} material={glow} list={[[-0.42, 0.34, 0.08, 0.08], [-0.25, 0.7, 0.08, 0.08], [-0.08, 0.52, 0.08, 0.08], [-0.42, 1.06, 0.08, 0.08]]} />
      <Block p={[-0.25, 1.28, -0.05]} s={[0.66, 0.06, 0.62]} color="#7e9aa6" />
      <Block p={[0.5, 0.07, 0.2]} s={[0.85, 0.05, 0.5]} color="#efe7d6" />
      {[
        { x: 0.22, h: 0.28, c: '#a6d284' },
        { x: 0.42, h: 0.48, c: '#7ab85e' },
        { x: 0.62, h: 0.72, c: '#5aa04c' },
        { x: 0.82, h: 0.98, c: '#2f7a58' },
      ].map(({ x, h, c }) => (
        <Block key={x} p={[x, 0.095 + h / 2, 0.2]} s={[0.13, h, 0.13]} color={c} rough={0.55} />
      ))}
    </group>
  );
};

const heartGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.45);
  shape.bezierCurveTo(-0.15, -0.3, -0.5, -0.1, -0.5, 0.15);
  shape.bezierCurveTo(-0.5, 0.4, -0.2, 0.5, 0, 0.3);
  shape.bezierCurveTo(0.2, 0.5, 0.5, 0.4, 0.5, 0.15);
  shape.bezierCurveTo(0.5, -0.1, 0.15, -0.3, 0, -0.45);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  g.translate(0, 0, -0.08);
  return g;
};

const Cottage = ({ selected }: ModelProps) => {
  const glow = useGlow(selected);
  const heart = useMemo(heartGeometry, []);
  return (
    <group>
      <Block p={[0, 0.06, 0.45]} s={[0.5, 0.06, 0.3]} color="#d2c8b4" />
      <Block p={[0, 0.38, 0]} s={[0.95, 0.65, 0.7]} color="#efe9df" />
      <Prism p={[0, 0.7, 0]} w={1.12} h={0.42} d={0.82} color="#6b7b8a" />
      <Block p={[0.3, 1.0, -0.1]} s={[0.12, 0.3, 0.12]} color="#9a8c7c" />
      <Block p={[-0.2, 0.25, 0.355]} s={[0.18, 0.36, 0.02]} color="#8a5a3c" />
      <Windows z={0.356} material={glow} list={[[0.22, 0.42, 0.2, 0.2]]} />
      <Block p={[0.478, 0.42, 0.05]} s={[0.02, 0.2, 0.2]} material={glow} />
      <Floating y={1.55} amplitude={0.06}>
        <mesh geometry={heart} scale={0.34} castShadow>
          <meshStandardMaterial color="#e0705f" roughness={0.45} emissive="#e0705f" emissiveIntensity={0.25} />
        </mesh>
      </Floating>
    </group>
  );
};

const MODELS: Record<PlotKind, (props: ModelProps) => JSX.Element> = {
  school: School,
  scales: Scales,
  station: Station,
  bars: Bars,
  cottage: Cottage,
};

export const PlotModel = ({ kind, selected }: { kind: PlotKind; selected: boolean }) => {
  const Model = MODELS[kind];
  return <Model selected={selected} />;
};
