export interface Ticket {
  id: string;
  subject: string;
  body: string;
  /** Classificação devolvida pela triagem assistida. */
  triage: string;
}

export const N1_TICKETS: Ticket[] = [
  {
    id: '#4821',
    subject: 'Erro 500 ao exportar relatório mensal',
    body: 'Usuário do financeiro relata falha ao exportar o relatório fechado do mês. Ocorre só em contas com mais de 5 mil linhas.',
    triage:
      'Categoria: Bug de exportação · Prioridade: Alta · Time: Plataforma. Sugestão: reproduzir com dataset grande, checar timeout do BFF.',
  },
  {
    id: '#4822',
    subject: 'Solicitação de acesso ao módulo de estoque',
    body: 'Novo colaborador precisa de permissão de leitura no módulo de estoque para conferência semanal.',
    triage:
      'Categoria: Acesso e permissão · Prioridade: Baixa · Time: Suporte N1. Sugestão: fluxo automatizável, encaminhar ao autoatendimento.',
  },
  {
    id: '#4823',
    subject: 'Cliente não recebeu e-mail de confirmação',
    body: 'Pedido criado com sucesso, mas o e-mail de confirmação não chegou. Já verificado que não está em spam.',
    triage:
      'Categoria: Integração de e-mail · Prioridade: Média · Time: Integrações. Sugestão: verificar fila de envio e webhook de bounce.',
  },
  {
    id: '#4824',
    subject: 'Dúvida sobre como emitir segunda via',
    body: 'Usuária pergunta onde encontra a segunda via do faturamento do mês anterior.',
    triage:
      'Categoria: Dúvida de uso · Prioridade: Baixa · Time: Suporte N1. Sugestão: responder com artigo da base, candidato a FAQ no produto.',
  },
];
