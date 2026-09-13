import { useEffect, useRef, useState } from 'react';
import {
  API_ENDPOINTS,
  API_IDLE_HINT,
  API_METHOD_NOT_ALLOWED,
  API_METHODS,
  type HttpMethod,
} from '@/data/leaner';
import { cx } from '@/lib/format';

type Phase = 'idle' | 'loading' | 'done';

const REQUEST_MS = 600;

export function LeanerPreview() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = () => {
    window.clearTimeout(timer.current);
    setPhase('idle');
  };

  const send = () => {
    if (phase === 'loading') return;
    setPhase('loading');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase('done'), REQUEST_MS);
  };

  const endpoint = API_ENDPOINTS[endpointIndex];
  // O ambiente de treino é read-only: qualquer verbo além de GET devolve 405.
  const rejected = method !== 'GET';

  const response =
    phase === 'loading'
      ? '// enviando requisição…'
      : phase === 'done'
        ? rejected
          ? API_METHOD_NOT_ALLOWED
          : endpoint.body
        : API_IDLE_HINT;

  const status =
    phase === 'done'
      ? rejected
        ? '405 Method Not Allowed'
        : '200 OK'
      : phase === 'loading'
        ? 'enviando…'
        : 'aguardando';

  const statusVariant = phase === 'done' && !rejected ? 'tag-accent' : 'tag-neutral';

  return (
    <div className="pv-split pv-split--leaner">
      <div className="pv-col">
        <span className="pv-title">Montar requisição</span>

        <div className="pv-chips">
          {API_METHODS.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                setMethod(option);
                reset();
              }}
              aria-pressed={option === method}
              className={cx('pv-chip', 'pv-chip--method', option === method && 'is-active')}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="pv-stack pv-stack--field">
          <span className="pv-label">Endpoint</span>
          {API_ENDPOINTS.map((option, index) => (
            <button
              type="button"
              key={option.path}
              onClick={() => {
                setEndpointIndex(index);
                reset();
              }}
              aria-pressed={index === endpointIndex}
              className={cx(
                'pv-option',
                'pv-option--mono',
                index === endpointIndex && 'is-selected',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary pv-send" onClick={send}>
          {phase === 'loading' ? 'Enviando…' : 'Enviar requisição'}
        </button>
      </div>

      <div className="pv-col">
        <div className="pv-head pv-head--tight">
          <span className="pv-label">Resposta</span>
          <span className={`tag ${statusVariant}`}>{status}</span>
        </div>

        <pre className="pv-code" aria-live="polite">
          {response}
        </pre>
      </div>
    </div>
  );
}
