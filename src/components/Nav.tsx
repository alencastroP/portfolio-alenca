import { BrandMark } from '@/components/BrandMark';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';
import { cx } from '@/lib/format';

const LINKS = [
  { id: 'galeria', label: 'Galeria' },
  { id: 'stack', label: 'Stack' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'contato', label: 'Contato' },
] as const;

// Constante de módulo: o scroll-spy observa pela identidade do array.
const SPY_IDS = LINKS.map((link) => link.id);

const SHORTCUT = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';

interface NavProps {
  onOpenCommand: () => void;
  /** Baixa a paleta assim que o ponteiro chega perto do botão. */
  onPrefetchCommand: () => void;
}

export function Nav({ onOpenCommand, onPrefetchCommand }: NavProps) {
  const progressRef = useScrollProgress<HTMLSpanElement>();
  const active = useScrollSpy(SPY_IDS);
  const { ref: linksRef, rect } = useSlidingIndicator<HTMLDivElement>(active ?? 'none');

  return (
    <header className="nav-bar">
      <span className="nav-bar__progress" ref={progressRef} aria-hidden="true" />

      <div className="shell">
        <nav className="nav" aria-label="Navegação principal">
          <a className="nav-brand" href="#inicio" aria-label="Pedro Alencastro — início">
            <BrandMark className="brand-mark" />
            {/* Um item flex só para o nome: senão o `gap` entraria entre
                "Alencastro" e o ponto. */}
            <span className="nav-brand__name">
              Pedro Alencastro<span className="accent">.</span>
            </span>
          </a>

          <div className="nav-links" ref={linksRef}>
            <span
              className="nav-links__indicator"
              aria-hidden="true"
              style={{
                transform: `translate(${rect.x}px, ${rect.y}px)`,
                width: rect.width,
                height: rect.height,
                opacity: rect.width ? 1 : 0,
              }}
            />
            {LINKS.map((link) => (
              <a
                key={link.id}
                className={cx('nav-link', active === link.id && 'is-active')}
                href={`#${link.id}`}
                aria-current={active === link.id ? 'location' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          <span className="availability ring">
            <span className="availability__dot" aria-hidden="true" />
            {/* Um item flex só para o texto: senão o `gap` da pílula entraria
                entre "Disponível" e "para vagas". */}
            <span>
              Disponível<span className="availability__more"> para vagas</span>
            </span>
          </span>

          <button
            type="button"
            className="nav-cmd"
            onClick={onOpenCommand}
            onPointerEnter={onPrefetchCommand}
            onFocus={onPrefetchCommand}
            aria-label="Abrir menu de comandos"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <svg
              className="nav-cmd__icon"
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
            <kbd className="kbd nav-cmd__kbd">{SHORTCUT}</kbd>
          </button>
        </nav>
      </div>
    </header>
  );
}
