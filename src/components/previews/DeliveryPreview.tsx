import { useState } from 'react';
import { DEL_MENU } from '@/data/delivery';
import { brl, cx } from '@/lib/format';

const EMPTY_MESSAGE = '*Novo pedido*\n\n(carrinho vazio, adicione itens ao lado)';

export function DeliveryPreview() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sent, setSent] = useState(false);

  const change = (id: string, delta: number) => {
    setQuantities((current) => ({ ...current, [id]: Math.max((current[id] ?? 0) + delta, 0) }));
    setSent(false);
  };

  const chosen = DEL_MENU.map((item) => ({ item, qty: quantities[item.id] ?? 0 })).filter(
    (line) => line.qty > 0,
  );
  const total = chosen.reduce((sum, line) => sum + line.qty * line.item.price, 0);
  const isEmpty = chosen.length === 0;

  const message = isEmpty
    ? EMPTY_MESSAGE
    : [
        '*Novo pedido · Mesa/Entrega*',
        '',
        ...chosen.map(
          (line) => `${line.qty}× ${line.item.name}  ${brl(line.qty * line.item.price)}`,
        ),
        '',
        `*Total: ${brl(total)}*`,
        'Pagamento: a combinar',
        'Endereço: informado no chat',
      ].join('\n');

  const buttonLabel = isEmpty
    ? 'Adicione um item'
    : sent
      ? 'Pedido enviado ✓'
      : 'Enviar para o WhatsApp →';

  return (
    <div className="pv-split pv-split--delivery">
      <div className="pv-col">
        <span className="pv-title">Monte seu pedido</span>

        <div className="pv-stack pv-stack--field">
          {DEL_MENU.map((item) => {
            const qty = quantities[item.id] ?? 0;
            return (
              <div className="del-item" key={item.id}>
                <div>
                  <div className="del-item__name">{item.name}</div>
                  <div className="del-item__price">{brl(item.price)}</div>
                </div>

                <div className="del-item__qty">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => change(item.id, -1)}
                    disabled={qty === 0}
                    aria-label={`Remover ${item.name}`}
                  >
                    −
                  </button>
                  <span className={cx('del-item__count', qty > 0 && 'is-active')}>{qty}</span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => change(item.id, 1)}
                    aria-label={`Adicionar ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pv-aside">
        <div className="pv-head pv-head--tight">
          <span className="pv-label">Mensagem gerada</span>
          <span className="del-total">{brl(total)}</span>
        </div>

        <pre className="pv-code pv-code--message">{message}</pre>

        <button
          type="button"
          className="btn btn-primary pv-send"
          onClick={() => setSent(true)}
          disabled={isEmpty}
        >
          {buttonLabel}
        </button>

        <div className="pv-confirm" aria-live="polite">
          {sent && !isEmpty
            ? `Mensagem aberta no WhatsApp do estabelecimento: ${chosen.length} item(ns), ${brl(total)}.`
            : ''}
        </div>
      </div>
    </div>
  );
}
