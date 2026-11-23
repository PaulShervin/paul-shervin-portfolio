import { useContext, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroundShadow, Plaza, River, Roads, Terrain, Vegetation } from './IslandParts';
import { PAD_RADIUS, PLOT_RADIUS, plotAngle } from './islandGeometry';
import { MotionContext } from './motionContext';
import { PlotModel } from './PlotModels';
import type { PlotKind } from './projectTheme';

export interface IslandPlot {
  id: string;
  title: string;
  kind: PlotKind;
  icon: LucideIcon;
}

interface IslandSceneProps {
  plots: IslandPlot[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Pause rendering while the section is off-screen. */
  visible: boolean;
  reduced: boolean;
  compact: boolean;
}

const CAMERA_DIR = new THREE.Vector3(0, 0.5, 0.866).normalize();
const BASE_DISTANCE = 13;
const FIT_WIDTH = 9.6;          // world units of island width that must always fit horizontally
const FOV = 30;
const PLOT_SCALE = 1.14;
const LOOK_AT = new THREE.Vector3(0, -0.45, 0);
const LABEL_LOCAL = new THREE.Vector3(0, 0.25, 0.78);

const TAU = Math.PI * 2;
const shortestDelta = (from: number, to: number) => ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

/* ── highlight under the selected plot ── */

const Pad = ({ selected }: { selected: boolean }) => {
  const ring = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const { reduced } = useContext(MotionContext);
  useFrame(({ clock }, dt) => {
    const pulse = reduced ? 1 : 0.75 + Math.sin(clock.elapsedTime * 2.2) * 0.25;
    if (ring.current) {
      const material = ring.current.material as THREE.MeshBasicMaterial;
      material.opacity = THREE.MathUtils.damp(material.opacity, selected ? 0.55 + pulse * 0.4 : 0, 5, dt);
    }
    if (light.current) light.current.intensity = THREE.MathUtils.damp(light.current.intensity, selected ? 5.5 : 0, 4, dt);
  });
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[PAD_RADIUS, PAD_RADIUS + 0.03, 0.1, 40]} />
        <meshStandardMaterial color="#efe7d6" roughness={0.9} />
      </mesh>
      <mesh ref={ring} position={[0, 0.118, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PAD_RADIUS - 0.1, PAD_RADIUS - 0.04, 48]} />
        <meshBasicMaterial color="#ffcf7a" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <pointLight ref={light} position={[0, 1.2, 0.3]} color="#ffc878" intensity={0} distance={3.2} decay={2} />
    </group>
  );
};

/* ── world: the rotating island plus camera rig ── */

interface WorldProps extends IslandSceneProps {
  labelRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
}

