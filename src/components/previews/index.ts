import type { ComponentType } from 'react';
import type { ProjectId } from '@/types';
import { DeliveryPreview } from './DeliveryPreview';
import { EixoPreview } from './EixoPreview';
import { N1Preview } from './N1Preview';

export { LiveSitePreview } from './LiveSitePreview';

/**
 * Recriações navegáveis, uma por projeto interno ou privado. Projetos com
 * `previewKind: 'live'` não entram aqui — eles embutem a aplicação real.
 *
 * `LeanerPreview` e `GestaoPreview` continuam na pasta, mas saíram do
 * registro junto com os projetos da galeria.
 */
export const RECREATIONS: Partial<Record<ProjectId, ComponentType>> = {
  n1: N1Preview,
  eixo: EixoPreview,
  delivery: DeliveryPreview,
};
