import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LiveSitePreview, RECREATIONS } from '@/components/previews';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useCountUp } from '@/hooks/useCountUp';
import { usePointerSpotlight } from '@/hooks/usePointerSpotlight';
import { cx } from '@/lib/format';
import type { Project } from '@/types';

interface CaseSheetProps {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Saída animada em CSS (navegadores sem View Transitions). */
  closing?: boolean;
  /** Outro overlay por cima (a paleta ⌘K): as teclas não são desta folha. */
  suspended?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Setas navegam entre cases — exceto quando o foco está num campo de texto. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

export function CaseSheet({
  project,
  onClose,
  onPrev,
  onNext,
  closing = false,
  suspended = false,
}: CaseSheetProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = usePointerSpotlight<HTMLDivElement>();

  // O painel precisa de dois refs: um para foco/armadilha de Tab, outro
  // para o spotlight. O ref de callback alimenta os dois.
  const attachPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      spotlightRef.current = node;
    },
    [spotlightRef],
  );

  const impact = useCountUp(project.impact);

  useBodyScrollLock(true);

  // Foco vai para a folha ao abrir e volta para o card ao fechar.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Com um preview em tela cheia, Esc e setas pertencem ao preview: sair
      // da tela cheia não pode fechar o case junto. O mesmo vale para a
      // paleta de comandos aberta por cima.
      if (suspended || document.fullscreenElement) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (!isTypingTarget(event.target)) {
        if (event.key === 'ArrowRight') {
          onNext();
          return;
        }
        if (event.key === 'ArrowLeft') {
          onPrev();
          return;
        }
      }

      // Armadilha de foco: o Tab circula dentro da folha em vez de escapar
      // para a página congelada atrás dela.
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNext, onPrev, suspended]);

  // Navegar entre cases não deve manter o scroll do case anterior.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [project.id]);

  const isLive = project.previewKind === 'live' && !!project.liveUrl;
  const Recreation = RECREATIONS[project.id];

  return createPortal(
    // `data-lenis-prevent`: a folha rola nativamente, fora do scroll suave.
    <div className={cx('sheet', closing && 'is-closing')} ref={scrollRef} data-lenis-prevent>
      <button
        type="button"
        className="sheet__scrim"
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        className="dialog elev-lg sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        ref={attachPanel}
        tabIndex={-1}
      >
        <div className="sheet__glow" aria-hidden="true" />

        <div className="sheet__header">
          <div>
            <div className="sheet__badges">
              <span className="sheet__kicker">{project.num} · case</span>
              <span className={`tag ${project.statusVariant}`}>{project.status}</span>
              {project.period && <span className="sheet__period">{project.period}</span>}
              {project.isHero && (
                <span className="tag tag-accent tag-ring ring">projeto herói</span>
              )}
            </div>
            <h2 className="sheet__title" id="case-title">
              {project.name}
            </h2>
            <p className="sheet__lead">{project.short}</p>
          </div>

          <button type="button" className="btn btn-ghost sheet__close" onClick={onClose}>
            Fechar ✕
          </button>
        </div>

        <div className="sheet__body" key={project.id}>
          <div className="case-grid">
            <div className="rise-in">
              <div className="case-grid__label">O problema</div>
              <p className="case-grid__text">{project.problem}</p>
            </div>

            <div className="rise-in">
              <div className="case-grid__label">A decisão técnica</div>
              <p className="case-grid__text">{project.decision}</p>
            </div>

            <div className="case-grid__result rise-in">
              <div className="case-grid__label">O resultado</div>
              <div className="case-grid__impact">{impact}</div>
              <p className="case-grid__impact-label">{project.impactLabel}</p>
            </div>
          </div>

          <div className="sheet__stack">
            {project.stack.map((item) => (
              <span className="tag tag-neutral rise-in" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="preview">
          <div className="preview__head">
            <div className="preview__label">
              {isLive ? 'Aplicação em produção' : 'Preview interativo'}
            </div>
            <div className="preview__hint">{project.previewHint}</div>
          </div>

          <div className="preview__window">
            <div className="preview__chrome">
              <span className="preview__chrome-dot" />
              <span className="preview__chrome-dot" />
              <span className="preview__chrome-dot" />
              <span className="preview__url">{project.previewUrl}</span>
              <span className={`tag preview__badge ${isLive ? 'tag-accent ring' : 'tag-outline'}`}>
                {isLive ? 'site ao vivo' : 'recriação navegável'}
              </span>
            </div>

            <div className={`preview__stage${isLive ? ' preview__stage--live' : ''}`}>
              {isLive && project.liveUrl ? (
                <LiveSitePreview
                  url={project.liveUrl}
                  title={`${project.name} · site em produção`}
                />
              ) : (
                Recreation && <Recreation />
              )}
            </div>
          </div>
        </div>

        <div className="sheet__footer">
          <span className="sheet__privacy">{project.privacyNote}</span>
          <div className="sheet__nav">
            <button type="button" className="btn btn-ghost" onClick={onPrev}>
              ← Anterior
            </button>
            <button type="button" className="btn btn-secondary" onClick={onNext}>
              Próximo →
            </button>
            <kbd className="sheet__hint">← →</kbd>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
