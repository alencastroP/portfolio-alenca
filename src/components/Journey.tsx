import pedroPortrait from '@/assets/pedro-portrait.jpg';
import { ABOUT_ACCENT_A, ABOUT_ACCENT_B } from '@/data/aboutPhotos';
import { Section } from '@/components/Section';
import { JOURNEY, SCOPE_MAX } from '@/data/journey';
import { usePointerSpotlight } from '@/hooks/usePointerSpotlight';
import { cx } from '@/lib/format';

/** Sombras do trilho: a escala cheia fica visível atrás da coluna preenchida. */
const SCOPE_SLOTS = Array.from({ length: SCOPE_MAX }, (_, index) => index);

export function Journey() {
  // Mesma gramática dos cards da galeria: inclinação 3D e brilho especular
  // alimentados por custom properties, sem re-render. Cada retrato do
  // mosaico tem seu próprio ref — a inclinação de um não afeta os outros.
  const portraitRef = usePointerSpotlight<HTMLDivElement>({ tilt: 8 });
  const accentARef = usePointerSpotlight<HTMLDivElement>({ tilt: 11 });
  const accentBRef = usePointerSpotlight<HTMLDivElement>({ tilt: 11 });

  return (
    <Section variant="journey" id="sobre" aria-labelledby="sobre-title">
      <div className="eyebrow">Sobre</div>

      <div className="journey__intro">
        {/* O palco carrega a perspectiva; cada retrato mora num slot que
            decide posição, tamanho e rotação fixa do mosaico. A moldura
            dentro do slot é o que inclina ao apontar, para a composição não
            girar inteira atrás do ponteiro. */}
        <div className="journey__portrait-stage">
          <div className="journey__portrait-slot journey__portrait-slot--accent-b">
            <div className="journey__portrait-frame journey__portrait-frame--accent" ref={accentBRef}>
              <img
                className="journey__portrait"
                src={ABOUT_ACCENT_B.src}
                srcSet={ABOUT_ACCENT_B.srcset}
                sizes="140px"
                alt="Pedro Alencastro em outro momento do dia a dia"
                width={ABOUT_ACCENT_B.w}
                height={ABOUT_ACCENT_B.h}
                loading="lazy"
              />
            </div>
          </div>

          <div className="journey__portrait-slot journey__portrait-slot--main">
            <div className="journey__portrait-frame" ref={portraitRef}>
              <img
                className="journey__portrait"
                src={pedroPortrait}
                alt="Pedro Alencastro sorrindo"
                width="900"
                height="900"
                loading="lazy"
              />
            </div>
          </div>

          <div className="journey__portrait-slot journey__portrait-slot--accent-a">
            <div className="journey__portrait-frame journey__portrait-frame--accent" ref={accentARef}>
              <img
                className="journey__portrait"
                src={ABOUT_ACCENT_A.src}
                srcSet={ABOUT_ACCENT_A.srcset}
                sizes="160px"
                alt="Pedro Alencastro em outro registro"
                width={ABOUT_ACCENT_A.w}
                height={ABOUT_ACCENT_A.h}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="journey__content">
          <h2 className="journey__title" id="sobre-title">
            Cada ano ampliou o escopo do que eu entrego{' '}
            <span className="accent">de ponta a ponta</span>.
          </h2>

          <div className="journey__bios">
            <p className="journey__bio journey__bio--lead">
              Sou Pedro, de Natal/RN, há mais de 4 anos em tecnologia. Comecei no suporte de um
              produto real — aprendi como software quebra antes de aprender a construir. Hoje entrego
              full stack, e todo projeto começa pela mesma pergunta:{' '}
              <strong className="journey__highlight">o que isso resolve para quem vai usar?</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Histograma: a altura da coluna é a contagem de frentes cobertas no
          ano, nomeadas logo abaixo dela — a escala tem definição embaixo, e o
          trilho fantasma mostra o teto mesmo quando a coluna é curta. */}
      <div className="journey__chart-head">
        <span className="journey__chart-label">Frentes de atuação por ano</span>
      </div>

      <ol className="histogram">
        {JOURNEY.map((entry) => (
          <li className={cx('histo', entry.current && 'histo--current')} key={entry.year}>
            <div
              className="histo__chart"
              role="img"
              aria-label={`${entry.year}: ${entry.scope.length} de ${SCOPE_MAX} frentes`}
            >
              <div className="histo__track" aria-hidden="true">
                {SCOPE_SLOTS.map((slot) => (
                  <span className="histo__slot" key={slot} />
                ))}
              </div>

              <div className="histo__bars" aria-hidden="true">
                {entry.scope.map((area) => (
                  <span className="histo__seg" key={area} />
                ))}
              </div>
            </div>

            <div className="histo__axis" aria-hidden="true" />

            <div className="histo__year">{entry.year}</div>
            <div className="histo__role">{entry.role}</div>
            <p className="histo__detail">{entry.detail}</p>

            <ul className="histo__scope">
              {entry.scope.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
