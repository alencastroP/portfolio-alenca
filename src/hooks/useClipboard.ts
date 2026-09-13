import { useCallback, useEffect, useRef, useState } from 'react';

/** Copia um texto e mantém `copied` ligado por um instante, para o feedback. */
export function useClipboard(resetAfter = 2200) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false;
      }
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), resetAfter);
      return true;
    },
    [resetAfter],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { copied, copy };
}
