import { useCallback, useEffect, useRef, useState } from 'react';
import { domAnimation, LazyMotion, useMotionValue } from 'framer-motion';
import { SCREENSHOTS } from '@/data/screenshots';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { FloatingImageCard, type CardPose } from './FloatingImageCard';

/** Ponteiro "em lugar nenhum": longe de todos os cards, o campo repousa. */
const FAR = -1e5;

/**
 * A composição, na ordem dos arquivos. Desenhada à mão, não sorteada: um
 * card focal, dois pares que só se tocam no canto, vãos de verdade entre
 * eles e nenhuma borda repetida — as esquerdas caem em 5, 11, 19, 39 e 53%
 * do campo. Alinhar duas já basta para o olho ler uma coluna.
 */
const POSES: CardPose[] = [
  // Eixo — no alto, por cima do canto da corretora.
  { x: 66, y: 20, w: 54, sm: [70, 24, 52], rotate: 2.6, scale: 0.97, tilt: [3, -5], z: 3, dim: 0.16 },
  // Corretora — a mais alta e a mais afastada do centro.
  { x: 27, y: 11, w: 44, sm: [26, 13, 46], rotate: -3.4, scale: 0.93, tilt: [4, 6], z: 2, dim: 0.22 },
  // Ana Beatriz — embaixo, por cima do canto da Washington.
  { x: 36, y: 85, w: 50, sm: [34, 85, 50], rotate: -3.8, scale: 0.95, tilt: [-3, 5], z: 4, dim: 0.12 },
  // Washington — a captura mais clara: menor e no fundo, para não gritar.
  { x: 76, y: 70, w: 46, sm: [75, 74, 46], rotate: 3.6, scale: 0.92, tilt: [-4, -6], z: 1, dim: 0.3 },
  // N1 App — o card focal, solto no meio.
  { x: 50, y: 46, w: 62, sm: [50, 50, 62], rotate: -1.4, scale: 1, tilt: [2, -3], z: 5, dim: 0.04 },
];

const CARDS = SCREENSHOTS.slice(0, POSES.length);

/**
 * As capturas dos projetos soltas ao lado do título. O campo orquestra a
 * composição, a pilha, o card expandido por toque e o ponteiro que todos
 * sentem; o movimento de cada um mora no `FloatingImageCard`.
 */
export function HeroShowcase() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '120px' });
  const [expanded, setExpanded] = useState<number | null>(null);
  const fieldX = useMotionValue(FAR);
  const fieldY = useMotionValue(FAR);

  // A pilha só cresce: o último card apontado fica por cima, como foto
  // devolvida à mesa. Voltar à camada antiga faria ele pular para trás do
  // vizinho já em repouso.
  const topLayer = useRef(POSES.length);
  const claimLayer = useCallback(() => ++topLayer.current, []);

  // Um listener para o campo inteiro, e só com a vitrine na tela. O
  // ponteiro vai em coordenadas da página, que as âncoras dos cards também
  // usam: rolar não obriga ninguém a remedir. Motion values já agrupam as
  // escritas num rAF — nada de throttle manual.
  useEffect(() => {
    if (reduced || !inView) return;

    let active = false;
    let clientX = 0;
    let clientY = 0;
    const sync = () => {
      fieldX.set(active ? clientX + window.scrollX : FAR);
      fieldY.set(active ? clientY + window.scrollY : FAR);
    };

    const onPointerMove = (event: PointerEvent) => {
      // No toque, arrastar o dedo é rolar a página: o campo não reage.
      if (event.pointerType === 'touch') return;
      active = true;
      clientX = event.clientX;
      clientY = event.clientY;
      sync();
    };
    // Com o ponteiro parado, o scroll ainda move a página por baixo dele.
    const onScroll = () => {
      if (active) sync();
    };
    const onLeave = () => {
      active = false;
      sync();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      onLeave();
    };
  }, [reduced, inView, fieldX, fieldY]);

  // Tocar fora (ou Esc) recolhe o card expandido.
  useEffect(() => {
    if (expanded === null) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element && event.target.closest('[data-fcard]'))) setExpanded(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(null);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  if (!CARDS.length) return null;

  return (
    // `m` + `domAnimation` em vez de `motion`: só entra no bundle o que a
    // vitrine usa. Não dá para tirar o `LazyMotion` — é ele que traz o
    // renderer; sem ele o `m` pinta o estilo inicial e ignora os motion values.
    <LazyMotion features={domAnimation} strict>
      <div ref={ref} className="hero-showcase" role="group" aria-label="Capturas de projetos entregues">
        {CARDS.map((image, index) => {
          const pose = POSES[index];
          return (
            <FloatingImageCard
              // Trocar a preferência de movimento remonta os cards: as
              // transformações são montadas uma vez, com o modo fixo.
              key={`${image.src}:${reduced}`}
              image={image}
              pose={pose}
              // A pilha é "distribuída" de baixo para cima.
              delay={0.2 + (pose.z - 1) * 0.09}
              reduced={reduced}
              expanded={expanded === index}
              onToggle={() => setExpanded((current) => (current === index ? null : index))}
              claimLayer={claimLayer}
              fieldX={fieldX}
              fieldY={fieldY}
              depth={pose.z / POSES.length}
            />
          );
        })}
      </div>
    </LazyMotion>
  );
}
