import { useLayoutEffect, useRef, useState } from 'react';

export interface IndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HIDDEN: IndicatorRect = { x: 0, y: 0, width: 0, height: 0 };

/**
 * Mede o item `.is-active` dentro do contêiner e devolve sua caixa, para um
 * único realce deslizar até ele em vez de cada botão pintar a própria borda.
 *
 * `useLayoutEffect` mede antes da pintura (o realce nunca pisca na troca) e o
 * `ResizeObserver` refaz a conta quando os itens quebram de linha.
 */
export function useSlidingIndicator<T extends HTMLElement>(activeKey: string | number) {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<IndicatorRect>(HIDDEN);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const measure = () => {
      const active = container.querySelector<HTMLElement>('.is-active');
      setRect(
        active
          ? {
              x: active.offsetLeft,
              y: active.offsetTop,
              width: active.offsetWidth,
              height: active.offsetHeight,
            }
          : HIDDEN,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  return { ref, rect };
}
