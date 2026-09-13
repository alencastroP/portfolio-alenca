import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor-label]';

/**
 * Anel que segue o ponteiro com atraso e reage ao que está embaixo: cresce
 * sobre algo clicável e vira uma pílula com texto sobre os cards
 * (`data-cursor-label`). O cursor nativo continua lá — o anel acompanha, não
 * substitui, então precisão e acessibilidade não mudam.
 *
 * Mesma regra do resto do site: a posição é escrita direto no DOM num rAF,
 * sem estado do React a cada movimento.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [fine, setFine] = useState(() => window.matchMedia(FINE_POINTER).matches);

  useEffect(() => {
    const query = window.matchMedia(FINE_POINTER);
    const sync = () => setFine(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const enabled = fine && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    const label = labelRef.current;
    if (!enabled || !root || !label) return;

    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;
    let visible = false;

    const render = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      // O loop dorme quando o anel alcança o ponteiro.
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(render) : 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        x = targetX;
        y = targetY;
        root.dataset.visible = 'true';
      }
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
      const text = target?.getAttribute('data-cursor-label') ?? '';
      root.dataset.state = text ? 'label' : target ? 'hover' : 'idle';
      if (text) label.textContent = text;
    };

    // Saiu da janela (ou entrou num iframe): o anel some em vez de congelar na borda.
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      visible = false;
      root.dataset.visible = 'false';
    };

    const onDown = () => {
      root.dataset.pressed = 'true';
    };
    const onUp = () => {
      root.dataset.pressed = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor" ref={rootRef} data-visible="false" data-state="idle" aria-hidden="true">
      <span className="cursor__ring" />
      <span className="cursor__label" ref={labelRef} />
    </div>
  );
}
