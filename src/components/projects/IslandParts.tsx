import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import {
  ISLAND_BASE_R,
  PAD_RADIUS,
  PLAZA_RADIUS,
  PLOT_RADIUS,
  RING_INNER,
  RING_OUTER,
  buildShadowTexture,
  buildTerrainGeometry,
  mulberry32,
  plotAngle,
  radiusAt,
  riverAngle,
} from './islandGeometry';

/* ── placement ── */

interface Item {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotY: number;
  color: string;
}

const PINE_COLORS = ['#3f6b3a', '#35603a', '#2e5a35', '#46733f'];
const ROUND_COLORS = ['#6a9a45', '#5d9040', '#7aa84f', '#64a04a'];
const ROCK_COLORS = ['#8d887f', '#7d786f', '#9a958a'];

const distanceToSegment = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
  const abx = bx - ax;
  const abz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / (abx * abx + abz * abz || 1)));
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
};

const riverPoint = (angle: number, t: number): THREE.Vector3 => {
  const radius = 1.75 + t * (radiusAt(angle) - 1.75 - 0.12);
  const a = angle + 0.1 * Math.sin(t * 6.5);
  return new THREE.Vector3(radius * Math.sin(a), 0.045, radius * Math.cos(a));
};

interface Layout {
  pines: { trunks: Item[]; lower: Item[]; upper: Item[] };
  rounds: { trunks: Item[]; blobs: Item[] };
  rocks: Item[];
}

const buildLayout = (count: number): Layout => {
  const rand = mulberry32(42);
  const riverA = riverAngle(count);
  const riverSamples = Array.from({ length: 16 }, (_, i) => riverPoint(riverA, i / 15));
  const plots = Array.from({ length: count }, (_, i) => {
    const a = plotAngle(i, count);
    return { x: PLOT_RADIUS * Math.sin(a), z: PLOT_RADIUS * Math.cos(a), a };
  });

  const isClear = (x: number, z: number, margin: number) => {
    const r = Math.hypot(x, z);
    if (r < PLAZA_RADIUS + 0.25) return false;
    if (r > RING_INNER - 0.1 && r < RING_OUTER + 0.12) return false;
    if (plots.some((p) => Math.hypot(x - p.x, z - p.z) < PAD_RADIUS + margin)) return false;
    if (plots.some((p) => distanceToSegment(x, z, 0, 0, p.x, p.z) < 0.32)) return false;
    if (riverSamples.some((s) => Math.hypot(x - s.x, z - s.z) < 0.4)) return false;
    return true;
  };

  const pines = { trunks: [] as Item[], lower: [] as Item[], upper: [] as Item[] };
  const rounds = { trunks: [] as Item[], blobs: [] as Item[] };
  const pick = (list: string[]) => list[Math.floor(rand() * list.length)];
  const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  let placed = 0;
  let guard = 0;
  while (placed < 46 && guard < 2000) {
    guard += 1;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (radiusAt(a) - 0.4);
    const x = r * Math.sin(a);
    const z = r * Math.cos(a);
    if (!isClear(x, z, 0.55)) continue;
    const size = 0.75 + rand() * 0.6;
    const rot = rand() * Math.PI * 2;
    const trunkColor = '#6b4d33';
    const trunk = { position: vec(x, 0.14 * size, z), scale: vec(size, size, size), rotY: rot, color: trunkColor };
    if (rand() < 0.4) {
      pines.trunks.push(trunk);
      pines.lower.push({ position: vec(x, 0.5 * size, z), scale: vec(size, size, size), rotY: rot, color: pick(PINE_COLORS) });
      pines.upper.push({ position: vec(x, 0.82 * size, z), scale: vec(size * 0.68, size * 0.78, size * 0.68), rotY: rot, color: pick(PINE_COLORS) });
    } else {
      rounds.trunks.push(trunk);
      rounds.blobs.push({ position: vec(x, 0.58 * size, z), scale: vec(size, size * 0.92, size), rotY: rot, color: pick(ROUND_COLORS) });
      rounds.blobs.push({
        position: vec(x + 0.1 * size, 0.78 * size, z - 0.06 * size),
        scale: vec(size * 0.72, size * 0.7, size * 0.72),
        rotY: rot,
        color: pick(ROUND_COLORS),
      });
    }
    placed += 1;
  }

  const rocks: Item[] = [];
  for (let i = 0; i < 12; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = radiusAt(a) - 0.18 - rand() * 0.5;
    const s = 0.14 + rand() * 0.24;
    rocks.push({ position: vec(r * Math.sin(a), s * 0.35, r * Math.cos(a)), scale: vec(s * 1.2, s, s), rotY: rand() * 3, color: pick(ROCK_COLORS) });
  }
  return { pines, rounds, rocks };
};

/* ── instanced meshes ── */

