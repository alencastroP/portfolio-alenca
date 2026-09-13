import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Globe as CobeGlobe } from 'cobe';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cx } from '@/lib/format';

/** Natal/RN — latitude, longitude. */
const NATAL: [number, number] = [-5.7945, -35.211];
/** Rotação que põe a longitude de Natal de frente para a câmera (convenção do cobe). */
const NATAL_PHI = Math.PI - ((NATAL[1] * Math.PI) / 180 - Math.PI / 2);
const THETA = 0.16;
/** Pixels de arraste por radiano de rotação. */
const DRAG_RESISTANCE = 180;

/**
 * Globo em WebGL (cobe, ~5 KB) marcando Natal. A biblioteca só é baixada
 * quando o contato chega perto da tela, e o loop para quando ele sai.
 *
 * O cobe v2 não tem mais `onRender`: a rotação é um loop próprio chamando
 * `globe.update()`. Em vez de girar sem parar, o globo balança em torno de
 * Natal — o marcador nunca some atrás dele.
 */
export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const globeRef = useRef<CobeGlobe | null>(null);
  const drag = useRef<{ x: number; offset: number } | null>(null);
  const offset = useRef(0);

  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '200px' });
  const reduced = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  // Criação: uma vez, na primeira aproximação.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!armed || !canvas) return;

    let disposed = false;
    let observer: ResizeObserver | undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    import('cobe')
      .then(({ default: createGlobe }) => {
        if (disposed) return;

        const size = canvas.offsetWidth * dpr;
        globeRef.current = createGlobe(canvas, {
          devicePixelRatio: dpr,
          width: size,
          height: size,
          phi: NATAL_PHI,
          theta: THETA,
          dark: 1,
          diffuse: 1.3,
          mapSamples: 18000,
          mapBrightness: 5,
          baseColor: [0.2, 0.17, 0.34],
          markerColor: [0.94, 0.78, 1],
          glowColor: [0.36, 0.28, 0.72],
          markers: [{ location: NATAL, size: 0.075 }],
          opacity: 0.92,
        });

        observer = new ResizeObserver(() => {
          const next = canvas.offsetWidth * dpr;
          globeRef.current?.update({ width: next, height: next });
        });
        observer.observe(canvas);

        setReady(true);
      })
      .catch(() => {
        // Sem WebGL o palco fica com o halo em CSS — o contato continua inteiro.
      });

    return () => {
      disposed = true;
      observer?.disconnect();
      globeRef.current?.destroy();
      globeRef.current = null;
    };
  }, [armed]);

  // Loop: só enquanto visível e com movimento permitido.
  useEffect(() => {
    const globe = globeRef.current;
    if (!ready || !globe) return;

    let phi = NATAL_PHI + offset.current;

    if (reduced || !inView) {
      globe.update({ phi });
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const seconds = (now - start) / 1000;
      const target = NATAL_PHI + Math.sin(seconds * 0.25) * 0.6 + offset.current;
      phi += (target - phi) * 0.06;
      globe.update({ phi });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ready, inView, reduced]);

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    drag.current = { x: event.clientX, offset: offset.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    offset.current = drag.current.offset + (event.clientX - drag.current.x) / DRAG_RESISTANCE;
    if (reduced) globeRef.current?.update({ phi: NATAL_PHI + offset.current });
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div ref={ref} className={cx('globe', ready && 'is-ready', className)}>
      <canvas
        ref={canvasRef}
        className="globe__canvas"
        role="img"
        aria-label="Globo terrestre com um marcador em Natal, Rio Grande do Norte"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </div>
  );
}
