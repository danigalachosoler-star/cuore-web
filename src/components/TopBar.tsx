import { useLang } from '../i18n/LangContext'
import type { Lang } from '../i18n/copy'
import './TopBar.css'

const LANGS: Lang[] = ['es', 'en']

export function TopBar() {
  const { lang, setLang, t } = useLang()

  return (
    <header className="topbar">
      <a className="topbar__wordmark" href="#top" aria-label="cuore. — inicio">
        cuore<span className="topbar__dot">.</span>
      </a>
      <nav className="topbar__lang" aria-label={t.langLabel}>
        {LANGS.map((l, i) => (
          <span key={l}>
            {i > 0 && <span aria-hidden="true" className="topbar__lang-sep">/</span>}
            <button
              type="button"
              className="topbar__lang-btn"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          </span>
        ))}
      </nav>
    </header>
  )
}
