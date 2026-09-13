import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { CaseSheet } from '@/components/CaseSheet';
import { Contact } from '@/components/Contact';
import { CustomCursor } from '@/components/CustomCursor';
import { Gallery } from '@/components/Gallery';
import { Hero } from '@/components/Hero';
import { HeroStage } from '@/components/hero/HeroStage';
import { Journey } from '@/components/Journey';
import { Nav } from '@/components/Nav';
import { SiteFooter } from '@/components/SiteFooter';
import { Spine } from '@/components/Spine';
import { Stack } from '@/components/Stack';
import { TechMarquee } from '@/components/TechMarquee';
import { PROJECTS } from '@/data/projects';
import { usePointerSpotlight } from '@/hooks/usePointerSpotlight';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useSpineProgress } from '@/hooks/useSpineProgress';
import { supportsViewTransitions, useViewTransition } from '@/hooks/useViewTransition';
import type { ProjectId } from '@/types';

// A paleta só existe para quem pede por ela (⌘K ou o botão da nav).
const CommandMenu = lazy(() => import('@/components/CommandMenu'));
const prefetchCommandMenu = () => {
  void import('@/components/CommandMenu');
};

/** Duração da saída em CSS da folha — acompanha `sheetOut` em case-sheet.css. */
const CLOSE_MS = 280;

/** O painel só volta para o card se ele estiver na tela — senão o morph voaria para fora dela. */
function isOnScreen(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

export default function App() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandMounted, setCommandMounted] = useState(false);

  const { containerRef, fillRef } = useSpineProgress<HTMLDivElement>();
  const transition = useViewTransition();
  const reduced = usePrefersReducedMotion();

  // O halo de fundo acompanha o ponteiro pela viewport inteira.
  const auroraRef = usePointerSpotlight<HTMLDivElement>({ viewport: true });

  useSmoothScroll();

  // Abrir a partir de um card: o card vira a folha (shared element). Com a
  // folha já aberta (paleta ⌘K, links da stack), é uma troca de case.
  const openCase = useCallback(
    (index: number, source?: HTMLElement | null) => {
      setClosing(false);
      const isOpen = openIndex !== null;
      transition(() => setOpenIndex(index), {
        kind: isOpen ? 'step' : 'open',
        from: isOpen ? null : source,
      });
    },
    [openIndex, transition],
  );

  const finishClose = useCallback(() => {
    setClosing(false);
    setOpenIndex(null);
  }, []);

  const close = useCallback(() => {
    if (openIndex === null || closing) return;

    if (supportsViewTransitions() && !reduced) {
      const card = document.querySelector<HTMLElement>(
        `[data-project-card="${PROJECTS[openIndex].id}"]`,
      );
      transition(finishClose, {
        kind: 'close',
        to: () => (card && isOnScreen(card) ? card : null),
      });
      return;
    }

    if (reduced) finishClose();
    else setClosing(true);
  }, [openIndex, closing, reduced, transition, finishClose]);

  useEffect(() => {
    if (!closing) return;
    const id = window.setTimeout(finishClose, CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [closing, finishClose]);

  // A seção de stack aponta para os projetos onde cada tecnologia é usada.
  const openById = useCallback(
    (id: ProjectId) => {
      const index = PROJECTS.findIndex((project) => project.id === id);
      if (index >= 0) openCase(index);
    },
    [openCase],
  );

  // Trocar de case é a transição que ganha em ser animada pelo navegador:
  // o painel permanece, só o conteúdo muda.
  const step = useCallback(
    (delta: number) => {
      transition(
        () =>
          setOpenIndex((current) =>
            current === null ? current : (current + delta + PROJECTS.length) % PROJECTS.length,
          ),
        { kind: 'step' },
      );
    },
    [transition],
  );

  const openCommand = useCallback(() => {
    setCommandMounted(true);
    setCommandOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandMounted(true);
        setCommandOpen((value) => !value);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <div className="page" ref={auroraRef}>
        <a className="skip-link" href="#galeria">
          Pular para a galeria
        </a>

        <div className="aurora" aria-hidden="true" />
        <HeroStage />

        <Nav onOpenCommand={openCommand} onPrefetchCommand={prefetchCommandMenu} />

        <main className="shell page__content">
          <div className="timeline" ref={containerRef}>
            <Spine fillRef={fillRef} />

            <Hero />
            <TechMarquee />

            <Gallery onOpen={openCase} />
            <hr className="hr section__divider" />

            <Stack onOpenProject={openById} />
            <hr className="hr section__divider" />

            <Journey />
            <hr className="hr section__divider" />

            <Contact />
          </div>
        </main>

        <SiteFooter />

        <div className="grain" aria-hidden="true" />
      </div>

      {openIndex !== null && (
        <CaseSheet
          project={PROJECTS[openIndex]}
          onClose={close}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          closing={closing}
          suspended={commandOpen || closing}
        />
      )}

      {commandMounted && (
        <Suspense fallback={null}>
          <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} onOpenProject={openCase} />
        </Suspense>
      )}

      {/* Fora da `.page`: o contexto isolado dela deixaria o cursor atrás da folha de case. */}
      <CustomCursor />
    </>
  );
}
