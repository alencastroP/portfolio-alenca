export type ProjectId = 'n1' | 'eixo' | 'delivery' | 'ana-beatriz' | 'washi' | 'transfer';

/** Variantes de tag disponíveis no design system. */
export type TagVariant = 'tag-neutral' | 'tag-outline' | 'tag-accent';

export interface Project {
  id: ProjectId;
  /** Número exibido no card e no cabeçalho do case. */
  num: string;
  name: string;
  /** Nome curto para chips e listagens onde o nome completo não cabe. */
  shortName: string;
  /** Período de atuação, quando documentado. */
  period?: string;
  status: string;
  statusVariant: TagVariant;
  /** Marca o projeto herói do portfólio. */
  isHero?: boolean;
  /** Descrição do projeto — abre o case, logo abaixo do título. */
  short: string;
  /** Uma linha só, para o card da galeria. */
  tagline: string;
  stackLine: string;
  problem: string;
  decision: string;
  impact: string;
  impactLabel: string;
  stack: string[];
  /** `live` embute o site em produção; `recreation` monta a recriação navegável. */
  previewKind: 'live' | 'recreation';
  /** Endereço exibido na barra do preview. */
  previewUrl: string;
  /** URL real embutida — obrigatória quando `previewKind` é `live`. */
  liveUrl?: string;
  previewHint: string;
  privacyNote: string;
}
