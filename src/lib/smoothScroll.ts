import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

/**
 * Scroll con inercia (Lenis) sincronizado con ScrollTrigger. Solo en
 * escritorio con puntero fino y sin prefers-reduced-motion: en táctil el
 * scroll nativo ya es correcto y en reduced-motion no se altera nada.
 */
export function initSmoothScroll(): () => void {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  ) {
    return () => {}
  }

  // el scroll-behavior:smooth de CSS pelearía con Lenis por los anclas
  document.documentElement.style.scrollBehavior = 'auto'

  const lenis = new Lenis({ lerp: 0.11, anchors: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
    document.documentElement.style.scrollBehavior = ''
  }
}
