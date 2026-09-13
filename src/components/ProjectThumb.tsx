import type { ReactElement } from 'react';
import { screenshotOf } from '@/data/screenshots';
import { cx } from '@/lib/format';
import type { ProjectId } from '@/types';

/**
 * Silhueta de cada app, para os projetos que ainda não têm captura — a
 * mesma moldura de navegador, corpos diferentes. Um wireframe genérico
 * repetido faria a galeria parecer template; a silhueta faz o oposto.
 */
const MINIATURES: Record<ProjectId, ReactElement> = {
  // Fila de tickets + painel de triagem.
  n1: (
    <div className="mini mini--n1">
      <div className="mini__list">
        <span className="mini__ticket is-active" />
        <span className="mini__ticket" />
        <span className="mini__ticket" />
      </div>
      <div className="mini__panel">
        <span className="mini__line mini__line--strong" />
        <span className="mini__line" />
        <span className="mini__line mini__line--short" />
        <span className="mini__badge">IA</span>
      </div>
    </div>
  ),

  // Abas do Painel de Rodagem + tiles de métrica.
  eixo: (
    <div className="mini mini--eixo">
      <div className="mini__tabs">
        <span className="is-active" />
        <span />
        <span />
        <span />
      </div>
      <div className="mini__tiles">
        <span />
        <span />
        <span />
      </div>
      <div className="mini__table">
        <span />
        <span />
      </div>
    </div>
  ),

  // Cardápio à esquerda, mensagem de WhatsApp à direita.
  delivery: (
    <div className="mini mini--delivery">
      <div className="mini__menu">
        <span />
        <span />
        <span />
      </div>
      <div className="mini__bubble">
        <span />
        <span />
        <span className="mini__line--short" />
      </div>
    </div>
  ),

  // Landing de conversão: chamada + CTA, retrato e depoimentos.
  'ana-beatriz': (
    <div className="mini mini--landing">
      <div className="mini__hero">
        <div className="mini__copy">
          <span className="mini__line mini__line--strong" />
          <span className="mini__line" />
          <span className="mini__line mini__line--short" />
          <span className="mini__cta" />
        </div>
        <span className="mini__portrait" />
      </div>
      <div className="mini__quotes">
        <span />
        <span />
        <span />
      </div>
    </div>
  ),

  // Vitrine white-label: estoque em grade + atendimento do agente de IA.
  washi: (
    <div className="mini mini--store">
      <div className="mini__cars">
        <span />
        <span />
        <span />
        <span className="is-dim" />
      </div>
      <div className="mini__chat">
        <span className="mini__badge">IA</span>
        <span className="mini__bubble-in" />
        <span className="mini__bubble-out" />
        <span className="mini__bubble-in mini__bubble-in--short" />
      </div>
    </div>
  ),

  // Trajeto: origem, percurso e destino, com o preço ancorado.
  transfer: (
    <div className="mini mini--transfer">
      <div className="mini__route">
        <span className="mini__node" />
        <span className="mini__path" />
        <span className="mini__node mini__node--end" />
      </div>
      <div className="mini__fare">
        <span className="mini__badge">R$</span>
        <span className="mini__line mini__line--short" />
      </div>
      <div className="mini__seats">
        <span />
        <span />
        <span />
        <span className="is-dim" />
      </div>
    </div>
  ),
};

// Largura da capa em cada grade (3 colunas → 2 → 1); o herói ocupa duas.
const SIZES = '(max-width: 640px) 92vw, (max-width: 1020px) 46vw, 340px';
const HERO_SIZES = '(max-width: 1020px) 92vw, 700px';

interface ProjectThumbProps {
  id: ProjectId;
  hint: string;
  /** Card herói: a capa cresce para ocupar a altura de duas linhas. */
  hero?: boolean;
}

/**
 * A capa do card é o próprio projeto: a captura real, dentro da moldura de
 * navegador. Quem ainda não tem captura segue com a silhueta em CSS.
 */
export function ProjectThumb({ id, hint, hero }: ProjectThumbProps) {
  const shot = screenshotOf(id);

  return (
    <div className={cx('thumb', `thumb--${id}`, hero && 'thumb--hero', shot && 'thumb--shot')} aria-hidden="true">
      <div className="thumb__chrome">
        <span className="thumb__dot" />
        <span className="thumb__dot thumb__dot--dim" />
        <span className="thumb__url" />
      </div>

      <div className="thumb__body">
        {shot ? (
          // `alt` vazio: o card é um botão com nome e resumo próprios, e a
          // capa inteira já é `aria-hidden`.
          <img
            className="thumb__shot"
            src={shot.src}
            srcSet={shot.srcSet}
            sizes={hero ? HERO_SIZES : SIZES}
            width={shot.width}
            height={shot.height}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          MINIATURES[id]
        )}
      </div>

      <span className="project-card__hint">{hint}</span>
    </div>
  );
}
