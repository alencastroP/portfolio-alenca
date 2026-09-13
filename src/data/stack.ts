import type { ProjectId } from '@/types';

/**
 * Três degraus em vez de nota de 1 a 5: uma barra de cinco pontinhos diz
 * menos e envelhece pior do que dizer o que a pessoa faz com a ferramenta.
 */
export type Tier = 'core' | 'strong' | 'working';

export const TIER_LABEL: Record<Tier, string> = {
  core: 'Especialidade',
  strong: 'Sólido',
  working: 'Em prática',
};

export interface Skill {
  name: string;
  tier: Tier;
  /** O que eu faço com isso — não o que a ferramenta é. */
  note: string;
  /** Projetos da galeria onde a tecnologia aparece. */
  projects?: ProjectId[];
  /** Transversal: está em todos os projetos, listar seria ruído. */
  everywhere?: boolean;
  /** Onde é usada quando não mapeia para um projeto da galeria. */
  context?: string;
}

export interface StackCategory {
  id: string;
  label: string;
  summary: string;
  skills: Skill[];
}

export const STACK: StackCategory[] = [
  {
    id: 'front',
    label: 'Front-end',
    summary:
      'A especialidade. É aqui que estão as decisões mais finas: arquitetura de componentes, estado previsível e a interface que o usuário julga em três segundos.',
    skills: [
      {
        name: 'React',
        tier: 'core',
        note: 'Arquitetura de componentes, hooks customizados, composição e renderização controlada, até a 19.',
        projects: ['n1', 'eixo', 'delivery', 'ana-beatriz', 'washi', 'transfer'],
      },
      {
        name: 'TypeScript',
        tier: 'core',
        note: 'Modo estrito, uniões discriminadas e contratos de API tipados: o compilador pegando o bug antes do usuário.',
        projects: ['eixo', 'delivery', 'ana-beatriz', 'washi'],
      },
      {
        name: 'JavaScript (ES6+)',
        tier: 'core',
        note: 'A base: assincronismo, imutabilidade, closures e as APIs do browser que a maioria só usa via biblioteca.',
        projects: ['n1', 'transfer'],
      },
      {
        name: 'HTML5',
        tier: 'core',
        note: 'Semântica primeiro. Botão é botão, diálogo é diálogo: metade da acessibilidade nasce da marcação certa.',
        everywhere: true,
      },
      {
        name: 'CSS3',
        tier: 'core',
        note: 'Grid, flexbox, custom properties, seletor :has() e animação sem biblioteca.',
        everywhere: true,
      },
      {
        name: 'Styled Components',
        tier: 'strong',
        note: 'CSS-in-JS com theming e variantes por prop, quando o projeto pede estilo colocado junto do componente.',
      },
      {
        name: 'React Router',
        tier: 'strong',
        note: 'Rotas aninhadas, layouts persistentes e guardas de autenticação sem recarregar a aplicação.',
        projects: ['eixo'],
      },
      {
        name: 'Recoil',
        tier: 'strong',
        note: 'Estado global atômico para telas com muitos seletores derivados, sem o boilerplate do Redux.',
      },
      {
        name: 'Vite',
        tier: 'strong',
        note: 'Dev server com HMR instantâneo e build enxuto. É o que segura o ciclo de feedback curto.',
        projects: ['n1', 'eixo', 'transfer'],
      },
      {
        name: 'Design system',
        tier: 'strong',
        note: 'Tokens, primitivos e documentação viva. Uma decisão visual tomada uma vez vale para a aplicação inteira.',
        projects: ['n1', 'eixo'],
      },
    ],
  },
  {
    id: 'quality',
    label: 'Testes e qualidade',
    summary:
      'O que separa uma feature entregue de uma feature confiável. Teste não é etapa final, é o que permite refatorar sem medo.',
    skills: [
      {
        name: 'Jest',
        tier: 'strong',
        note: 'Testes funcionais e validação de comportamento em produção na Ploomes.',
        projects: ['n1'],
      },
      {
        name: 'Vitest',
        tier: 'strong',
        note: 'Unitários rápidos no ecossistema Vite, rodando junto do dev server.',
        projects: ['n1'],
      },
      {
        name: 'Playwright',
        tier: 'working',
        note: 'End-to-end nos fluxos que não podem quebrar: login, envio e os caminhos de dinheiro.',
        projects: ['n1'],
      },
      {
        name: 'Storybook',
        tier: 'strong',
        note: 'Componentes isolados como documentação viva, e como forma de revisar estado sem subir a aplicação toda.',
        projects: ['n1'],
      },
    ],
  },
  {
    id: 'back',
    label: 'Back-end e integrações',
    summary:
      'Hoje entrego o servidor na maioria das aplicações. Desenho o contrato que o front vai consumir em vez de herdar um que não cabe.',
    skills: [
      {
        name: 'APIs REST',
        tier: 'core',
        note: 'Consumo e desenho de contrato: paginação, forma do erro, idempotência e o que cabe em cada resposta.',
        projects: ['n1', 'eixo', 'washi'],
      },
      {
        name: 'Node / Express',
        tier: 'strong',
        note: 'A API que serve o front e a camada BFF que agrega o que a tela precisa numa chamada só.',
        projects: ['n1', 'washi'],
      },
      {
        name: 'JWT / autenticação',
        tier: 'strong',
        note: 'Sessão entre front e BFF, refresh e a fronteira do que o cliente pode ver.',
        projects: ['n1'],
      },
      {
        name: 'Postman',
        tier: 'strong',
        note: 'Exploro e documento o contrato antes de escrever a primeira linha do componente.',
      },
      {
        name: 'Anthropic API',
        tier: 'working',
        note: 'Triagem assistida por IA dentro do N1 App: classificar, priorizar e sugerir time responsável.',
        projects: ['n1'],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Ferramentas e fluxo',
    summary:
      'O que sustenta a entrega quando o time cresce: histórico legível, processo escrito e automação no lugar de trabalho repetido.',
    skills: [
      {
        name: 'Git',
        tier: 'core',
        note: 'Branches, rebase e commits que contam a história do porquê, não só do quê.',
        everywhere: true,
      },
      {
        name: 'GitHub',
        tier: 'core',
        note: 'Pull requests, revisão e automação de checagem antes do merge.',
        everywhere: true,
      },
      {
        name: 'N8N',
        tier: 'strong',
        note: 'Automação de processos internos sem escrever um serviço: o caminho mais curto entre o problema e a solução.',
        context: 'Otimização de processos internos na Ploomes.',
      },
      {
        name: 'Notion',
        tier: 'strong',
        note: 'Estruturação e documentação de processo técnico, para o conhecimento não morar na cabeça de uma pessoa só.',
        context: 'Documentação técnica de processo na Ploomes.',
      },
      {
        name: 'Google Workspace · Microsoft 365',
        tier: 'strong',
        note: 'O básico do dia a dia corporativo, incluindo planilha como ferramenta de análise rápida.',
      },
    ],
  },
  {
    id: 'business',
    label: 'Plataformas de negócio',
    summary:
      'Contexto de produto real. Conheço a regra de negócio pelo lado de quem configura e de quem sofre quando ela quebra.',
    skills: [
      {
        name: 'Ploomes CRM',
        tier: 'core',
        note: 'Plataforma onde atuo desde 2022: personalização, integrações e resolução de demandas técnicas complexas.',
        projects: ['n1'],
      },
      {
        name: 'CPQ',
        tier: 'strong',
        note: 'Regras de precificação e configuração de produto: lógica de negócio que erra caro quando erra.',
      },
    ],
  },
];

export interface Credential {
  label: string;
  meta: string;
}

export const EDUCATION: Credential = {
  label: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
  meta: 'Unigranrio · concluído em jun/2025',
};

export const CERTIFICATES: Credential[] = [
  { label: 'Formação React com JavaScript', meta: 'Alura · 68h' },
  { label: 'Desenvolvimento Web com JavaScript', meta: 'Alura · 63h' },
  { label: 'HTML e CSS para Projetos Web', meta: 'Alura · 53h' },
  { label: 'TypeScript para Aplicações Web', meta: 'Alura · 32h' },
  { label: 'Git e GitHub', meta: 'Alura · 8h' },
];

export const CERTIFICATE_HOURS = 224;

export const SKILL_COUNT = STACK.reduce((total, group) => total + group.skills.length, 0);
