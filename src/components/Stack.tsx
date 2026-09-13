import { useState } from 'react';
import { ScrollWords } from '@/components/ScrollWords';
import { Section } from '@/components/Section';
import { TechIcon } from '@/components/TechIcon';
import { PROJECTS } from '@/data/projects';
import { CERTIFICATES, CERTIFICATE_HOURS, EDUCATION, STACK, TIER_LABEL, type Skill } from '@/data/stack';
import { usePointerSpotlight } from '@/hooks/usePointerSpotlight';
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';
import { cx } from '@/lib/format';
import { SKILL_ICONS } from '@/lib/techIcons';
import type { ProjectId } from '@/types';

const SHORT_NAME = new Map<ProjectId, string>(
  PROJECTS.map((project) => [project.id, project.shortName]),
);

interface StackProps {
  /** Clicar no projeto onde a tecnologia é usada abre o case dela. */
  onOpenProject: (id: ProjectId) => void;
}

/**
 * Mestre-detalhe em vez de uma grade de cards iguais: a lista mostra os
 * nomes todos de uma vez (é o que a leitura rápida quer) e o painel abre a
 * profundidade de um por vez (é o que a leitura atenta quer). Sem medidor de
 * proficiência — o que prova domínio é o projeto onde a coisa roda.
 */
export function Stack({ onOpenProject }: StackProps) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [skillIndex, setSkillIndex] = useState(0);

  const category = STACK[categoryIndex];
  const skill = category.skills[skillIndex] ?? category.skills[0];
  const skillIcon = SKILL_ICONS[skill.name];

  const { ref: tabsRef, rect } = useSlidingIndicator<HTMLDivElement>(category.id);
  const detailRef = usePointerSpotlight<HTMLDivElement>();

  const selectCategory = (index: number) => {
    setCategoryIndex(index);
    setSkillIndex(0);
  };

  return (
    <Section variant="stack" id="stack" aria-labelledby="stack-title">
      <div className="eyebrow">Stack</div>

      <ScrollWords
        id="stack-title"
        className="stack__statement"
        text="Não é uma lista do que eu já vi. É o que eu uso,"
        accent="e em qual projeto cada coisa roda."
      />

      <div className="stack__tabs" ref={tabsRef} role="group" aria-label="Frentes da stack">
        <span
          className="stack__tabs-indicator"
          aria-hidden="true"
          style={{
            transform: `translate(${rect.x}px, ${rect.y}px)`,
            width: rect.width,
            height: rect.height,
            opacity: rect.width ? 1 : 0,
          }}
        />

        {STACK.map((group, index) => (
          <button
            type="button"
            key={group.id}
            onClick={() => selectCategory(index)}
            aria-pressed={index === categoryIndex}
            className={cx('stack__tab', index === categoryIndex && 'is-active')}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="stack__explorer">
        <div className="stack__wall" role="group" aria-label={`Competências · ${category.label}`}>
          {category.skills.map((item, index) => {
            const icon = SKILL_ICONS[item.name];
            return (
              <button
                type="button"
                key={item.name}
                // Selecionar no foco faz o teclado percorrer a lista vendo o
                // detalhe, sem precisar de Enter a cada item.
                onClick={() => setSkillIndex(index)}
                onFocus={() => setSkillIndex(index)}
                aria-pressed={index === skillIndex}
                className={cx(
                  'stack__pill',
                  `stack__pill--${item.tier}`,
                  index === skillIndex && 'is-active',
                )}
              >
                <span className="stack__pill-name">
                  {icon ? (
                    <TechIcon icon={icon} className="stack__pill-icon" />
                  ) : (
                    <span className="stack__pill-icon stack__pill-icon--empty" aria-hidden="true" />
                  )}
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="stack__detail" ref={detailRef}>
          <div className="stack__detail-body" key={`${category.id}-${skill.name}`}>
            {skillIcon && <TechIcon icon={skillIcon} className="stack__detail-icon" />}

            <div className="stack__detail-eyebrow">
              {category.label} · {TIER_LABEL[skill.tier]}
            </div>

            <h3 className="stack__detail-title">{skill.name}</h3>
            <p className="stack__detail-note">{skill.note}</p>

            <SkillEvidence skill={skill} onOpenProject={onOpenProject} />
          </div>
        </div>
      </div>

      <div className="stack__credentials">
        <div className="stack__credential">
          <span className="stack__credential-label">Formação</span>
          <span className="stack__credential-title">{EDUCATION.label}</span>
          <span className="stack__credential-meta">{EDUCATION.meta}</span>
        </div>

        {/* O total conta a história; a lista de cursos fica a um clique. */}
        <details className="stack__credential stack__certs">
          <summary className="stack__certs-summary">
            <span className="stack__credential-label">Certificações</span>
            <span className="stack__credential-title">{CERTIFICATE_HOURS}h de cursos certificados</span>
            <span className="stack__credential-meta">
              {CERTIFICATES.length} cursos
              <span className="stack__certs-toggle" aria-hidden="true" />
            </span>
          </summary>

          <ul className="stack__cert-list">
            {CERTIFICATES.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <span className="stack__credential-meta">{item.meta}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </Section>
  );
}

interface SkillEvidenceProps {
  skill: Skill;
  onOpenProject: (id: ProjectId) => void;
}

/** A prova de domínio: onde a tecnologia roda de verdade. */
function SkillEvidence({ skill, onOpenProject }: SkillEvidenceProps) {
  if (skill.everywhere) {
    return (
      <div className="stack__evidence">
        <span className="stack__evidence-label">Em todos os {PROJECTS.length} projetos</span>
      </div>
    );
  }

  if (skill.projects && skill.projects.length > 0) {
    return (
      <div className="stack__evidence">
        <span className="stack__evidence-label">
          Em {skill.projects.length} de {PROJECTS.length} projetos
        </span>
        <div className="stack__uses">
          {skill.projects.map((id) => (
            <button type="button" key={id} className="stack__use" onClick={() => onOpenProject(id)}>
              {SHORT_NAME.get(id) ?? id}
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (skill.context) {
    return (
      <div className="stack__evidence">
        <span className="stack__evidence-label">No dia a dia</span>
        <p className="stack__evidence-context">{skill.context}</p>
      </div>
    );
  }

  return null;
}
