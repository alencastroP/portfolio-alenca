const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata um número como moeda brasileira: 54.9 → "R$ 54,90". */
export function brl(value: number): string {
  return brlFormatter.format(value);
}

/** Junta classes ignorando valores falsy — evita `className={a + ' ' + (b || '')}`. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