const World = ({ plots, activeIndex, visible, reduced, labelRefs }: WorldProps) => {
  const island = useRef<THREE.Group>(null);
  const rotation = useRef(0);
  const pulse = useRef(0);
  const { invalidate } = useThree();
  const labelWorld = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const count = plots.length;

  const targetRotation = -plotAngle(activeIndex, count);

  useEffect(() => {
    pulse.current = 1;
    if (reduced) {
      rotation.current = targetRotation;
      invalidate();
    }
  }, [activeIndex, targetRotation, reduced, invalidate]);

  useFrame((state, dt) => {
    const group = island.current;
    if (!group) return;
    const { camera, pointer, size, clock } = state;

    // swing the island so the selected plot faces the camera (shortest way round)
    if (reduced) {
      rotation.current = targetRotation;
    } else {
      rotation.current += shortestDelta(rotation.current, targetRotation) * (1 - Math.exp(-4.2 * dt));
    }
    group.rotation.y = rotation.current;
    group.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.045;

    // cinematic nudge on every project change
    pulse.current *= Math.exp(-3 * dt);
    const lift = reduced ? 0 : pulse.current;
    group.scale.setScalar(1 + lift * 0.025);

    // camera rig: fit to the container's aspect, plus a little pointer parallax
    const aspect = size.width / Math.max(1, size.height);
    const fitDistance = FIT_WIDTH / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspect);
    const distance = Math.max(BASE_DISTANCE, fitDistance) - lift * 0.7;
    const px = reduced ? 0 : pointer.x * 0.55;
    const py = reduced ? 0 : pointer.y * 0.25;
    camera.position.set(CAMERA_DIR.x * distance + px, CAMERA_DIR.y * distance + py, CAMERA_DIR.z * distance);
    camera.lookAt(LOOK_AT);

    // glue the DOM labels to their plots
    group.updateMatrixWorld(true);
    plots.forEach((_, i) => {
      const el = labelRefs.current[i];
      if (!el) return;
      const a = plotAngle(i, count);
      labelWorld.set(Math.sin(a) * PLOT_RADIUS, 0, Math.cos(a) * PLOT_RADIUS);
      labelWorld.add(projected.copy(LABEL_LOCAL).applyAxisAngle(THREE.Object3D.DEFAULT_UP, a));
      group.localToWorld(labelWorld);
      const depth = labelWorld.z;
      labelWorld.project(camera);
      const x = (labelWorld.x * 0.5 + 0.5) * size.width;
      const y = (-labelWorld.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.opacity = i === activeIndex ? '1' : depth > -0.4 ? '0.95' : '0.55';
      el.style.zIndex = i === activeIndex ? '3' : depth > -0.4 ? '2' : '1';
    });
  });

  return (
    <>
      <hemisphereLight args={['#fff8ea', '#b7c7a0', 0.95]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5.5, 9, 6.5]}
        intensity={2.3}
        color="#fff0d2"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-6.5}
        shadow-camera-right={6.5}
        shadow-camera-top={6.5}
        shadow-camera-bottom={-6.5}
        shadow-camera-near={1}
        shadow-camera-far={26}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 4, -3]} intensity={0.45} color="#cfe4ff" />

      <GroundShadow />
      <group ref={island}>
        <Terrain />
        <Plaza />
        <Roads count={count} />
        <River count={count} />
        <Vegetation count={count} />
        {plots.map((plot, i) => {
          const a = plotAngle(i, count);
          return (
            <group key={plot.id} position={[Math.sin(a) * PLOT_RADIUS, 0, Math.cos(a) * PLOT_RADIUS]} rotation={[0, a, 0]}>
              <Pad selected={i === activeIndex} />
              <group scale={PLOT_SCALE}>
                <PlotModel kind={plot.kind} selected={i === activeIndex} />
              </group>
            </group>
          );
        })}
      </group>
    </>
  );
};

/* ── public component ── */

const IslandScene = (props: IslandSceneProps) => {
  const { plots, activeIndex, onSelect, visible, reduced, compact } = props;
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows={!compact}
        dpr={compact ? [1, 1.25] : [1, 1.75]}
        frameloop={!visible ? 'never' : reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, near: 0.1, far: 80, position: [0, 6, 10] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
        aria-hidden="true"
      >
        <MotionContext.Provider value={{ reduced }}>
          <World {...props} labelRefs={labelRefs} />
        </MotionContext.Provider>
      </Canvas>

      {/* project labels: real buttons positioned over their plots every frame */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {plots.map((plot, i) => {
          const Icon = plot.icon;
          const selected = i === activeIndex;
          return (
            <button
              key={plot.id}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show ${plot.title}`}
              aria-pressed={selected}
              style={{ opacity: 0 }}
              className={cn(
                'pointer-events-auto absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium shadow-[0_10px_24px_-10px_rgba(39,52,59,0.5)] backdrop-blur transition-colors duration-300 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[13px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'border-[#1e4d3a] bg-[#1e4d3a] text-white'
                  : 'border-white/70 bg-white/95 text-[#27343b] hover:bg-white'
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              {plot.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IslandScene;
