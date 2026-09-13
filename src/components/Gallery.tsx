import { ProjectCard } from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import { PROJECTS } from '@/data/projects';
import { cx } from '@/lib/format';

interface GalleryProps {
  /** Recebe o card clicado: é dele que a folha de case nasce na transição. */
  onOpen: (index: number, source: HTMLElement) => void;
}

export function Gallery({ onOpen }: GalleryProps) {
  return (
    <Section variant="gallery" id="galeria" aria-labelledby="galeria-title">
      <span className="eyebrow">Galeria</span>

      <h2 className="gallery__title" id="galeria-title">
        Seis produtos. Abra e <span className="accent">explore</span>.
      </h2>

      <p className="gallery__lead">
        Cada card abre o case completo, com a interface real funcionando ao lado.
      </p>

      {/* Bento: o projeto herói ocupa 2×2 e define a hierarquia da grade. */}
      <ul className="gallery__grid">
        {PROJECTS.map((project, index) => (
          <li
            className={cx('gallery__item', 'stagger', project.isHero && 'gallery__item--hero')}
            key={project.id}
          >
            <ProjectCard project={project} onOpen={(source) => onOpen(index, source)} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
