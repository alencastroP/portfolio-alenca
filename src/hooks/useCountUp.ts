import { useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Só conta quando o número lidera a frase: "−40%" e "8 módulos" sim,
 *  "Solicitação em 3 toques" não — animar um número no meio de um texto
 *  chama atenção para a palavra errada. */
const LEADING_NUMBER = /^([+\-−]?)(\d+)(.*)$/s;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Recebe o texto de impacto do case e devolve o mesmo texto com o número
 * subindo de zero até o valor final.
 */
export function useCountUp(text: string, duration = 850): string {
  const reduced = usePrefersReducedMotion();
  const parsed = useMemo(() => LEADING_NUMBER.exec(text), [text]);
  const target = parsed ? Number(parsed[2]) : 0;

  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!parsed || reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [parsed, target, duration, reduced]);

  if (!parsed) return text;
  return `${parsed[1]}${value}${parsed[3]}`;
}
