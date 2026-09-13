import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
  type Group,
  type Points,
} from 'three';
import { MONOGRAM_HEIGHT, MONOGRAM_WIDTH, sampleMonogram, scatterDust } from './sampleMonogram';
import { DUST_FRAGMENT, DUST_VERTEX, MONOGRAM_FRAGMENT, MONOGRAM_VERTEX } from './shaders';

/** Duração da condensação da nebulosa no monograma. */
const ASSEMBLE_SECONDS = 2.6;

/** Abaixo disso o hero empilha e a GPU costuma ser de celular: menos partículas. */
const NARROW_WIDTH = 720;

/**
 * Cor sRGB crua. O `ShaderMaterial` escreve direto no canvas, sem conversão
 * de espaço de cor — um `THREE.Color` linearizaria o hex e escureceria tudo.
 */
function rgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return new Vector3(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

/** Ponteiro em coordenadas de viewport, lido pelo quadro — sem re-render. */
function usePointer(): RefObject<PointerState> {
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      // No toque, "passar o dedo" é rolar a página — repulsão ali atrapalharia.
      pointer.current.active = event.pointerType !== 'touch';
    };
    const onLeave = () => {
      pointer.current.active = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return pointer;
}

/** Ponteiro em coordenadas normalizadas do canvas (-1 → 1). */
function samplePointer(pointer: PointerState, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const nx = ((pointer.x - rect.left) / rect.width) * 2 - 1;
  const ny = -(((pointer.y - rect.top) / rect.height) * 2 - 1);
  return {
    nx: Math.min(Math.max(nx, -1), 1),
    ny: Math.min(Math.max(ny, -1), 1),
    inside: pointer.active && Math.abs(nx) <= 1 && Math.abs(ny) <= 1,
  };
}

/** Quanto o hero já saiu da tela (0 → 1), com aceleração no fim. */
function scrollScatter(canvas: HTMLCanvasElement) {
  const height = canvas.clientHeight || window.innerHeight;
  const progress = Math.min(Math.max(window.scrollY / (height * 0.8), 0), 1);
  return progress * progress;
}

interface HeroSceneProps {
  /** Hero na viewport: fora dela o loop para e a GPU descansa. */
  active: boolean;
  /** Movimento reduzido: o monograma já nasce montado e parado. */
  still: boolean;
  onReady: () => void;
}

export default function HeroScene({ active, still, onReady }: HeroSceneProps) {
  const pointer = usePointer();

  return (
    <Canvas
      className="hero-stage__canvas"
      style={{ pointerEvents: 'none' }}
      dpr={[1, 1.75]}
      flat
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 8], fov: 35, near: 0.1, far: 40 }}
      frameloop={still ? 'demand' : active ? 'always' : 'never'}
      onCreated={() => onReady()}
    >
      <Monogram still={still} pointer={pointer} />
      <Dust still={still} />
    </Canvas>
  );
}

interface MonogramProps {
  still: boolean;
  pointer: RefObject<PointerState>;
}

