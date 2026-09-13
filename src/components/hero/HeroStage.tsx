/**
 * O palco atrás do hero: grade, feixes de luz e brilho, só em CSS — pinta
 * junto com a página, sem JS. As capturas dos projetos ficam no próprio
 * hero (`HeroShowcase`), acima do conteúdo, onde recebem o ponteiro.
 */
export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="hero-stage__grid" />
      <div className="hero-stage__rays" />
      <div className="hero-stage__glow" />
      <div className="hero-stage__fade" />
    </div>
  );
}
