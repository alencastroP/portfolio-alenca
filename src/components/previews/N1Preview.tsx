import { useEffect, useRef, useState } from 'react';
import { N1_TICKETS } from '@/data/n1';
import { cx } from '@/lib/format';

type Phase = 'idle' | 'analyzing' | 'done';

const ANALYSIS_MS = 750;

const IDLE_RESULT =
  'Nenhuma classificação ainda. Dispare a triagem para categorizar, priorizar e sugerir o time responsável.';

export function N1Preview() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stop = () => window.clearTimeout(timer.current);

  const select = (next: number) => {
    stop();
    setIndex(next);
    setPhase('idle');
  };

  const triage = () => {
    if (phase === 'analyzing') return;
    setPhase('analyzing');
    stop();
    timer.current = window.setTimeout(() => setPhase('done'), ANALYSIS_MS);
  };

  const reset = () => {
    stop();
    setPhase('idle');
  };

  const selected = N1_TICKETS[index];

  const result =
    phase === 'done' ? selected.triage : phase === 'analyzing' ? 'Analisando o ticket…' : IDLE_RESULT;

  const buttonLabel =
    phase === 'analyzing' ? 'Analisando…' : phase === 'done' ? 'Triar novamente' : 'Triar com IA';

  return (
    <div className="pv-split pv-split--n1">
      <div className="pv-col">
        <div className="pv-head">
          <span className="pv-title">Fila de tickets</span>
          <span className="pv-note">{N1_TICKETS.length} abertos</span>
        </div>

        <div className="n1-list">
          {N1_TICKETS.map((ticket, i) => {
            const isClassified = phase === 'done' && i === index;
            return (
              <button
                type="button"
                key={ticket.id}
                onClick={() => select(i)}
                aria-pressed={i === index}
                className={cx('pv-option', i === index && 'is-selected')}
              >
                <span className="pv-option__head">
                  <span className="pv-note">{ticket.id}</span>
                  <span className={cx('tag', isClassified ? 'tag-accent' : 'tag-neutral')}>
                    {isClassified ? 'classificado' : 'novo'}
                  </span>
                </span>
                <span className="n1-subject">{ticket.subject}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pv-aside" key={selected.id}>
        <span className="pv-label">Ticket selecionado</span>
        {/* Remontado a cada troca de ticket para o detalhe entrar animado. */}
        <div className="n1-detail__subject rise-in">{selected.subject}</div>
        <p className="n1-detail__body rise-in">{selected.body}</p>

        <div className="n1-triage">
          <div className="n1-triage__label">Triagem assistida</div>
          <div className="n1-triage__result" aria-live="polite">
            {result}
          </div>
        </div>

        <div className="pv-actions">
          <button type="button" className="btn btn-primary" onClick={triage}>
            {buttonLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}
