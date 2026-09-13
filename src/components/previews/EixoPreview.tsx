import { useState } from 'react';
import { EIXO_MODULES } from '@/data/eixo';
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';
import { cx } from '@/lib/format';

export function EixoPreview() {
  const [index, setIndex] = useState(0);
  const active = EIXO_MODULES[index];
  const { ref: tabsRef, rect: indicator } = useSlidingIndicator<HTMLDivElement>(active.name);

  return (
    <div>
      <div className="eixo-head">
        <span className="pv-title">Painel de Rodagem</span>
        <span className="pv-note">módulo ativo: {active.name}</span>
      </div>

      <div className="eixo-tabs" ref={tabsRef} role="group" aria-label="Módulos do Painel de Rodagem">
        <span
          className="eixo-tabs__indicator"
          aria-hidden="true"
          style={{
            transform: `translate(${indicator.x}px, ${indicator.y}px)`,
            width: indicator.width,
            height: indicator.height,
            opacity: indicator.width ? 1 : 0,
          }}
        />

        {EIXO_MODULES.map((module, i) => (
          <button
            type="button"
            key={module.name}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={cx('pv-chip', i === index && 'is-active')}
          >
            {module.name}
          </button>
        ))}
      </div>

      {/* `key` no módulo ativo: trocar de aba remonta o bloco e as
          animações de entrada tocam de novo, escalonadas. */}
      <div className="pv-metrics" key={active.name}>
        {active.metrics.map((metric) => (
          <div className="pv-metric rise-in" key={metric.label}>
            <div className="pv-metric__label">{metric.label}</div>
            <div className={cx('pv-metric__value', metric.accent && 'pv-metric__value--accent')}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="pv-table" key={`${active.name}-table`}>
        <div className="pv-table__row pv-table__row--head">
          {active.columns.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>

        {active.rows.map((row) => (
          <div className="pv-table__row rise-in" key={row.primary}>
            <span>{row.primary}</span>
            <span className="pv-table__muted">{row.secondary}</span>
            <span className={`tag ${row.statusVariant}`}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
