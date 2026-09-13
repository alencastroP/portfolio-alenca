export interface JourneyYear {
  year: string;
  role: string;
  detail: string;
  /**
   * Frentes que eu cobria naquele ano. A altura da barra é a contagem
   * disso — uma escala com definição embaixo, não uma nota inventada.
   */
  scope: string[];
  current?: boolean;
}

/** Teto do gráfico: o ano de maior escopo define a altura cheia. */
export const SCOPE_MAX = 4;

export const JOURNEY: JourneyYear[] = [
  {
    year: '2022',
    role: 'Suporte técnico',
    detail: 'Suporte a um produto real, estudando arquitetura e front-end em paralelo.',
    scope: ['Suporte e diagnóstico'],
  },
  {
    year: '2024',
    role: 'Referência técnica e primeiros projetos',
    detail: 'Mentoria interna e a primeira aplicação construída do back ao front.',
    scope: ['Suporte e diagnóstico', 'Desenvolvimento interno'],
  },
  {
    year: '2025',
    role: 'Formado e atuando como freelancer',
    detail: 'Graduação em ADS concluída e os primeiros clientes externos.',
    scope: ['Desenvolvimento interno', 'Projetos contínuos', 'Clientes externos'],
  },
  {
    year: '2026',
    role: 'Entregas full stack',
    detail: 'Aplicações de ponta a ponta, com a arquitetura desenhada junto da API.',
    scope: ['Front-end', 'Back-end', 'Arquitetura', 'Entrega ponta a ponta'],
    current: true,
  },
];
