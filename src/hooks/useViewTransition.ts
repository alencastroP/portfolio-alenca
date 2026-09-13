import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type ViewTransition = { finished: Promise<void> };

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

/** Nome compartilhado pelo painel da folha e pelo card que vira (ou volta a ser) ele. */
const PANEL_NAME = 'case-panel';

/** `open`: card → folha · `step`: troca de case · `close`: folha → card. */
export type TransitionKind = 'open' | 'step' | 'close';

interface TransitionOptions {
  kind: TransitionKind;
  /** Abrir: o elemento de onde o painel nasce (o card clicado). */
  from?: HTMLElement | null;
  /** Fechar: o elemento para onde o painel volta — resolvido depois do update. */
  to?: () => HTMLElement | null;
}

export function supportsViewTransitions(): boolean {
  return typeof (document as DocumentWithViewTransition).startViewTransition === 'function';
}

/**
 * Envolve uma atualização de estado numa View Transition do navegador — e,
 * com `from`/`to`, faz um *shared element*: o card clicado e o painel da
 * folha recebem o mesmo `view-transition-name` em momentos alternados, e o
 * navegador interpola um no outro.
 *
 * O `flushSync` é o detalhe que faz funcionar: a API tira o snapshot "antes"
 * ao chamar, roda o callback e tira o "depois" — se o React agendasse o
 * render para depois, o snapshot final sairia idêntico ao inicial.
 *
 * `data-vt` no <html> diz ao CSS qual coreografia usar.
 * Sem suporte (ou com movimento reduzido) a atualização acontece direto.
 */
export function useViewTransition() {
  const reduced = usePrefersReducedMotion();

  return useCallback(
    (update: () => void, { kind, from, to }: TransitionOptions) => {
      const doc = document as DocumentWithViewTransition;

      if (!doc.startViewTransition || reduced) {
        update();
        return;
      }

      const root = document.documentElement;
      root.dataset.vt = kind;
      from?.style.setProperty('view-transition-name', PANEL_NAME);

      let target: HTMLElement | null = null;

      const transition = doc.startViewTransition(() => {
        // O nome tem de ser único em cada snapshot: sai do card antes do
        // painel montar, e só entra no card de destino depois que ele saiu.
        from?.style.removeProperty('view-transition-name');
        flushSync(update);
        target = to?.() ?? null;
        target?.style.setProperty('view-transition-name', PANEL_NAME);
      });

      void transition.finished.finally(() => {
        target?.style.removeProperty('view-transition-name');
        if (root.dataset.vt === kind) delete root.dataset.vt;
      });
    },
    [reduced],
  );
}
