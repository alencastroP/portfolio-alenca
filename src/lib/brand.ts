/**
 * O selo <A> da marca (arquivo "Alenca Logo - Simbolo"), num viewBox 44×44 —
 * o tamanho de referência do arquivo. Os glifos (JetBrains Mono nos sinais,
 * Playfair Display itálico no A) já vêm em contorno: o selo não espera fonte
 * carregar. O `public/favicon.svg` é a variante de 26px do mesmo arquivo.
 */
export const SYMBOL_BRACKETS =
  'M9.97 24.95 5.67 22.8V21.8L9.97 19.65V20.52L6.87 22.04Q6.68 22.13 6.52 22.2Q6.35 22.26 6.27 22.28Q6.36 22.3 6.53 22.37Q6.7 22.43 6.87 22.52L9.97 24.05Z' +
  'M34.03 24.95V24.08L37.13 22.56Q37.32 22.47 37.48 22.41Q37.65 22.34 37.73 22.32Q37.64 22.3 37.47 22.23Q37.3 22.17 37.13 22.08L34.03 20.55V19.65L38.33 21.8V22.8Z';

export const SYMBOL_LETTER =
  'M15.9 28.59Q14.94 29.94 14.75 30.75Q14.55 31.55 15.04 31.91Q15.54 32.26 16.61 32.28L16.48 32.8Q15.75 32.75 14.97 32.74Q14.19 32.72 13.51 32.72Q12.86 32.72 12.42 32.74Q11.98 32.75 11.56 32.8L11.69 32.28Q12.05 32.2 12.45 31.96Q12.84 31.71 13.3 31.24Q13.77 30.77 14.29 30.02L25.5 14.26Q25.6 14.26 25.69 14.26Q25.78 14.26 25.89 14.26L26.93 30.62Q27 31.55 27.41 31.91Q27.81 32.26 28.2 32.28L28.1 32.8Q27.58 32.75 26.8 32.74Q26.02 32.72 25.26 32.72Q24.33 32.72 23.49 32.74Q22.66 32.75 22.14 32.8L22.25 32.28Q23.49 32.23 24.02 31.83Q24.54 31.42 24.48 30.1L23.78 17.25L23.96 17.2ZM17.98 25.31H25.57L25.37 25.83H17.52Z';

/**
 * O monograma "P" anterior, num viewBox 64×64. Só as partículas do hero
 * (`HeroScene`, hoje fora da página) ainda leem daqui.
 */
export const MONOGRAM_PATH =
  'M20 46V18h13.5c6 0 9.8 3.6 9.8 9.2s-3.8 9.3-9.8 9.3H27V46h-7Zm7-15.4h5.4c2.3 0 3.7-1.3 3.7-3.4s-1.4-3.4-3.7-3.4H27v6.8Z';

export const MONOGRAM_DOT = { cx: 47, cy: 43, r: 4 } as const;
