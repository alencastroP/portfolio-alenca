import type { CSSProperties } from 'react';
import { TechIcon } from '@/components/TechIcon';
import { MARQUEE_TECH, readableBrandColor } from '@/lib/techIcons';

/**
 * Faixa infinita de tecnologias. Duas cópias idênticas lado a lado e um
 * `translateX(-50%)`: quando a primeira sai, a segunda está exatamente onde
 * ela estava — o laço não tem emenda. A cópia é invisível para leitores de tela.
 */
export function TechMarquee() {
  return (
    <div className="marquee">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <ul
            className="marquee__group"
            key={copy}
            aria-label={copy === 0 ? 'Tecnologias do dia a dia' : undefined}
            aria-hidden={copy === 1 || undefined}
          >
            {MARQUEE_TECH.map((item) => (
              <li
                className="marquee__item"
                key={item.name}
                style={{ '--brand': readableBrandColor(item.icon.hex) } as CSSProperties}
              >
                <TechIcon icon={item.icon} className="marquee__icon" />
                {item.name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
