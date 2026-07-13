/**
 * Velocidad de scroll suavizada (px/s) compartida: un único rAF para todos
 * los suscriptores (velocímetro del HUD, marquee reactivo…).
 */
type Callback = (velocity: number) => void

const subs = new Set<Callback>()
let raf = 0
let lastY = 0
let lastT = 0
let velocity = 0

function loop(t: number) {
  raf = requestAnimationFrame(loop)
  const y = window.scrollY
  const dt = (t - lastT) / 1000
  if (dt > 0) {
    const instant = (y - lastY) / dt
    velocity += (instant - velocity) * Math.min(1, dt * 7)
  }
  lastY = y
  lastT = t
  for (const cb of subs) cb(velocity)
}

export function onScrollVelocity(cb: Callback): () => void {
  subs.add(cb)
  if (subs.size === 1) {
    lastY = window.scrollY
    lastT = performance.now()
    velocity = 0
    raf = requestAnimationFrame(loop)
  }
  return () => {
    subs.delete(cb)
    if (subs.size === 0) cancelAnimationFrame(raf)
  }
}
