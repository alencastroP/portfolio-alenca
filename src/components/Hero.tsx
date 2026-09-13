import { lazy, Suspense } from 'react';
import { Section } from '@/components/Section';
import { GITHUB_URL } from '@/data/contact';
import { SKILL_COUNT } from '@/data/stack';
import { useMagnetic } from '@/hooks/useMagnetic';

// A vitrine (e o Framer Motion com ela) fica fora do bundle inicial: o
// título é o LCP e pinta sem esperar o JS da animação.
const HeroShowcase = lazy(() =>
  import('@/components/hero/HeroShowcase').then((module) => ({ default: module.HeroShowcase })),
);

export function Hero() {
  const galleryRef = useMagnetic<HTMLAnchorElement>();
  const githubRef = useMagnetic<HTMLAnchorElement>();

  return (
    <Section variant="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="eyebrow hero__eyebrow">Full Stack Developer · Natal/RN</div>

        {/* Cada linha sobe de trás de uma máscara — a quebra é estrutural,
            não um <br> decorativo. */}
        <h1 className="hero__title" id="hero-title">
          <span className="hero__line">
            <span>Mais de 4 anos construindo produtos</span>
          </span>
          <span className="hero__line">
            <span>
              que <span className="accent">resolvem problemas reais</span>.
            </span>
          </span>
        </h1>

        {/* Uma frase só: as tecnologias moram no marquee logo abaixo e na
            seção Stack — repeti-las aqui em etiquetas era ruído. */}
        <p className="hero__lead">
          Full stack, com o front-end como especialidade, em React e TypeScript. Aberto a vagas e
          projetos.
        </p>

        <div className="hero__actions">
          <a className="btn btn-primary btn-lg magnetic" href="#galeria" ref={galleryRef}>
            Abrir a galeria
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a
            className="btn btn-secondary btn-lg magnetic"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            ref={githubRef}
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* O fallback reserva a mesma caixa: no mobile a vitrine está no fluxo,
          e sem ele os números pulariam quando o chunk chegasse. */}
      <Suspense fallback={<div className="hero-showcase" aria-hidden="true" />}>
        <HeroShowcase />
      </Suspense>

      {/* Números que o resto da página prova: cada um tem uma seção atrás. */}
      <div className="hero__footer">
        <dl className="hero__stats">
          <div className="hero__stat">
            <dt>anos em tecnologia</dt>
            <dd>4+</dd>
          </div>
          <div className="hero__stat">
            <dt>tecnologias em uso</dt>
            <dd>{SKILL_COUNT}</dd>
          </div>
        </dl>

        <a className="hero__scroll" href="#galeria" aria-label="Rolar até a galeria">
          Role
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
      </div>
    </Section>
  );
}
