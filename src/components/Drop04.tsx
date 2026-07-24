import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import { useSignup } from '../state/SignupContext'
import { SIZES } from '../i18n/copy'
import './Drop04.css'

/**
 * Galería del producto con giro 3D: la camiseta rota sobre su eje Y para
 * mostrar frente (con logo) y espalda con sensación de volumen. Las dos caras
 * son fotos de estudio; el resto de tomas (percha, etc.) viven en el lookbook.
 */
const FRONT = 'tee-front'
const BACK = 'tee-back'

function srcset(slug: string) {
  return [640, 1024, 1600, 2048].map((w) => `/img/${slug}-${w}.webp ${w}w`).join(', ')
}

export function Drop04() {
  const { t } = useLang()
  const { size, setSize } = useSignup()
  const [flipped, setFlipped] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const flipRef = useRef<HTMLDivElement>(null)

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
              scrub: 1,
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
            .from('.drop__media-tag, .drop__flip-btn', { autoAlpha: 0, duration: 0.25 }, 1.0)
            .from(
              '.drop__spec',
              { autoAlpha: 0, x: -34, duration: 0.3, stagger: 0.16, ease: 'power2.out' },
              0.85,
            )
            .from(
              '.drop__price',
              { scale: 1.45, autoAlpha: 0, duration: 0.5, ease: 'power3.out' },
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

  // giro independiente disparado por click: rota el contenedor 3D entre 0 y 180.
  // en reduced-motion salta a la cara sin animar.
  function toggleFlip() {
    const next = !flipped
    setFlipped(next)
    const el = flipRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      gsap.set(el, { rotationY: next ? 180 : 0 })
    } else {
      gsap.to(el, { rotationY: next ? 180 : 0, duration: 0.7, ease: 'power2.inOut' })
    }
  }

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
            <div className="drop__flip" ref={flipRef}>
              <div className="drop__face drop__face--front" aria-hidden={flipped || undefined}>
                <img
                  src={`/img/${FRONT}-1600.webp`}
                  srcSet={srcset(FRONT)}
                  sizes="(min-width: 900px) 55vw, 92vw"
                  alt={t.drop.alts[FRONT]}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="drop__face drop__face--back" aria-hidden={!flipped || undefined}>
                <img
                  src={`/img/${BACK}-1600.webp`}
                  srcSet={srcset(BACK)}
                  sizes="(min-width: 900px) 55vw, 92vw"
                  alt={t.drop.alts[BACK]}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
          <span className="drop__media-tag hud-label hud-corners">{t.hud.station}</span>
          <button
            type="button"
            className="drop__flip-btn hud-label"
            aria-pressed={flipped}
            aria-label={flipped ? t.drop.flipToFront : t.drop.flipToBack}
            onClick={toggleFlip}
          >
            <span className="drop__flip-icon" aria-hidden="true">
              ↻
            </span>
            {t.drop.flip}
          </button>
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
