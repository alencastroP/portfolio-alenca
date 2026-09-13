import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Fonte única de verdade para animação no JS. O CSS já respeita a
 * preferência por conta própria; isto evita que os efeitos escritos por
 * script (spotlight, tilt, contagem) rodem para quem pediu menos movimento.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const sync = () => setReduced(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return reduced;
}
