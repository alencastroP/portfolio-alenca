import { useRef, useState } from 'react';
import {
  INGREDIENTS,
  RECIPES,
  type Recipe,
  describeCost,
  fullStock,
  ingredientById,
} from '@/data/gestao';
import { cx } from '@/lib/format';

interface LogEntry {
  id: number;
  text: string;
}

const LOG_LIMIT = 4;
const LOW_STOCK_PCT = 30;

export function GestaoPreview() {
  const [stock, setStock] = useState<Record<string, number>>(fullStock);
  const [log, setLog] = useState<LogEntry[]>([]);
  const nextLogId = useRef(0);

  const pushLog = (text: string) => {
    nextLogId.current += 1;
    const entry = { id: nextLogId.current, text };
    setLog((current) => [entry, ...current].slice(0, LOG_LIMIT));
  };

  const produce = (recipe: Recipe) => {
    const missing = Object.entries(recipe.cost).find(([id, amount]) => (stock[id] ?? 0) < amount);

    if (missing) {
      const name = ingredientById(missing[0])?.name.toLowerCase() ?? missing[0];
      pushLog(`⚠ Falta ${name} para ${recipe.name}`);
      return;
    }

    setStock((current) => {
      const next = { ...current };
      for (const [id, amount] of Object.entries(recipe.cost)) next[id] -= amount;
      return next;
    });
    pushLog(`✓ Produzido: ${recipe.name} · baixa automática`);
  };

  const restock = () => {
    setStock(fullStock());
    setLog([]);
  };

  return (
    <div className="pv-split pv-split--gestao">
      <div className="pv-col">
        <span className="pv-title">Estoque de insumos</span>

        <div className="pv-stack pv-stack--field">
          {INGREDIENTS.map((ingredient) => {
            const amount = stock[ingredient.id] ?? 0;
            const pct = Math.max(0, Math.min(100, (amount / ingredient.full) * 100));
            const isLow = pct < LOW_STOCK_PCT;

            return (
              <div className="stock-item" key={ingredient.id}>
                <div className="stock-item__head">
                  <span>{ingredient.name}</span>
                  <span className={cx('stock-item__amount', isLow && 'is-low')}>
                    {amount} {ingredient.unit}
                  </span>
                </div>
                <div className="stock-bar">
                  <div
                    className={cx('stock-bar__fill', isLow && 'is-low')}
                    style={{ width: `${pct.toFixed(0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pv-aside">
        <span className="pv-title">Produzir encomenda</span>

        <div className="pv-stack pv-stack--field">
          {RECIPES.map((recipe) => (
            <div className="recipe" key={recipe.id}>
              <div className="recipe__head">
                <span>{recipe.name}</span>
                <button type="button" className="btn btn-secondary" onClick={() => produce(recipe)}>
                  Produzir
                </button>
              </div>
              <div className="recipe__cost">consome {describeCost(recipe)}</div>
            </div>
          ))}
        </div>

        <div className="gest-log">
          <span className="pv-label">Movimentações</span>
          <ul className="gest-log__list" aria-live="polite">
            {log.length === 0 ? (
              <li>Nenhuma movimentação ainda.</li>
            ) : (
              log.map((entry) => <li key={entry.id}>{entry.text}</li>)
            )}
          </ul>
        </div>

        <button type="button" className="btn btn-ghost pv-send" onClick={restock}>
          Repor estoque
        </button>
      </div>
    </div>
  );
}
