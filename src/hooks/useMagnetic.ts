import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Botão magnético: o elemento é puxado na direção do ponteiro enquanto ele
 * está por cima, e volta ao lugar ao sair. Escreve `--mag-x`/`--mag-y`; o
 * CSS aplica o translate e a curva de retorno.
 *
 * Só liga em ponteiros de precisão — num toque não existe "hover" e o
 * efeito viraria um salto.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.24) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced || !window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;
    let pointer = { x: 0, y: 0 };

    const apply = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--mag-x', `${(pointer.x - (rect.left + rect.width / 2)) * strength}px`);
      element.style.setProperty('--mag-y', `${(pointer.y - (rect.top + rect.height / 2)) * strength}px`);
    };

    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.style.removeProperty('--mag-x');
      element.style.removeProperty('--mag-y');
    };

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);

    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, strength]);

  return ref;
}
