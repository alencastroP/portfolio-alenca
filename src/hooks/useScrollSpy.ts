import { useEffect, useState } from 'react';

/**
 * Qual seção está sendo lida agora. Uma faixa fina perto do meio da tela
 * (`rootMargin` corta 42% em cima e 56% embaixo) cruza no máximo uma seção
 * por vez — as seções são contíguas, então não há empate a desfazer.
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const crossing = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        setActive(ids.find((id) => crossing.has(id)) ?? null);
      },
      { rootMargin: '-42% 0px -56% 0px' },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ids]);

  return active;
}
