import type { ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cx } from '@/lib/format';

interface SectionProps {
  /** Modificador visual: define a altura do nó na timeline. */
  variant: 'hero' | 'gallery' | 'stack' | 'journey' | 'contact';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
}

/**
 * Uma parada da timeline: recebe o nó na linha vertical e revela o
 * conteúdo quando entra na viewport.
 */
export function Section({ variant, id, children, ...aria }: SectionProps) {
  const { ref, isVisible } = useReveal<HTMLElement>();

  return (
    <section
      {...aria}
      id={id}
      ref={ref}
      className={cx('section', 'reveal', `section--${variant}`, isVisible && 'is-visible')}
    >
      <span className="section__dot" aria-hidden="true" />
      {children}
    </section>
  );
}
