/**
 * Decide si el hero usa el lienzo WebGL o el fallback estático.
 * Estático cuando: prefers-reduced-motion, puntero táctil/pantalla pequeña
 * (móvil), ahorro de datos, hardware justo o WebGL no disponible.
 */
export function canRunImmersiveHero(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.matchMedia('(pointer: coarse)').matches) return false
  if (window.innerWidth < 768) return false

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  return gl !== null
}

/** DPR capado: nitidez suficiente sin pagar 3x de fill rate en pantallas retina. */
export const MAX_DPR = 1.5
