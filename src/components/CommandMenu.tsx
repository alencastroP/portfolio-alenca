import { useEffect } from 'react';
import { Command } from 'cmdk';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/data/contact';
import { PROJECTS } from '@/data/projects';
import { useClipboard } from '@/hooks/useClipboard';
import {
  lockSmoothScroll,
  scrollToElement,
  scrollToTop,
  unlockSmoothScroll,
} from '@/lib/smoothScroll';

const SECTIONS = [
  { id: 'inicio', label: 'Início', hint: 'Topo da página' },
  { id: 'galeria', label: 'Galeria', hint: 'Seis produtos com preview' },
  { id: 'stack', label: 'Stack', hint: 'Tecnologias e onde rodam' },
  { id: 'sobre', label: 'Sobre', hint: 'Trajetória ano a ano' },
  { id: 'contato', label: 'Contato', hint: 'E-mail e redes' },
];

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProject: (index: number) => void;
}

/**
 * Paleta de comandos (⌘K / Ctrl K): navegar, abrir qualquer case e falar
 * comigo sem tirar a mão do teclado. O cmdk cuida da busca e da navegação
 * por setas; o Radix Dialog por baixo cuida de foco e `aria-modal`.
 *
 * Carregada sob demanda — ninguém baixa a paleta até pedir por ela.
 */
export default function CommandMenu({ open, onOpenChange, onOpenProject }: CommandMenuProps) {
  const { copied, copy } = useClipboard(1400);

  useEffect(() => {
    if (!open) return;
    lockSmoothScroll();
    return unlockSmoothScroll;
  }, [open]);

  // Fecha primeiro e age depois: a rolagem precisa da página destravada, e a
  // trava só sai quando a paleta desmonta.
  const run = (action: () => void) => {
    onOpenChange(false);
    requestAnimationFrame(() => requestAnimationFrame(action));
  };

  const goTo = (id: string) => {
    if (id === 'inicio') {
      scrollToTop();
      return;
    }
    const target = document.getElementById(id);
    if (target) scrollToElement(target);
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Menu de comandos"
      loop
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-dialog"
    >
      <div className="cmdk-head">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
        <Command.Input className="cmdk-input" placeholder="Busque uma seção, um case ou um contato…" />
        <kbd className="kbd">esc</kbd>
      </div>

      <Command.List className="cmdk-list" data-lenis-prevent>
        <Command.Empty className="cmdk-empty">Nada encontrado para essa busca.</Command.Empty>

        <Command.Group heading="Navegar">
          {SECTIONS.map((section) => (
            <Command.Item
              key={section.id}
              value={`seção ${section.label}`}
              keywords={[section.id, section.hint]}
              onSelect={() => run(() => goTo(section.id))}
            >
              <span className="cmdk-item__icon">#</span>
              <span className="cmdk-item__label">{section.label}</span>
              <span className="cmdk-item__hint">{section.hint}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Cases">
          {PROJECTS.map((project, index) => (
            <Command.Item
              key={project.id}
              value={`case ${project.name}`}
              keywords={[project.shortName, project.stackLine, project.status]}
              onSelect={() => run(() => onOpenProject(index))}
            >
              <span className="cmdk-item__icon">{project.num}</span>
              <span className="cmdk-item__label">{project.name}</span>
              <span className="cmdk-item__hint">{project.status}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Contato">
          <Command.Item
            value="copiar e-mail"
            keywords={['email', EMAIL]}
            onSelect={() => {
              void copy(EMAIL).then((ok) => {
                if (ok) window.setTimeout(() => onOpenChange(false), 700);
              });
            }}
          >
            <span className="cmdk-item__icon">@</span>
            <span className="cmdk-item__label">{copied ? 'E-mail copiado ✓' : 'Copiar e-mail'}</span>
            <span className="cmdk-item__hint">{EMAIL}</span>
          </Command.Item>
          <Command.Item
            value="enviar e-mail"
            keywords={['email', 'mailto']}
            onSelect={() => run(() => window.location.assign(`mailto:${EMAIL}`))}
          >
            <span className="cmdk-item__icon">✉</span>
            <span className="cmdk-item__label">Enviar e-mail</span>
          </Command.Item>
          <Command.Item value="linkedin" onSelect={() => openExternal(LINKEDIN_URL)}>
            <span className="cmdk-item__icon">in</span>
            <span className="cmdk-item__label">LinkedIn ↗</span>
          </Command.Item>
          <Command.Item value="github" keywords={['código', 'repositórios']} onSelect={() => openExternal(GITHUB_URL)}>
            <span className="cmdk-item__icon">gh</span>
            <span className="cmdk-item__label">GitHub ↗</span>
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="cmdk-foot" aria-hidden="true">
        <span>
          <kbd className="kbd">↑</kbd>
          <kbd className="kbd">↓</kbd> navegar
        </span>
        <span>
          <kbd className="kbd">↵</kbd> abrir
        </span>
        <span>
          <kbd className="kbd">esc</kbd> fechar
        </span>
      </div>
    </Command.Dialog>
  );
}
