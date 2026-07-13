import { useEffect, useRef, useState, type FormEvent } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import { useSignup } from '../state/SignupContext'
import { subscribe } from '../lib/subscribe'
import { SIZES, type Size } from '../i18n/copy'
import './ListSection.css'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export function ListSection() {
  const { t, lang } = useLang()
  const { size, setSize } = useSignup()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.list__inner > *', {
        autoAlpha: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
    })
    return () => mm.revert()
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!size || !consent || status === 'sending') return
    setStatus('sending')
    const result = await subscribe({ email, size, consent: true, lang })
    if (result.ok) {
      setStatus('ok')
      setEmail('')
      setConsent(false)
    } else {
      setStatus('error')
    }
  }

  return (
    <section ref={sectionRef} id="lista" className="list" aria-labelledby="list-title">
      <div className="list__inner">
        <p className="list__label hud-label">
          <span className="hud-live-dot" />
          {t.hud.live}
        </p>
        <h2 id="list-title" className="list__title">
          {t.list.title}
        </h2>
        <p className="list__sub">{t.list.sub}</p>

        <form className="list__form" onSubmit={onSubmit} noValidate={false}>
          <div className="list__row">
            <label className="list__field list__field--email">
              <span className="hud-label">{t.list.emailLabel}</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={t.list.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="list__field list__field--size">
              <span className="hud-label">{t.list.sizeLabel}</span>
              <select
                name="size"
                required
                value={size ?? ''}
                onChange={(e) => setSize((e.target.value || null) as Size | null)}
              >
                <option value="" disabled>
                  {t.list.sizePlaceholder}
                </option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="list__consent">
            <input
              type="checkbox"
              name="consent"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>{t.list.consent}</span>
          </label>

          <button className="btn btn--primary list__submit" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? t.list.sending : t.list.submit}
          </button>

          <p className="list__status hud-label" role="status" aria-live="polite">
            {status === 'ok' && <span className="list__status-ok">{t.list.ok}</span>}
            {status === 'error' && <span className="list__status-error">{t.list.error}</span>}
          </p>

          <p className="list__privacy">{t.list.privacy}</p>
        </form>
      </div>
    </section>
  )
}
