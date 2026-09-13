import { scrollToTop } from '@/lib/smoothScroll';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell">
        {/* Assinatura em escala de cartaz: a última coisa que o olho leva. */}
        <div className="footer__wordmark" aria-hidden="true">
          Pedro Alencastro<span className="footer__dot">.</span>
        </div>

        <div className="footer__bar">
          <span>
            © {year} Pedro Alencastro · Natal / RN · Full Stack Developer
          </span>
          <span className="footer__built">React 19 · Framer Motion · Tailwind v4</span>
          <button type="button" className="footer__top" onClick={scrollToTop}>
            Voltar ao topo ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
