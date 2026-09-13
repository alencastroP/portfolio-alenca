import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface SpotlightOptions {
  /** Inclinação máxima em graus. 0 desliga o efeito 3D. */
  tilt?: number;
  /**
   * Escreve coordenadas de viewport em vez de relativas ao elemento — é o
   * que um brilho `position: fixed` precisa, já que ele não rola com a página.
   */
  viewport?: boolean;
}

/**
 * Escreve a posição do ponteiro em custom properties (`--px`, `--py`) e,
 * opcionalmente, a inclinação 3D (`--tilt-x`, `--tilt-y`).
 *
 * Quem desenha é o CSS: o React só alimenta os números, num rAF e sem
 * nenhum re-render — por isso o efeito acompanha o cursor a 60fps mesmo
 * com seis cards montados.
 */
export function usePointerSpotlight<T extends HTMLElement>({
  tilt = 0,
  viewport = false,
}: SpotlightOptions = {}) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;

    let frame = 0;
    let pointer = { x: 0, y: 0 };

    const apply = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = viewport ? pointer.x : pointer.x - rect.left;
      const y = viewport ? pointer.y : pointer.y - rect.top;

      element.style.setProperty('--px', `${x}px`);
      element.style.setProperty('--py', `${y}px`);

      if (tilt) {
        element.style.setProperty('--tilt-x', `${(0.5 - y / rect.height) * tilt}deg`);
        element.style.setProperty('--tilt-y', `${(x / rect.width - 0.5) * tilt}deg`);
      }
    };

    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.style.removeProperty('--tilt-x');
      element.style.removeProperty('--tilt-y');
    };

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);

    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, tilt, viewport]);

  return ref;
}
