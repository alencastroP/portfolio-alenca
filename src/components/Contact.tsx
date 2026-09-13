import { Globe } from '@/components/Globe';
import { Section } from '@/components/Section';
import { EMAIL, GITHUB_URL, LINKEDIN_URL, TIME_ZONE } from '@/data/contact';
import { useClipboard } from '@/hooks/useClipboard';
import { useLocalTime } from '@/hooks/useLocalTime';
import { useMagnetic } from '@/hooks/useMagnetic';

export function Contact() {
  const emailRef = useMagnetic<HTMLAnchorElement>();
  const linkedinRef = useMagnetic<HTMLAnchorElement>();
  const githubRef = useMagnetic<HTMLAnchorElement>();
  const { copied, copy } = useClipboard();
  const time = useLocalTime(TIME_ZONE);

  return (
    <Section variant="contact" id="contato" aria-labelledby="contato-title">
      <div className="contact">
        <div className="contact__content">
          <span className="eyebrow">Contato</span>

          <h2 className="contact__title" id="contato-title">
            Vamos construir
            <br />
            algo que <span className="accent">resolve</span>?
          </h2>

          <p className="contact__lead">Aberto a vagas e projetos sob demanda — da interface à API.</p>

          <div className="contact__actions">
            <a className="btn btn-primary btn-lg magnetic" href={`mailto:${EMAIL}`} ref={emailRef}>
              {EMAIL}
            </a>
            <button
              type="button"
              className="btn btn-secondary btn-lg contact__copy"
              onClick={() => void copy(EMAIL)}
              data-copied={copied || undefined}
            >
              {copied ? 'Copiado ✓' : 'Copiar e-mail'}
            </button>
            <span className="visually-hidden" aria-live="polite">
              {copied ? 'E-mail copiado para a área de transferência.' : ''}
            </span>
          </div>

          <div className="contact__links">
            <a
              className="btn btn-ghost magnetic"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer noopener"
              ref={linkedinRef}
            >
              LinkedIn ↗
            </a>
            <a
              className="btn btn-ghost magnetic"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              ref={githubRef}
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="contact__stage">
          <Globe />
          <div className="contact__place">
            <span className="contact__place-dot" aria-hidden="true" />
            Natal · RN, Brasil
            <span className="contact__time">
              <time>{time}</time> · GMT−3
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