function Monogram({ still, pointer }: MonogramProps) {
  const group = useRef<Group>(null);
  const { size, viewport, camera, gl } = useThree();
  const narrow = size.width < NARROW_WIDTH;

  const geometry = useMemo(() => {
    const data = sampleMonogram(narrow ? 7000 : 13000);
    const result = new BufferGeometry();
    if (data) {
      result.setAttribute('position', new BufferAttribute(data.positions, 3));
      result.setAttribute('aStart', new BufferAttribute(data.start, 3));
      result.setAttribute('aRandom', new BufferAttribute(data.random, 1));
      result.setAttribute('aAccent', new BufferAttribute(data.accent, 1));
    }
    return result;
  }, [narrow]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: MONOGRAM_VERTEX,
        fragmentShader: MONOGRAM_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uScatter: { value: 0 },
          uPointer: { value: new Vector3(99, 99, 0) },
          uStrength: { value: 0 },
          uSize: { value: 22 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 1 },
          uColorA: { value: rgb('#6e6bff') },
          uColorB: { value: rgb('#d49bff') },
          uColorC: { value: rgb('#f6e6ff') },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // Desktop: a marca ocupa a metade direita, ao lado do texto. Tela em pé:
  // ela sobe para trás do título, mais apagada, para não disputar leitura.
  const layout = useMemo(() => {
    const { width, height } = viewport;
    if (size.width / size.height > 1.05) {
      const scale = Math.min((height * 0.62) / MONOGRAM_HEIGHT, (width * 0.34) / MONOGRAM_WIDTH);
      return { x: width * 0.25, y: -height * 0.02, scale, opacity: 1 };
    }
    const scale = Math.min((width * 0.8) / MONOGRAM_WIDTH, (height * 0.34) / MONOGRAM_HEIGHT);
    return { x: width * 0.1, y: height * 0.17, scale, opacity: 0.42 };
  }, [size.width, size.height, viewport]);

  const tools = useMemo(
    () => ({
      raycaster: new Raycaster(),
      ndc: new Vector2(),
      plane: new Plane(),
      normal: new Vector3(),
      hit: new Vector3(),
    }),
    [],
  );
  const motion = useRef({ rx: 0, ry: 0, strength: 0, scatter: 0 });

  useFrame((state, delta) => {
    const target = group.current;
    if (!target) return;

    const uniforms = material.uniforms;
    uniforms.uPixelRatio.value = state.viewport.dpr;
    uniforms.uOpacity.value = layout.opacity;

    if (still) {
      uniforms.uProgress.value = 1;
      return;
    }

    const time = state.clock.elapsedTime;
    uniforms.uTime.value = time;
    uniforms.uProgress.value = Math.min(time / ASSEMBLE_SECONDS, 1);

    const sample = samplePointer(pointer.current, gl.domElement);
    const current = motion.current;
    // Amortecimento independente de FPS: o mesmo "peso" a 60 ou a 144 Hz.
    const ease = 1 - Math.exp(-delta * 3.5);

    current.ry += (Math.sin(time * 0.22) * 0.2 + sample.nx * 0.32 - current.ry) * ease;
    current.rx += (-sample.ny * 0.16 + Math.cos(time * 0.17) * 0.05 - current.rx) * ease;
    current.strength += ((sample.inside ? 1 : 0) - current.strength) * ease;
    current.scatter += (scrollScatter(gl.domElement) - current.scatter) * (1 - Math.exp(-delta * 6));

    target.rotation.set(current.rx, current.ry, 0);
    uniforms.uStrength.value = current.strength;
    uniforms.uScatter.value = current.scatter;

    if (!sample.inside) return;

    // O raio do ponteiro cruza o plano da marca já inclinada; o ponto de
    // impacto volta para o espaço local, onde o shader mede a repulsão.
    tools.ndc.set(sample.nx, sample.ny);
    tools.raycaster.setFromCamera(tools.ndc, camera);
    tools.normal.set(0, 0, 1).applyQuaternion(target.quaternion);
    tools.plane.setFromNormalAndCoplanarPoint(tools.normal, target.position);

    if (tools.raycaster.ray.intersectPlane(tools.plane, tools.hit)) {
      target.worldToLocal(tools.hit);
      (uniforms.uPointer.value as Vector3).lerp(tools.hit, 1 - Math.exp(-delta * 12));
    }
  });

  return (
    <group ref={group} position={[layout.x, layout.y, 0]} scale={layout.scale}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

function Dust({ still }: { still: boolean }) {
  const points = useRef<Points>(null);
  const { size } = useThree();
  const narrow = size.width < NARROW_WIDTH;

  const geometry = useMemo(() => {
    const { positions, random } = scatterDust(narrow ? 350 : 900);
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(positions, 3));
    result.setAttribute('aRandom', new BufferAttribute(random, 1));
    return result;
  }, [narrow]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: DUST_VERTEX,
        fragmentShader: DUST_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uScatter: { value: 0 },
          uColor: { value: rgb('#c9b8ff') },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    material.uniforms.uPixelRatio.value = state.viewport.dpr;
    if (still) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uScatter.value = scrollScatter(state.gl.domElement);
    if (points.current) points.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
