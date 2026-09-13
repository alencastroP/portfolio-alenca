import Lenis from 'lenis';

/**
 * Scroll suave com Lenis, como um singleton de módulo: quem precisa travar a
 * página (folha de case, paleta de comandos) não precisa receber a instância
 * por props nem por contexto.
 *
 * O Lenis rola a janela de verdade (só interpola a posição), então `sticky`,
 * `IntersectionObserver` e `animation-timeline: view()` continuam funcionando.
 */
let lenis: Lenis | null = null;
let locks = 0;

export function startSmoothScroll(): () => void {
  if (lenis) return () => {};

  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.11,
    // Contêineres roláveis internos (a folha de case, a lista da paleta)
    // rolam nativamente em vez de arrastar a página junto.
    allowNestedScroll: true,
  });

  return () => {
    lenis?.destroy();
    lenis = null;
    locks = 0;
  };
}

/**
 * Rola até o elemento. O Lenis já desconta o `scroll-margin-top` da seção —
 * o mesmo que compensa a nav fixa no scroll nativo.
 */
export function scrollToElement(target: HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target);
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0);
    return;
  }
  window.scrollTo({ top: 0 });
}

/**
 * Travas contadas: a paleta pode abrir por cima da folha de case, e fechar a
 * paleta não pode destravar a página enquanto a folha continua aberta.
 */
export function lockSmoothScroll() {
  locks += 1;
  lenis?.stop();
}

export function unlockSmoothScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) lenis?.start();
}

export function isSmoothScrollActive() {
  return lenis !== null;
}
