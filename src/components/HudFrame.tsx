import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { onScrollVelocity } from '../lib/scrollVelocity'
import './HudFrame.css'

const SECTION_IDS = ['hero', 'drop04', 'lookbook', 'manifiesto', 'lista'] as const
type SectionId = (typeof SECTION_IDS)[number]

/**
 * Marco de visor persistente: esquinas de telemetría en el viewport,
 * waypoint de la sección activa y velocímetro ligado a la velocidad real
 * de scroll. Decorativo: invisible para lectores de pantalla.
 */
export function HudFrame() {
  const { t } = useLang()
  const speedRef = useRef<HTMLSpanElement>(null)
  const [section, setSection] = useState<SectionId>('hero')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    return onScrollVelocity((v) => {
      const kmh = Math.min(199, Math.round(Math.abs(v) / 35))
      if (speedRef.current) {
        speedRef.current.textContent = `${String(kmh).padStart(3, '0')} KM/H`
      }
    })
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setSection(e.target.id as SectionId)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <div className="hudframe" aria-hidden="true">
      <span className="hudframe__corner hudframe__corner--tl" />
      <span className="hudframe__corner hudframe__corner--tr" />
      <span className="hudframe__corner hudframe__corner--bl" />
      <span className="hudframe__corner hudframe__corner--br" />
      <span className="hudframe__waypoint hud-label">
        {String(SECTION_IDS.indexOf(section) + 1).padStart(2, '0')} · {t.hud.sec[section]}
      </span>
      <span ref={speedRef} className="hudframe__speed hud-label">
        000 KM/H
      </span>
    </div>
  )
}
