import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { animate, m, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

export interface CardImage {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Pose de repouso de um card. Centro e largura em % do campo; `sm` é a
 * mesma coisa no campo empilhado (≤ 1024px).
 */
export interface CardPose {
  x: number;
  y: number;
  w: number;
  sm: readonly [x: number, y: number, w: number];
  /** Rotação no plano, em graus. */
  rotate: number;
  scale: number;
  /** rotateX/rotateY de repouso: profundidade estática, sem ponteiro nenhum. */
  tilt: readonly [x: number, y: number];
  /** Posição na pilha (1 = fundo). */
  z: number;
  /** Véu do fundo sobre a captura em repouso (0–1): quem está mais atrás apaga mais. */
  dim: number;
}

interface FloatingImageCardProps {
  image: CardImage;
  pose: CardPose;
  /** Atraso da entrada, em segundos. */
  delay: number;
  /** Movimento reduzido. Fixo durante a vida do card — o campo remonta se mudar. */
  reduced: boolean;
  /** Expandido por toque. Quem decide é o campo, para haver um por vez. */
  expanded: boolean;
  onToggle: () => void;
  /** Reserva a próxima camada do topo da pilha. */
  claimLayer: () => number;
  /** Ponteiro no campo, em coordenadas da página — bem longe quando não há. */
  fieldX: MotionValue<number>;
  fieldY: MotionValue<number>;
  /** 0 = fundo da pilha, 1 = frente: quem está na frente reage mais (paralaxe). */
  depth: number;
}

// ±12°: somada à perspectiva de 800px e à escala de 1,2×, uma inclinação
// acima de ~15° encurta a borda de trás a ponto de borrar o texto da captura.
const MAX_TILT = 12;
const LIFT_SCALE = 1.2;
const REDUCED_LIFT = 1.05;

// Proximidade: até 14px de puxão e 6° de giro — metade da inclinação do
// hover, para o card apontado continuar sendo o protagonista.
const NEAR_PULL = 14;
const NEAR_TILT = 6;

// O spring da inclinação só filtra o tremor do mouse: amortecido, não quica.
const TILT_SPRING = { stiffness: 170, damping: 22, mass: 0.6 };
// Mais mole: os vizinhos chegam com um atraso de inércia — é isso que lê
// como um campo reagindo, e não como cards colados no cursor.
const NEAR_SPRING = { stiffness: 90, damping: 18, mass: 0.8 };
// ζ ≈ 0,9: assenta em ~350ms, sem quique.
const LIFT_SPRING = { type: 'spring', stiffness: 250, damping: 27, mass: 0.9 } as const;
const LIFT_TWEEN = { duration: 0.22, ease: 'easeOut' } as const;
const ENTER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Anchor {
  x: number;
  y: number;
  reach: number;
}

interface Nudge {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

const STILL: Nudge = { x: 0, y: 0, rx: 0, ry: 0 };

/**
 * Centro do card na página, somando `offsetLeft/Top` — o layout puro, que
 * ignora transformações: nem a revelação da seção, nem a saída por scroll,
 * nem o próprio puxão do card deslocam a âncora. Com `translate: -50% -50%`
 * no invólucro, o canto do layout já é o centro visual.
 */
function layoutCenter(element: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

/**
 * Uma captura solta no espaço. Com o cursor por perto, se inclina e é
 * puxada na direção dele; apontada com mouse ou caneta, sai da mesa:
 * cresce, se endireita e inclina acompanhando o cursor. No toque não há
 * cursor para seguir — um toque expande, e o campo recolhe.
 *
 * Nada aqui passa pelo estado do React a cada quadro: o ponteiro vira
 * motion value, e o Framer Motion escreve só `transform` e `opacity`.
 */
export function FloatingImageCard({
  image,
  pose,
  delay,
  reduced,
  expanded,
  onToggle,
  claimLayer,
  fieldX,
  fieldY,
  depth,
}: FloatingImageCardProps) {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rect = useRef<DOMRect | null>(null);
  const anchor = useRef<Anchor | null>(null);
  const lastNudge = useRef({ px: Number.NaN, py: Number.NaN, value: STILL });
  const hovering = useRef(false);
  const pointerType = useRef('');
  const wasExpanded = useRef(false);
  const [loaded, setLoaded] = useState(false);

  // 0 = repouso, 1 = na mão. Um valor só dirige escala, rotação, véu,
  // sombra e reflexo: tudo chega junto, com um spring só por card.
  const lift = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const enterY = useMotionValue(reduced ? 0 : 28);
  const opacity = useMotionValue(0);

  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), TILT_SPRING);
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), TILT_SPRING);

  // As quatro saídas da proximidade vêm da mesma conta: ela roda uma vez
  // por posição do ponteiro e as outras três leem o resultado guardado.
  const nudge = (px: number, py: number): Nudge => {
    const last = lastNudge.current;
    if (px === last.px && py === last.py) return last.value;

    let value = STILL;
    const slot = slotRef.current;
    if (!reduced && slot) {
      const a = (anchor.current ??= {
        ...layoutCenter(slot),
        reach: Math.min(Math.max(slot.offsetWidth * 1.7, 260), 520),
      });
      const dx = px - a.x;
      const dy = py - a.y;
      const distance = Math.hypot(dx, dy);

      if (distance < a.reach) {
        const n = distance / a.reach;
        const weight = 0.45 + 0.55 * depth;
        // Puxão nulo no centro e na borda do raio, máximo a um terço dele:
        // o card procura o cursor que se aproxima, sem grudar nele.
        const pull = n * (1 - n) ** 2 * 6.75 * NEAR_PULL * weight;
        // Giro: vira a face para o cursor, mais forte quanto mais perto.
        const turn = ((1 - n) * 4 * NEAR_TILT * weight) / a.reach;
        value = {
          x: distance ? (dx / distance) * pull : 0,
          y: distance ? (dy / distance) * pull : 0,
          rx: -dy * turn,
          ry: dx * turn,
        };
      }
    }

    lastNudge.current = { px, py, value };
    return value;
  };

  const nearX = useSpring(useTransform([fieldX, fieldY], ([px, py]: number[]) => nudge(px, py).x), NEAR_SPRING);
  const nearY = useSpring(useTransform([fieldX, fieldY], ([px, py]: number[]) => nudge(px, py).y), NEAR_SPRING);
  const nearRX = useSpring(useTransform([fieldX, fieldY], ([px, py]: number[]) => nudge(px, py).rx), NEAR_SPRING);
  const nearRY = useSpring(useTransform([fieldX, fieldY], ([px, py]: number[]) => nudge(px, py).ry), NEAR_SPRING);

  // Na mão, a proximidade e a profundidade de repouso cedem lugar à
  // inclinação do ponteiro — mesmo sinal, então a passagem é contínua.
  const [restX, restY] = pose.tilt;
  const x = useTransform([lift, nearX], ([l, v]: number[]) => v * (1 - l));
  const y = useTransform([lift, nearY, enterY], ([l, v, e]: number[]) => e + v * (1 - l));
  const rotateX = useTransform([lift, tiltX, nearRX], ([l, t, v]: number[]) =>
    reduced ? restX : (restX + v) * (1 - l) + t,
  );
  const rotateY = useTransform([lift, tiltY, nearRY], ([l, t, v]: number[]) =>
    reduced ? restY : (restY + v) * (1 - l) + t,
  );
  const rotate = useTransform(lift, [0, 1], [pose.rotate, reduced ? pose.rotate : 0]);
  const scale = useTransform(lift, [0, 1], [pose.scale, reduced ? pose.scale * REDUCED_LIFT : LIFT_SCALE]);
  const veil = useTransform(lift, [0, 1], [pose.dim, 0]);
  const shadow = useTransform(lift, [0, 1], [0, 0.7]);

  // O reflexo corre sob o cursor, lendo a inclinação já suavizada; em % do
  // próprio tamanho (2× o card), então ±25% leva o centro até a borda.
  const sheenX = useTransform(tiltY, (t) => `${(t / MAX_TILT) * 25}%`);
  const sheenY = useTransform(tiltX, (t) => `${(-t / MAX_TILT) * 25}%`);
  const sheen = useTransform(lift, [0, 1], [0, reduced ? 0 : 1]);

  const setLifted = (on: boolean) => {
    // z-index muda ordem de pintura, não layout — e só na troca, não por quadro.
    if (on && slotRef.current) slotRef.current.style.zIndex = String(claimLayer());
    animate(lift, on ? 1 : 0, reduced ? LIFT_TWEEN : LIFT_SPRING);
  };

  useEffect(() => {
    if (expanded === wasExpanded.current) return;
    wasExpanded.current = expanded;
    setLifted(expanded);
  }, [expanded]);

  // Entrada: só depois da imagem decodificada, para nenhum card surgir pela metade.
  useEffect(() => {
    if (!loaded) return;
    const transition = { duration: reduced ? 0.4 : 0.9, delay: reduced ? 0 : delay, ease: ENTER_EASE };
    const fade = animate(opacity, 1, transition);
    const rise = animate(enterY, 0, transition);
    return () => {
      fade.stop();
      rise.stop();
    };
  }, [loaded]);

  // O retângulo do hover é do invólucro, que nunca gira: medir o card
  // inclinado seria um laço (a inclinação muda o retângulo, que muda a
  // inclinação). Ele muda com scroll; a âncora da proximidade, só quando o
  // campo muda de tamanho ou de lugar. Nos dois casos, remede no próximo uso.
  useEffect(() => {
    const field = slotRef.current?.parentElement;
    const invalidateRect = () => {
      rect.current = null;
    };
    const invalidateAll = () => {
      rect.current = null;
      anchor.current = null;
      lastNudge.current = { px: Number.NaN, py: Number.NaN, value: STILL };
    };

    window.addEventListener('scroll', invalidateRect, { passive: true });
    window.addEventListener('resize', invalidateAll);
    const observer = field ? new ResizeObserver(invalidateAll) : null;
    if (field) observer?.observe(field);

    return () => {
      window.removeEventListener('scroll', invalidateRect);
      window.removeEventListener('resize', invalidateAll);
      observer?.disconnect();
    };
  }, []);

  // Imagem vinda do cache pode terminar antes do `onLoad` existir.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) setLoaded(true);
  }, []);

  const follow = (event: ReactPointerEvent<HTMLDivElement>) => {
    const slot = slotRef.current;
    if (reduced || !slot) return;
    const box = (rect.current ??= slot.getBoundingClientRect());
    pointerX.set((event.clientX - box.left) / box.width - 0.5);
    pointerY.set((event.clientY - box.top) / box.height - 0.5);
  };

  const onPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    // No toque, "passar por cima" não existe: simular cursor ali só brigaria
    // com o scroll. Mouse e caneta têm hover de verdade.
    if (event.pointerType === 'touch') return;
    hovering.current = true;
    rect.current = null;
    setLifted(true);
    follow(event);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (hovering.current) follow(event);
  };

  const onPointerLeave = () => {
    if (!hovering.current) return;
    hovering.current = false;
    pointerX.set(0);
    pointerY.set(0);
    if (!expanded) setLifted(false);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerType.current = event.pointerType;
  };

  const onClick = () => {
    if (pointerType.current === 'touch') onToggle();
  };

  const [smX, smY, smW] = pose.sm;
  const vars = {
    '--fc-x': `${pose.x}%`,
    '--fc-y': `${pose.y}%`,
    '--fc-w': `${pose.w}%`,
    '--fc-x-sm': `${smX}%`,
    '--fc-y-sm': `${smY}%`,
    '--fc-w-sm': `${smW}%`,
    '--fc-z': pose.z,
  } as CSSProperties;

  // Pede a largura do card já na mão (1,2×): o WebP escolhido aguenta a
  // expansão sem amolecer, e nenhum PNG original chega ao navegador.
  const sizes = `(min-width: 1025px) ${Math.round(pose.w * 7)}px, ${Math.round(smW * 1.1)}vw`;

  return (
    <div
      ref={slotRef}
      className="fcard"
      data-fcard=""
      style={vars}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <m.div className="fcard__body" style={{ x, y, rotate, scale, rotateX, rotateY, opacity }}>
        <m.span className="fcard__shadow" style={{ opacity: shadow }} aria-hidden="true" />
        <span className="fcard__frame">
          <img
            ref={imgRef}
            src={image.src}
            srcSet={image.srcSet}
            sizes={sizes}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            draggable={false}
            onLoad={() => setLoaded(true)}
          />
          <m.span className="fcard__veil" style={{ opacity: veil }} aria-hidden="true" />
          <m.span className="fcard__sheen" style={{ x: sheenX, y: sheenY, opacity: sheen }} aria-hidden="true" />
        </span>
      </m.div>
    </div>
  );
}
