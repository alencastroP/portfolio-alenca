import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fontes hospedadas junto do build (Fontsource): sem ida ao Google Fonts,
// sem FOUT de terceiro, e só os pesos/eixos que o site usa.
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import App from '@/App';
import '@/styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Elemento #root não encontrado no index.html.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Para quem abre o DevTools num portfólio de front-end — sempre tem alguém.
console.log(
  '%cOlá, dev curioso. 👋',
  'font: 600 15px system-ui; color: #a08bff;',
  '\nReact 19 + TypeScript, hero com tilt 3D em CSS puro nos springs do Framer Motion, Tailwind v4 sobre design tokens.' +
    '\nPressione ⌘K / Ctrl K para navegar pelo teclado.' +
    '\nhttps://github.com/alencastrop',
);
