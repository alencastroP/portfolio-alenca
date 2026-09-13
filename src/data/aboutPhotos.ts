/** Saída do formato `img` do vite-imagetools com várias larguras. */
interface ImageAsset {
  src: string;
  srcset?: string;
  w: number;
  h: number;
}

// Os retratos do mosaico do "Sobre" — pasta própria, separada de
// `assets/Examples`, que é a coleção de screenshots dos projetos
// (ver `screenshots.ts`). Larguras menores que as capturas: aqui a foto
// nunca passa de ~300px de exibição, mesmo em telas retina.
const ASSETS = import.meta.glob<ImageAsset>('/src/assets/about/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
  query: '?w=480;720&format=webp&quality=82&as=img',
});

function bySuffix(suffix: string): ImageAsset {
  const entry = Object.entries(ASSETS).find(([path]) => path.endsWith(suffix));
  if (!entry) throw new Error(`Foto do "Sobre" não encontrada: ${suffix}`);
  return entry[1];
}

export const ABOUT_ACCENT_A = bySuffix('DSC08694.jpg');
export const ABOUT_ACCENT_B = bySuffix('DSC08659 (1).jpg');
