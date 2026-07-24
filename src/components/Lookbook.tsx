import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import './Lookbook.css'

const SHOTS = [
  'ride-front',
  'navy-bmw',
  'bmw-front',
  'ride-blur',
  'mt09',
  'navy-sit',
  'ride-red',
  'bmw-side',
  'ride-window',
] as const

/** km ficticios que "recorre" el paseo horizontal completo */
const RIDE_KM = 2.4

function srcset(slug: string) {
  return [640, 1024, 1600].map((w) => `/img/${slug}-${w}.webp ${w}w`).join(', ')
}

export function Lookbook() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)
  const odoRef = useRef<HTMLSpanElement>(null)

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
          // el lookbook es un paseo: la sección se clava y el scroll vertical
          // se convierte en travelling horizontal entre las fotos
          const track = sectionRef.current!.querySelector<HTMLElement>('.lookbook__track')!
          const distance = () => track.scrollWidth - window.innerWidth
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.9,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (odoRef.current) {
                  odoRef.current.textContent = `${(self.progress * RIDE_KM).toFixed(2)} KM`
                }
              },
            },
          })
        } else {
          gsap.utils.toArray<HTMLElement>('.lookbook__item').forEach((item) => {
            gsap.from(item, {
              autoAlpha: 0,
              y: 48,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: item, start: 'top 85%' },
            })
          })
        }
      },
    )
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="lookbook" className="lookbook" aria-label={t.lookbook.label}>
      <p className="lookbook__label hud-label">[ {t.lookbook.label} ]</p>
      <span ref={odoRef} className="lookbook__odometer hud-label" aria-hidden="true">
        0.00 KM
      </span>
      <div className="lookbook__track">
        {SHOTS.map((slug, i) => (
          <figure key={slug} className="lookbook__item">
            <div className="lookbook__frame">
              <img
                src={`/img/${slug}-1024.webp`}
                srcSet={srcset(slug)}
                sizes="(min-width: 900px) 55vh, 92vw"
                alt={t.lookbook.alts[slug]}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="lookbook__caption hud-label">
              {String(i + 1).padStart(2, '0')} / {String(SHOTS.length).padStart(2, '0')}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
