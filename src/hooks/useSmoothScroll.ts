import { useEffect } from 'react';
import { scrollToElement, startSmoothScroll } from '@/lib/smoothScroll';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Liga o Lenis e faz os links de âncora (#galeria, #contato…) rolarem por
 * ele. Com movimento reduzido nada disso liga: fica o scroll nativo.
 *
 * O skip-link fica de fora de propósito — ele precisa do comportamento
 * nativo, que também move o foco do teclado para o destino.
 */
export function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const stop = startSmoothScroll();

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link || link.classList.contains('skip-link')) return;

      const id = decodeURIComponent(link.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      event.preventDefault();
      scrollToElement(target);
      history.pushState(null, '', `#${id}`);
    };

    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      stop();
    };
  }, [reduced]);
}
