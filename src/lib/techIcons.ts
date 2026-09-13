import {
  siAnthropic,
  siCss,
  siExpress,
  siGit,
  siGithub,
  siGoogle,
  siHtml5,
  siJavascript,
  siJest,
  siJsonwebtokens,
  siN8n,
  siNodedotjs,
  siNotion,
  siPostman,
  siReact,
  siReactrouter,
  siRecoil,
  siStorybook,
  siStyledcomponents,
  siTypescript,
  siVite,
  siVitest,
} from 'simple-icons';

/** O que o componente de ícone precisa de um ícone do simple-icons. */
export interface TechIconData {
  title: string;
  path: string;
  hex: string;
}

/** Ícone de marca por competência — as chaves são os nomes de `data/stack.ts`. */
export const SKILL_ICONS: Partial<Record<string, TechIconData>> = {
  React: siReact,
  TypeScript: siTypescript,
  'JavaScript (ES6+)': siJavascript,
  HTML5: siHtml5,
  CSS3: siCss,
  'Styled Components': siStyledcomponents,
  'React Router': siReactrouter,
  Recoil: siRecoil,
  Vite: siVite,
  Jest: siJest,
  Vitest: siVitest,
  Storybook: siStorybook,
  'Node / Express': siNodedotjs,
  'JWT / autenticação': siJsonwebtokens,
  Postman: siPostman,
  'Anthropic API': siAnthropic,
  Git: siGit,
  GitHub: siGithub,
  N8N: siN8n,
  Notion: siNotion,
  'Google Workspace · Microsoft 365': siGoogle,
};

/** A faixa do marquee: nome de vitrine + ícone, na ordem em que o olho lê. */
export const MARQUEE_TECH: Array<{ name: string; icon: TechIconData }> = [
  { name: 'React', icon: siReact },
  { name: 'TypeScript', icon: siTypescript },
  { name: 'JavaScript', icon: siJavascript },
  { name: 'Vite', icon: siVite },
  { name: 'Node.js', icon: siNodedotjs },
  { name: 'Express', icon: siExpress },
  { name: 'HTML5', icon: siHtml5 },
  { name: 'CSS', icon: siCss },
  { name: 'Vitest', icon: siVitest },
  { name: 'Jest', icon: siJest },
  { name: 'Storybook', icon: siStorybook },
  { name: 'React Router', icon: siReactrouter },
  { name: 'Styled Components', icon: siStyledcomponents },
  { name: 'JWT', icon: siJsonwebtokens },
  { name: 'Anthropic API', icon: siAnthropic },
  { name: 'Postman', icon: siPostman },
  { name: 'Git', icon: siGit },
  { name: 'GitHub', icon: siGithub },
  { name: 'n8n', icon: siN8n },
];

/**
 * Cor de marca, só se ela for legível no fundo escuro. Marcas pretas
 * (GitHub, Express, Notion) somem num fundo violeta quase preto — nelas o
 * hover fica com a cor de destaque do próprio site.
 */
export function readableBrandColor(hex: string): string | undefined {
  const value = Number.parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.32 ? `#${hex}` : undefined;
}
