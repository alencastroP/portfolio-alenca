import type { TagVariant } from '@/types';

export interface EixoMetric {
  label: string;
  value: string;
  accent?: boolean;
}

export interface EixoRow {
  primary: string;
  secondary: string;
  status: string;
  statusVariant: TagVariant;
}

export interface EixoModule {
  name: string;
  metrics: EixoMetric[];
  columns: [string, string, string];
  rows: EixoRow[];
}

export const EIXO_MODULES: EixoModule[] = [
  {
    name: 'Leads',
    metrics: [
      { label: 'No funil', value: '24' },
      { label: 'Sem resposta há 1h+', value: '5', accent: true },
      { label: 'Convertidos hoje', value: '9' },
    ],
    columns: ['Lead', 'Vendedor', 'Status'],
    rows: [
      {
        primary: 'Corolla 2022 · Prata',
        secondary: 'Marina L.',
        status: 'negociando',
        statusVariant: 'tag-accent',
      },
      {
        primary: 'HB20 2021 · Branco',
        secondary: 'Diego R.',
        status: 'test-drive agendado',
        statusVariant: 'tag-neutral',
      },
      {
        primary: 'Renegade 2020 · Preto',
        secondary: 'Marina L.',
        status: 'vendido',
        statusVariant: 'tag-outline',
      },
    ],
  },
  {
    name: 'Estoque',
    metrics: [
      { label: 'Veículos no pátio', value: '58' },
      { label: 'Parados +60 dias', value: '6', accent: true },
      { label: 'Giro médio', value: '34d' },
    ],
    columns: ['Veículo', 'Pátio', 'Situação'],
    rows: [
      {
        primary: 'Corolla 2022 · Prata',
        secondary: 'Pátio A · 04',
        status: 'disponível',
        statusVariant: 'tag-accent',
      },
      {
        primary: 'HB20 2021 · Branco',
        secondary: 'Pátio B · 12',
        status: 'reservado',
        statusVariant: 'tag-neutral',
      },
      {
        primary: 'Renegade 2020 · Preto',
        secondary: 'Pátio C · 02',
        status: 'vendido',
        statusVariant: 'tag-neutral',
      },
    ],
  },
  {
    name: 'Triagem por IA',
    metrics: [
      { label: 'Triados hoje', value: '38' },
      { label: 'Confiança média', value: '89%', accent: true },
      { label: 'Escalados a vendedor', value: '6' },
    ],
    columns: ['Mensagem recebida', 'Classificação', 'Confiança'],
    rows: [
      {
        primary: '“Ainda tem o HB20 branco disponível?”',
        secondary: 'Disponibilidade',
        status: '94%',
        statusVariant: 'tag-accent',
      },
      {
        primary: '“Quero simular o financiamento do Corolla”',
        secondary: 'Financiamento',
        status: '90%',
        statusVariant: 'tag-accent',
      },
      {
        primary: '“Posso agendar um test-drive amanhã?”',
        secondary: 'Agendamento',
        status: '81%',
        statusVariant: 'tag-neutral',
      },
    ],
  },
  {
    name: 'Crédito',
    metrics: [
      { label: 'Consultas no mês', value: '134' },
      { label: 'Aprovação', value: '61%', accent: true },
      { label: 'Ticket médio', value: 'R$ 38k' },
    ],
    columns: ['Proposta', 'Veículo', 'Situação'],
    rows: [
      { primary: 'PRP-2291', secondary: 'Corolla 2022', status: 'aprovada', statusVariant: 'tag-outline' },
      { primary: 'PRP-2292', secondary: 'HB20 2021', status: 'em análise', statusVariant: 'tag-accent' },
      { primary: 'PRP-2293', secondary: 'Renegade 2020', status: 'negada', statusVariant: 'tag-neutral' },
    ],
  },
  {
    name: 'Relatórios',
    metrics: [
      { label: 'Faturamento mês', value: 'R$ 412k' },
      { label: 'Margem', value: '23%', accent: true },
      { label: 'Retorno de cliente', value: '38%' },
    ],
    columns: ['Relatório', 'Período', 'Formato'],
    rows: [
      {
        primary: 'Faturamento por vendedor',
        secondary: 'Ago/2026',
        status: 'PDF',
        statusVariant: 'tag-neutral',
      },
      { primary: 'Giro de estoque', secondary: 'Trimestre', status: 'CSV', statusVariant: 'tag-neutral' },
      {
        primary: 'Compliance de atendimento',
        secondary: 'Ago/2026',
        status: 'PDF',
        statusVariant: 'tag-accent',
      },
    ],
  },
];