const Instanced = ({ items, children }: { items: Item[]; children: ReactNode }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const color = new THREE.Color();
    items.forEach((item, i) => {
      quat.setFromEuler(new THREE.Euler(0, item.rotY, 0));
      matrix.compose(item.position, quat, item.scale);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color.set(item.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [items]);
  if (items.length === 0) return null;
  return (
    <instancedMesh key={items.length} ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      {children}
      <meshStandardMaterial flatShading roughness={0.9} />
    </instancedMesh>
  );
};

/* ── scenery ── */

export const Terrain = () => {
  const geometry = useMemo(buildTerrainGeometry, []);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} />
    </mesh>
  );
};

export const Vegetation = ({ count }: { count: number }) => {
  const layout = useMemo(() => buildLayout(count), [count]);
  return (
    <group>
      <Instanced items={[...layout.pines.trunks, ...layout.rounds.trunks]}>
        <cylinderGeometry args={[0.04, 0.06, 0.28, 6]} />
      </Instanced>
      <Instanced items={layout.pines.lower}>
        <coneGeometry args={[0.3, 0.55, 7]} />
      </Instanced>
      <Instanced items={layout.pines.upper}>
        <coneGeometry args={[0.3, 0.5, 7]} />
      </Instanced>
      <Instanced items={layout.rounds.blobs}>
        <icosahedronGeometry args={[0.3, 0]} />
      </Instanced>
      <Instanced items={layout.rocks}>
        <dodecahedronGeometry args={[1, 0]} />
      </Instanced>
    </group>
  );
};

const GLOW_COLOR = '#ffcf7a';

export const Plaza = () => (
  <group>
    <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[PLAZA_RADIUS, PLAZA_RADIUS + 0.04, 0.1, 40]} />
      <meshStandardMaterial color="#efe5cc" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.112, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[PLAZA_RADIUS - 0.08, PLAZA_RADIUS - 0.04, 48]} />
      <meshBasicMaterial color={GLOW_COLOR} toneMapped={false} />
    </mesh>
    {/* fountain */}
    <mesh position={[0, 0.17, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.34, 0.14, 24]} />
      <meshStandardMaterial color="#d8cfba" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.26, 24]} />
      <meshStandardMaterial color="#7cc0dc" roughness={0.2} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.34, 0]} castShadow>
      <sphereGeometry args={[0.07, 12, 10]} />
      <meshStandardMaterial color="#cfe8f2" roughness={0.3} />
    </mesh>
  </group>
);

export const Roads = ({ count }: { count: number }) => {
  const spokes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = plotAngle(i, count);
        return { a, key: i };
      }),
    [count]
  );
  const spokeLength = (from: number, to: number) => ({ mid: (from + to) / 2, len: to - from });
  const inner = spokeLength(PLAZA_RADIUS - 0.04, RING_INNER + 0.02);
  const outer = spokeLength(RING_OUTER - 0.02, PLOT_RADIUS - PAD_RADIUS + 0.06);

  return (
    <group>
      <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[RING_INNER, RING_OUTER, 72]} />
        <meshStandardMaterial color="#e2d8c0" roughness={0.9} />
      </mesh>
      {[RING_INNER - 0.03, RING_OUTER].map((r) => (
        <mesh key={r} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.03, 72]} />
          <meshBasicMaterial color={GLOW_COLOR} toneMapped={false} />
        </mesh>
      ))}
      {spokes.map(({ a, key }) => (
        <group key={key} rotation={[0, a, 0]}>
          {[inner, outer].map(({ mid, len }) => (
            <mesh key={mid} position={[0, 0.044, mid]} receiveShadow>
              <boxGeometry args={[0.26, 0.02, len]} />
              <meshStandardMaterial color="#e2d8c0" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export const River = ({ count }: { count: number }) => {
  const angle = riverAngle(count);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => riverPoint(angle, i / 11))), [angle]);
  const edge = useMemo(() => riverPoint(angle, 1), [angle]);
  const edgeAngle = Math.atan2(edge.x, edge.z);
  return (
    <group>
      <mesh position={[riverPoint(angle, 0).x, 0.05, riverPoint(angle, 0).z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 20]} />
        <meshStandardMaterial color="#79bcd8" roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh scale={[1, 0.18, 1]} receiveShadow>
        <tubeGeometry args={[curve, 48, 0.13, 8, false]} />
        <meshStandardMaterial color="#79bcd8" roughness={0.2} metalness={0.15} />
      </mesh>
      {/* waterfall over the rim */}
      <group position={[edge.x, 0.02, edge.z]} rotation={[0, edgeAngle, 0]}>
        <mesh position={[0, -0.85, -0.06]} rotation={[0.42, 0, 0]}>
          <planeGeometry args={[0.28, 1.9]} />
          <meshStandardMaterial color="#b7e0ef" roughness={0.3} transparent opacity={0.88} emissive="#9fd3e6" emissiveIntensity={0.25} side={THREE.DoubleSide} />
        </mesh>
        {[-0.1, 0.02, 0.12].map((x) => (
          <mesh key={x} position={[x, -1.6, -0.46]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#f4fbfd" roughness={0.9} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Soft shadow blob on the ground beneath the island. */
export const GroundShadow = () => {
  const texture = useMemo(buildShadowTexture, []);
  return (
    <mesh position={[0, -2.62, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[ISLAND_BASE_R * 3.4, ISLAND_BASE_R * 3.4]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
};
