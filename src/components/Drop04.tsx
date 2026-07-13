import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import { useSignup } from '../state/SignupContext'
import { SIZES } from '../i18n/copy'
import './Drop04.css'

/**
 * Vistas de la galería del producto. Cuando lleguen las fotos de la camiseta
 * sola (producto sin modelo): añadir el archivo a /assets, mapearlo en
 * scripts/optimize-images.mjs y sumar aquí su slug — nada más que tocar.
 */
const DROP_SHOTS = ['tee-close', 'navy-sit', 'ride-front'] as const

function srcset(slug: string) {
  return [640, 1024, 1600, 2048].map((w) => `/img/${slug}-${w}.webp ${w}w`).join(', ')
}

export function Drop04() {
  const { t } = useLang()
  const { size, setSize } = useSignup()
  const [shot, setShot] = useState<string>(DROP_SHOTS[0])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef)
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        if (!motion) return

        if (desktop) {
          // escena dirigida por scroll: el titular gigante encoge a su sitio,
          // la foto se abre desde un recorte y la ficha se va encendiendo
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '+=190%',
              pin: true,
              scrub: 0.8,
            },
            defaults: { ease: 'none' },
          })
          tl.fromTo(
            '.drop__name',
            { scale: 1.7, y: '32vh' },
            { scale: 1, y: 0, duration: 1, ease: 'power2.inOut' },
            0,
          )
            .fromTo(
              '.drop__frame',
              { clipPath: 'inset(30% 24% 30% 24%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 },
              0.15,
            )
            .fromTo('.drop__frame img', { scale: 1.3 }, { scale: 1, duration: 1.15 }, 0.1)
            .from('.drop__media-tag, .drop__views', { autoAlpha: 0, duration: 0.25 }, 1.0)
            .from(
              '.drop__spec',
              { autoAlpha: 0, x: -34, duration: 0.3, stagger: 0.16, ease: 'power2.out' },
              0.85,
            )
            .from(
              '.drop__price',
              { scale: 2.6, autoAlpha: 0, duration: 0.45, ease: 'back.out(1.5)' },
              1.35,
            )
            .from(
              '.drop__sizes, .drop__cta',
              { autoAlpha: 0, y: 26, duration: 0.3, stagger: 0.12, ease: 'power2.out' },
              1.6,
            )
        } else {
          gsap.from('.drop__name, .drop__frame, .drop__info > *', {
            autoAlpha: 0,
            y: 32,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
          })
        }
      },
    )
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="drop04" className="drop" aria-labelledby="drop-title">
      <p className="drop__label hud-label">
        [ {t.drop.label} ] <span className="hud-live-dot" />
      </p>
      <h2 id="drop-title" className="drop__name">
        {t.drop.name}
      </h2>

      <div className="drop__grid">
        <div className="drop__media">
          <div className="drop__frame">
            <img
              key={shot}
              src={`/img/${shot}-1600.webp`}
              srcSet={srcset(shot)}
              sizes="(min-width: 900px) 55vw, 92vw"
              alt={t.drop.alts[shot]}
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="drop__media-tag hud-label hud-corners">{t.hud.station}</span>
          <div className="drop__views" role="group" aria-label={t.drop.viewLabel}>
            <span className="hud-label">{t.drop.viewLabel}</span>
            {DROP_SHOTS.map((s, i) => (
              <button
                key={s}
                type="button"
                className="drop__view"
                aria-pressed={shot === s}
                onClick={() => setShot(s)}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        <div className="drop__info">
          <dl className="drop__specs">
            {t.drop.specs.map(([k, v]) => (
              <div key={k} className="drop__spec">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <p className="drop__price" aria-label={`${t.drop.price}`}>
            {t.drop.price}
          </p>

          <fieldset className="drop__sizes">
            <legend className="hud-label">{t.drop.sizeLabel}</legend>
            <div className="drop__sizes-row">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="drop__size"
                  aria-pressed={size === s}
                  onClick={() => setSize(size === s ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="drop__cta">
            <a className="btn btn--primary btn--lg" href="#lista">
              {t.drop.notify}
            </a>
            <p className="drop__hint">{t.drop.notifyHint}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
