import type { ProjectId } from '@/types';

/** Saída do formato `img` do vite-imagetools com várias larguras. */
interface ImageAsset {
  src: string;
  srcset?: string;
  w: number;
  h: number;
}

export interface Screenshot {
  file: string;
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  /** O case da galeria que a captura mostra, quando há um. */
  project?: ProjectId;
}

// Cada captura (PNGs de até 1 MB) vira quatro WebP no build, de 480 a
// 1440px — o card herói da galeria é o que pede a maior. O original nunca é
// publicado, e salvar um arquivo novo na pasta basta para ele entrar.
const ASSETS = import.meta.glob<ImageAsset>('/src/assets/Examples/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
  query: '?w=480;720;960;1440&format=webp&quality=78&as=img',
});

/** Texto alternativo e case de cada captura, pelo nome do arquivo. */
const META: Record<string, { alt: string; project?: ProjectId }> = {
  'Captura de tela 2026-09-12 101112.png': {
    alt: 'Eixo: caixa de entrada do CRM, com o co-piloto de IA respondendo um lead',
    project: 'eixo',
  },
  // Sem case na galeria: aparece só na vitrine do hero.
  'Captura de tela 2026-09-12 101136.png': {
    alt: 'Landing page de uma corretora de imóveis em Natal',
  },
  'Captura de tela 2026-09-12 101207.png': {
    alt: 'Landing page da consultoria de currículos de Ana Beatriz',
    project: 'ana-beatriz',
  },
  'Captura de tela 2026-09-12 101244.png': {
    alt: 'Washington Veículos: vitrine do estoque com o atendimento por IA do Eixo',
    project: 'washi',
  },
  'Captura de tela 2026-09-12 101420.png': {
    alt: 'N1 App: loja interna de extrações, integrações e ferramentas',
    project: 'n1',
  },
};

export const SCREENSHOTS: Screenshot[] = Object.entries(ASSETS)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, asset]) => {
    const file = path.slice(path.lastIndexOf('/') + 1);
    const meta = META[file];
    return {
      file,
      src: asset.src,
      srcSet: asset.srcset,
      width: asset.w,
      height: asset.h,
      alt: meta?.alt ?? 'Captura de tela de um projeto entregue',
      project: meta?.project,
    };
  });

/** A captura de um case, se existir — sem ela, o card segue com a silhueta em CSS. */
export function screenshotOf(project: ProjectId): Screenshot | undefined {
  return SCREENSHOTS.find((shot) => shot.project === project);
}
