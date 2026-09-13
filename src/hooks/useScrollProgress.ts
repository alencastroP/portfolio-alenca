import { useEffect, useRef } from 'react';

/**
 * Progresso de leitura da página (0 → 1) escrito como custom property no
 * elemento retornado. Igual à spine: animação contínua não passa pelo
 * estado do React.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      element.style.setProperty('--progress', progress.toFixed(4));
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
  }, []);

  return ref;
}
