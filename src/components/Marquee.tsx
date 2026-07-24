import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import { onScrollVelocity } from '../lib/scrollVelocity'
import './Marquee.css'

export function Marquee() {
  const { t } = useLang()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia(rootRef)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.to('.marquee__track', {
        xPercent: -50,
        duration: 32,
        ease: 'none',
        repeat: -1,
      })
      // la cinta acelera (o retrocede) con la velocidad real de scroll
      const unsub = onScrollVelocity((v) => {
        tween.timeScale(gsap.utils.clamp(-2.5, 3, 1 + v / 950))
      })
      // sin gastar frames fuera de pantalla
      const io = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? tween.play() : tween.pause(),
      )
      io.observe(rootRef.current!)
      return () => {
        unsub()
        io.disconnect()
      }
    })
    return () => mm.revert()
  }, [])

  // dos copias del contenido: el track se desplaza un -50% y enlaza sin costura
  const items = [...t.marquee, ...t.marquee, ...t.marquee]

  return (
    <div ref={rootRef} className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <span key={copy} className="marquee__group">
            {items.map((item, i) => (
              <span key={i} className="marquee__item">
                {item}
                <span className="marquee__dot">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
