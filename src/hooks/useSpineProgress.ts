import { useEffect, useRef } from 'react';

/**
 * Preenche a linha vertical da timeline conforme o scroll.
 *
 * A altura é escrita direto no DOM dentro de um requestAnimationFrame:
 * é uma animação contínua, não vale um re-render do React a cada pixel.
 */
export function useSpineProgress<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const container = containerRef.current;
      const fill = fillRef.current;
      if (!container || !fill) return;

      const rect = container.getBoundingClientRect();
      // Âncora no meio da tela: a linha acompanha o que está sendo lido.
      const anchor = window.innerHeight * 0.5;
      const total = Math.max(rect.height - anchor, 1);
      const scrolled = Math.min(Math.max(anchor - rect.top, 0), total);

      fill.style.height = `${(scrolled / total) * rect.height}px`;
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

  return { containerRef, fillRef };
}
