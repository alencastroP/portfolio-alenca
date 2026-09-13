import type { CSSProperties } from 'react';
import { useRevealProgress } from '@/hooks/useRevealProgress';
import { cx } from '@/lib/format';

interface ScrollWordsProps {
  id?: string;
  className?: string;
  text: string;
  /** Trecho final em destaque (serifa itálica), depois de `text`. */
  accent?: string;
}

/**
 * Frase que acende palavra por palavra conforme a leitura avança.
 *
 * Um número só (`--reveal`, escrito pelo hook) e cada palavra com o próprio
 * índice (`--i`): o CSS calcula a opacidade de todas numa expressão, sem
 * estado nem listener por palavra.
 */
export function ScrollWords({ id, className, text, accent }: ScrollWordsProps) {
  const ref = useRevealProgress<HTMLParagraphElement>();

  const words = [
    ...text.split(' ').map((word) => ({ word, accent: false })),
    ...(accent ? accent.split(' ').map((word) => ({ word, accent: true })) : []),
  ];

  return (
    <p
      id={id}
      ref={ref}
      className={cx('scroll-words', className)}
      style={{ '--n': words.length } as CSSProperties}
    >
      {words.map((item, index) => (
        <span
          key={index}
          className={cx('scroll-words__word', item.accent && 'is-accent')}
          style={{ '--i': index } as CSSProperties}
        >
          {item.word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
