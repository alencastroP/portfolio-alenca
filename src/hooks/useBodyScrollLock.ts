import { useEffect } from 'react';
import { lockSmoothScroll, unlockSmoothScroll } from '@/lib/smoothScroll';

/**
 * Trava o scroll do body enquanto um overlay está aberto, compensando a
 * largura da barra de rolagem para a página não "pular" ao abrir.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement: root } = document;
    const previousOverflow = root.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    // A trava vai no <html>: o `overflow-x: hidden` do body já faz dele um
    // contêiner de scroll, então esconder o overflow dele não seguraria a página.
    root.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    // O Lenis rola por conta própria — sem pará-lo, a roda do mouse ainda
    // arrastaria a página congelada atrás do overlay.
    lockSmoothScroll();

    return () => {
      root.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      unlockSmoothScroll();
    };
  }, [locked]);
}
