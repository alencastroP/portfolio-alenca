import { useEffect, useMemo, useState } from 'react';

/**
 * Hora local de um fuso, atualizada a cada 15s — o suficiente para o minuto
 * virar sem atraso perceptível, sem um timer por segundo.
 */
export function useLocalTime(timeZone: string): string {
  const formatter = useMemo(
    () => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone }),
    [timeZone],
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return formatter.format(now);
}
