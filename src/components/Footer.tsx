import { useLang } from '../i18n/LangContext'
import './Footer.css'

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer">
      <p className="footer__wordmark" aria-hidden="true">
        cuore<span className="footer__dot">.</span>
      </p>
      <div className="footer__meta">
        <span className="hud-label footer__tagline">{t.footer.tagline}</span>
        <span className="hud-label">{t.hud.station}</span>
        <span className="hud-label">{t.footer.rights}</span>
      </div>
    </footer>
  )
}
