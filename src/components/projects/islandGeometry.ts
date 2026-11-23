import * as THREE from 'three';

export const ISLAND_BASE_R = 4.3;
export const PLOT_RADIUS = 2.6;
export const PLAZA_RADIUS = 0.7;
export const RING_INNER = 1.05;
export const RING_OUTER = 1.35;
export const PAD_RADIUS = 0.85;

/** Organic island outline: base radius plus a few low-frequency waves. */
export const radiusAt = (angle: number): number =>
  ISLAND_BASE_R + 0.32 * Math.sin(3 * angle + 1.3) + 0.22 * Math.sin(5 * angle + 0.4) + 0.12 * Math.sin(8 * angle + 2.1);

export const mulberry32 = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Angle of plot `i` around the island (0 = towards the camera). */
export const plotAngle = (index: number, count: number): number => (index / Math.max(1, count)) * Math.PI * 2;

/** Angle halfway between two plots; the river runs along it, clear of the plots and spokes. */
export const riverAngle = (count: number): number => (count > 1 ? plotAngle(0, count) + Math.PI / count : Math.PI);

const SEGMENTS = 96;

interface SideRing {
  y: number;
  scale: number;
  color: string;
  jitter: number;
}

const SIDE_RINGS: SideRing[] = [
  { y: 0, scale: 1, color: '#78a84c', jitter: 0 },
  { y: -0.2, scale: 1, color: '#5a8a3a', jitter: 0 },
  { y: -0.42, scale: 0.99, color: '#7b5b3b', jitter: 0.04 },
  { y: -1.0, scale: 0.93, color: '#8d867a', jitter: 0.3 },
  { y: -1.65, scale: 0.8, color: '#756e63', jitter: 0.32 },
  { y: -2.3, scale: 0.5, color: '#655f56', jitter: 0.25 },
];

const TOP_FRACTIONS = [0.38, 0.68, 0.9, 1];

/** Low-poly island: grassy top disc plus a stratified rock underside, flat-shaded with vertex colours. */
export const buildTerrainGeometry = (): THREE.BufferGeometry => {
  const rand = mulberry32(11);
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const tmp = new THREE.Color();

  const pushVertex = (x: number, y: number, z: number, color: string, shade = 0) => {
    positions.push(x, y, z);
    tmp.set(color);
    if (shade) tmp.offsetHSL(0, 0, shade);
    colors.push(tmp.r, tmp.g, tmp.b);
    return positions.length / 3 - 1;
  };

  // top centre
  const centre = pushVertex(0, 0.02, 0, '#86b35a');
  const layers: number[][] = [];

  // top rings (the last one coincides with the first side ring)
  TOP_FRACTIONS.forEach((fraction, k) => {
    const isEdge = k === TOP_FRACTIONS.length - 1;
    const layer: number[] = [];
    for (let i = 0; i < SEGMENTS; i += 1) {
      const a = (i / SEGMENTS) * Math.PI * 2;
      const r = radiusAt(a) * fraction;
      const bump = isEdge ? 0 : (rand() - 0.5) * 0.05;
      layer.push(pushVertex(r * Math.sin(a), 0.02 + bump, r * Math.cos(a), '#7aa84e', (rand() - 0.5) * 0.06));
    }
    layers.push(layer);
  });

  // side rings (skip the first one: it is the top edge)
  SIDE_RINGS.slice(1).forEach((ring) => {
    const layer: number[] = [];
    for (let i = 0; i < SEGMENTS; i += 1) {
      const a = (i / SEGMENTS) * Math.PI * 2;
      const r = radiusAt(a) * ring.scale + (rand() - 0.5) * ring.jitter;
      const y = ring.y + (rand() - 0.5) * ring.jitter * 0.35;
      layer.push(pushVertex(r * Math.sin(a), y, r * Math.cos(a), ring.color, (rand() - 0.5) * 0.05));
    }
    layers.push(layer);
  });

  const bottom = pushVertex(0, -2.55, 0, '#5c564e');

  // centre fan (faces up)
  const first = layers[0];
  for (let i = 0; i < SEGMENTS; i += 1) {
    indices.push(centre, first[i], first[(i + 1) % SEGMENTS]);
  }
  // quads between consecutive layers (outward/upward facing)
  for (let l = 0; l < layers.length - 1; l += 1) {
    const inner = layers[l];
    const outer = layers[l + 1];
    for (let i = 0; i < SEGMENTS; i += 1) {
      const j = (i + 1) % SEGMENTS;
      indices.push(inner[i], outer[i], inner[j]);
      indices.push(inner[j], outer[i], outer[j]);
    }
  }
  // bottom fan (faces down)
  const last = layers[layers.length - 1];
  for (let i = 0; i < SEGMENTS; i += 1) {
    indices.push(last[i], bottom, last[(i + 1) % SEGMENTS]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  const flat = geometry.toNonIndexed();
  flat.computeVertexNormals();
  geometry.dispose();
  return flat;
};

/** Soft radial blob used as the island's ground shadow. */
export const buildShadowTexture = (): THREE.CanvasTexture => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(52,64,48,0.42)');
    gradient.addColorStop(0.55, 'rgba(52,64,48,0.18)');
    gradient.addColorStop(1, 'rgba(52,64,48,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};
