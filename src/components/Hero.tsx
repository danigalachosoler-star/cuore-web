import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import { canRunImmersiveHero } from '../lib/capabilities'
import { createHeroGL } from '../lib/heroGL'
import './Hero.css'

const HERO_SRCSET = [1024, 1600, 2048]
  .map((w) => `/img/hero-${w}.webp ${w}w`)
  .join(', ')

export function Hero() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [immersive, setImmersive] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  // la decisión WebGL/estático se toma en cliente, una vez montado
  useEffect(() => {
    setImmersive(canRunImmersiveHero())
  }, [])

  useEffect(() => {
    if (!immersive || !canvasRef.current) return
    return createHeroGL(canvasRef.current, '/img/hero-1600.webp', {
      focal: [0.5, 0.52],
      onReady: () => setCanvasReady(true),
    })
  }, [immersive])

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

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.from('.hero__media', { scale: 1.06, duration: 2.2, ease: 'power2.out' }, 0)
          .from(
            '.hero__title-line > span',
            { yPercent: 112, duration: 1.1, stagger: 0.14 },
            0.25,
          )
          .from('.hero__eyebrow', { autoAlpha: 0, y: 14, duration: 0.7 }, 0.5)
          .from('.hero__sub, .hero__ctas', { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.9)
          .from('.hero__hud-item, .hero__scroll', { autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.2)

        if (desktop) {
          // salida cinemática: el hero se queda clavado y el scroll lo despide
          // (la foto sigue acercándose y se apaga, el titular se eleva)
          gsap
            .timeline({
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: '+=85%',
                pin: true,
                scrub: 0.7,
              },
            })
            .fromTo(
              '.hero__media',
              { scale: 1, filter: 'brightness(1)' },
              { scale: 1.14, filter: 'brightness(0.4)', ease: 'none', immediateRender: false },
              0,
            )
            .fromTo(
              '.hero__content',
              { yPercent: 0, autoAlpha: 1 },
              { yPercent: -22, autoAlpha: 0, ease: 'power1.in', immediateRender: false },
              0,
            )
            .to('.hero__hud, .hero__scroll', { autoAlpha: 0, ease: 'power1.in' }, 0)
        }
      },
    )
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="hero" aria-label="cuore. Drop 04">
      <div className="hero__media" aria-hidden={immersive || undefined}>
        <img
          className="hero__img"
          src="/img/hero-1600.webp"
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt={t.hero.alt}
          fetchPriority="high"
          decoding="async"
        />
        {immersive && (
          <canvas
            ref={canvasRef}
            className={`hero__canvas${canvasReady ? ' is-ready' : ''}`}
            aria-hidden="true"
          />
        )}
        {!immersive && <div className="hero__grain" aria-hidden="true" />}
        <div className="hero__shade" aria-hidden="true" />
      </div>

      {/* telemetría HUD */}
      <div className="hero__hud" aria-hidden="true">
        <span className="hero__hud-item hero__hud-station hud-label hud-corners">
          {t.hud.station}
        </span>
        <span className="hero__hud-item hero__hud-live hud-label hud-corners">
          <span className="hud-live-dot" />
          {t.hud.live}
        </span>
      </div>

      <div className="hero__content">
        <p className="hero__eyebrow">{t.hero.eyebrow}</p>
        <h1 className="hero__title">
          <span className="hero__title-line">
            <span>{t.hero.titleLine1}</span>
          </span>{' '}
          <span className="hero__title-line hero__title-line--stroke">
            <span>{t.hero.titleLine2}</span>
          </span>
        </h1>
        <p className="hero__sub">{t.hero.sub}</p>
        <div className="hero__ctas">
          <a className="btn btn--primary" href="#drop04">
            {t.hero.ctaDrop}
          </a>
          <a className="btn btn--ghost" href="#lista">
            {t.hero.ctaList}
          </a>
        </div>
      </div>

      <span className="hero__scroll hud-label" aria-hidden="true">
        {t.hero.scroll}
      </span>
    </section>
  )
}
