import { ProjectThumb } from '@/components/ProjectThumb';
import { usePointerSpotlight } from '@/hooks/usePointerSpotlight';
import { cx } from '@/lib/format';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onOpen: (source: HTMLElement) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  // O CSS lê `--px`/`--py` para o brilho e `--tilt-*` para a inclinação.
  // O card herói é maior: inclina menos para não parecer que vai tombar.
  const ref = usePointerSpotlight<HTMLButtonElement>({ tilt: project.isHero ? 3 : 5 });
  const isLive = project.previewKind === 'live';

  return (
    <button
      type="button"
      className={cx('card', 'project-card', project.isHero && 'project-card--hero')}
      onClick={(event) => onOpen(event.currentTarget)}
      ref={ref}
      data-project-card={project.id}
      data-cursor-label={isLive ? 'Ver ao vivo' : 'Abrir case'}
    >
      {project.isHero && <span className="beam" aria-hidden="true" />}

      <ProjectThumb
        id={project.id}
        hero={project.isHero}
        hint={isLive ? 'Site ao vivo' : 'Preview interativo'}
      />

      {/* Nome e uma linha: número, status, período e stack moram no case,
          a um clique — a capa já faz o trabalho de mostrar o projeto. */}
      <div className="project-card__body">
        <div className="project-card__head">
          <span className="project-card__title">{project.name}</span>
          <span className="project-card__arrow" aria-hidden="true">
            →
          </span>
        </div>

        <p className="project-card__short">{project.tagline}</p>

        {project.isHero && (
          <div className="project-card__impact">
            <strong>{project.impact}</strong>
            <span>{project.impactLabel}</span>
          </div>
        )}
      </div>
    </button>
  );
}
