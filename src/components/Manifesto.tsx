import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useLang } from '../i18n/LangContext'
import './Manifesto.css'

export function Manifesto() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.manifesto__label', {
        autoAlpha: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      // el texto se enciende palabra a palabra al ritmo del scroll
      gsap.fromTo(
        '.manifesto__word',
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            end: 'center 42%',
            scrub: 0.4,
          },
        },
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="manifiesto" className="manifesto" aria-label={t.manifesto.label}>
      <p className="manifesto__label hud-label">[ {t.manifesto.label} ]</p>
      <blockquote className="manifesto__text">
        {t.manifesto.text.split(' ').map((word, i) => (
          <span key={i} className="manifesto__word">
            {word}{' '}
          </span>
        ))}
      </blockquote>
    </section>
  )
}
