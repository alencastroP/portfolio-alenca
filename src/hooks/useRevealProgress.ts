import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface RevealProgressOptions {
  /** Posição do topo do elemento (fração da viewport) onde o progresso é 0. */
  start?: number;
  /** Posição onde o progresso chega a 1. */
  end?: number;
}

/**
 * Progresso de leitura de um elemento (0 → 1) escrito em `--reveal`.
 *
 * Um único número por elemento: o CSS deriva dele a opacidade de cada
 * palavra (`--reveal * --n - --i`), sem um listener ou estado por palavra.
 */
export function useRevealProgress<T extends HTMLElement>({
  start = 0.9,
  end = 0.4,
}: RevealProgressOptions = {}) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (reduced) {
      element.style.setProperty('--reveal', '1');
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const top = element.getBoundingClientRect().top;
      const progress = (viewport * start - top) / (viewport * (start - end));
      element.style.setProperty('--reveal', Math.min(Math.max(progress, 0), 1).toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [reduced, start, end]);

  return ref;
}
