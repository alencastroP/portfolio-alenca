import { useEffect, useRef, useState } from 'react';

interface InViewOptions {
  rootMargin?: string;
  /** Para de observar na primeira entrada — para carregar algo uma vez só. */
  once?: boolean;
}

/**
 * Diz se o elemento está na viewport. Diferente de `useReveal`, acompanha a
 * saída também: é o que pausa o WebGL quando o hero ou o globo saem da tela.
 */
export function useInView<T extends Element>({ rootMargin = '0px', once = false }: InViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return { ref, inView };
}
