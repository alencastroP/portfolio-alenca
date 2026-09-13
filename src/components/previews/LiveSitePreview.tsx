import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '@/lib/format';

interface LiveSitePreviewProps {
  url: string;
  title: string;
}

type DeviceId = 'web' | 'tablet' | 'app';

interface Device {
  id: DeviceId;
  label: string;
  /** Viewport lógico real do formato — é ele que o site enxerga. */
  width: number;
  height: number;
  /**
   * Web preenche o palco: a largura fica travada num breakpoint de desktop e
   * a altura acompanha o espaço disponível. Tablet e telefone têm proporção
   * física de verdade, então a mantêm.
   */
  fluidHeight?: boolean;
}

const DEVICES: Device[] = [
  { id: 'web', label: 'Web', width: 1440, height: 900, fluidHeight: true },
  { id: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { id: 'app', label: 'App', width: 390, height: 844 },
];

/** Render free tier hiberna: depois disso avisamos que o servidor está acordando. */
const COLD_START_MS = 5000;
/** Precisa acompanhar a duração da transição do shell em case-sheet.css. */
const MORPH_MS = 520;
/** Sobra depois do load em que o site embutido ainda tenta roubar o scroll. */
const SCROLL_GUARD_MS = 900;
/** Gestos que provam que quem rolou foi a pessoa, não o site embutido. */
const INTENT = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;

/** Ancestrais que rolam — a cadeia que o navegador percorre ao trazer algo à vista. */
function scrollingAncestors(node: HTMLElement): HTMLElement[] {
  const found: HTMLElement[] = [];
  for (let el = node.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') found.push(el);
  }
  return found;
}

/**
 * Embute a aplicação real e simula formatos de tela.
 *
 * O truque é não redimensionar o iframe para caber: ele sempre tem o
 * viewport lógico do dispositivo escolhido (1440, 834 ou 390 CSS px) e é
 * `scale()`-ado para caber no espaço disponível. Assim o site renderiza o
 * layout verdadeiro daquele formato em vez de um layout intermediário que
 * ninguém veria na vida real.
 */
export function LiveSitePreview({ url, title }: LiveSitePreviewProps) {
  // Num telefone, abrir em "Web" mostraria o layout de 1440px a ~20% de
  // escala — ilegível. O formato inicial acompanha a tela de quem visita.
  const [deviceId, setDeviceId] = useState<DeviceId>(() =>
    window.matchMedia('(max-width: 720px)').matches ? 'app' : 'web',
  );
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);
  const [cold, setCold] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coldTimer = useRef<number | undefined>(undefined);
  const morphTimer = useRef<number | undefined>(undefined);

  const device = DEVICES.find((item) => item.id === deviceId) ?? DEVICES[0];

  const scale =
    area.width && area.height
      ? device.fluidHeight
        ? Math.min(area.width / device.width, 1)
        : Math.min(area.width / device.width, area.height / device.height, 1)
      : 1;

  // Com altura fluida, o viewport lógico cresce até o palco ficar preenchido.
  const logicalHeight =
    device.fluidHeight && scale > 0 ? Math.round(area.height / scale) : device.height;

  useEffect(() => {
    coldTimer.current = window.setTimeout(() => setCold(true), COLD_START_MS);
    return () => {
      window.clearTimeout(coldTimer.current);
      window.clearTimeout(morphTimer.current);
    };
  }, []);

  // Mede a área livre e deriva a escala. O elemento medido é a área interna
  // *sem padding* — medir a caixa externa faria a moldura passar do respiro
  // e ser cortada pelo `overflow: hidden` do palco.
  // `useLayoutEffect` para o primeiro quadro já sair na proporção certa.
  useLayoutEffect(() => {
    const area = stageRef.current;
    if (!area) return;

    // `clientWidth/Height` e não `getBoundingClientRect()`: a folha de case
    // entra com um `scale(0.985)`, e o rect sai multiplicado por ele — a
    // medida congelaria em 98,5% do tamanho real. Estas são de layout.
    const measure = () => {
      const { clientWidth: width, clientHeight: height } = area;
      if (!width || !height) return;
      setArea({ width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  // Sites embutidos costumam dar foco a um campo — ou chamar `scrollIntoView`
  // — assim que montam. O navegador atende rolando *todos* os ancestrais até
  // o iframe aparecer, e a cadeia não para na borda do iframe: a folha do
  // case salta sozinha para o preview antes de a pessoa ler o case. De fora
  // não dá para impedir (outra origem), então prendemos o scroll dos
  // ancestrais enquanto o site carrega. Rolagem de verdade solta a guarda na
  // hora — quem manda no scroll é quem está lendo.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scrollers = scrollingAncestors(root);
    const pinned = scrollers.map((el) => el.scrollTop);
    const pinnedPage = window.scrollY;
    let releaseTimer = 0;

    const restore = () => {
      scrollers.forEach((el, index) => {
        if (el.scrollTop !== pinned[index]) el.scrollTop = pinned[index];
      });
      if (window.scrollY !== pinnedPage) window.scrollTo(window.scrollX, pinnedPage);
    };

    const release = () => {
      window.clearTimeout(releaseTimer);
      scrollers.forEach((el) => el.removeEventListener('scroll', restore));
      window.removeEventListener('scroll', restore);
      INTENT.forEach((type) => window.removeEventListener(type, release));
    };

    scrollers.forEach((el) => el.addEventListener('scroll', restore));
    window.addEventListener('scroll', restore);
    INTENT.forEach((type) => window.addEventListener(type, release, { passive: true }));

    // Antes do load a guarda fica de pé pelo tempo que o cold start levar:
    // é no load que o salto acontece, não num prazo fixo depois de montar.
    if (loaded) releaseTimer = window.setTimeout(release, SCROLL_GUARD_MS);

    return release;
  }, [loaded]);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const selectDevice = (next: DeviceId) => {
    if (next === deviceId) return;
    // O iframe reflui de uma vez para o novo viewport; o escurecimento cobre
    // esse instante enquanto a moldura interpola até o novo tamanho.
    setMorphing(true);
    setDeviceId(next);
    window.clearTimeout(morphTimer.current);
    morphTimer.current = window.setTimeout(() => setMorphing(false), MORPH_MS);
  };

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    void rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  const onLoad = () => {
    window.clearTimeout(coldTimer.current);
    setLoaded(true);
    setCold(false);
  };

  return (
    <div className={cx('live', fullscreen && 'is-fullscreen')} ref={rootRef}>
      <div className="live__toolbar">
        <div className="live__devices" role="group" aria-label="Simular formato de tela">
          {DEVICES.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => selectDevice(item.id)}
              aria-pressed={item.id === deviceId}
              className={cx('live__device', item.id === deviceId && 'is-active')}
            >
              {item.label}
              <span className="live__device-size">
                {item.width}×{item.id === deviceId ? logicalHeight : item.height}
              </span>
            </button>
          ))}
        </div>

        <div className="live__toolbar-end">
          <span className="live__scale" aria-hidden="true">
            {Math.round(scale * 100)}%
          </span>
          <button type="button" className="btn btn-ghost live__fs" onClick={toggleFullscreen}>
            {fullscreen ? 'Sair da tela cheia ✕' : 'Tela cheia ⛶'}
          </button>
        </div>
      </div>

      <div className={cx('live__stage', `live__stage--${deviceId}`)}>
        <div className="live__stage-area" ref={stageRef}>
        <div
          className={cx('live__shell', morphing && 'is-morphing')}
          style={{
            width: device.width * scale,
            height: logicalHeight * scale,
          }}
        >
          {deviceId === 'app' && <span className="live__notch" aria-hidden="true" />}

          <div
            className="live__viewport"
            style={{
              width: device.width,
              height: logicalHeight,
              transform: `scale(${scale})`,
            }}
          >
            <iframe
              className="live__iframe"
              src={url}
              title={title}
              onLoad={onLoad}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>

          {!loaded && (
            <div className="live__status" role="status">
              <span className="live__spinner" aria-hidden="true" />
              <span className="live__status-text">
                {cold ? 'Acordando o servidor…' : 'Carregando o site…'}
              </span>
              {cold && (
                <span className="live__status-note">
                  O plano gratuito do Render hiberna quando ninguém acessa. A primeira visita paga o
                  cold start.
                </span>
              )}
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="live__footer">
        <span className="pv-note">
          Site em produção, embutido aqui. O layout é o real de cada formato.
        </span>
        <a
          className="btn btn-secondary live__open"
          href={url}
          target="_blank"
          rel="noreferrer noopener"
        >
          Abrir em nova aba ↗
        </a>
      </div>
    </div>
  );
}
