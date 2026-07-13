import type { Lang, Size } from '../i18n/copy'

/**
 * PUNTO DE INTEGRACIÓN DE EMAIL — único sitio a tocar para conectar el
 * proveedor real.
 *
 * La web es estática, así que la clave del proveedor NO puede vivir en el
 * cliente: se conecta creando un endpoint serverless (en Vercel:
 * `api/subscribe.ts`) que reciba este payload y llame a
 *   - Beehiiv:   POST https://api.beehiiv.com/v2/publications/{pubId}/subscriptions
 *                con `custom_fields: [{ name: 'size', value: payload.size }]`
 *   - Mailchimp: POST /3.0/lists/{listId}/members con merge_fields.SIZE
 * y aquí se sustituye el cuerpo de `subscribe()` por un
 * `fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(payload) })`.
 */

export interface SubscribePayload {
  email: string
  size: Size
  consent: true
  lang: Lang
}

export type SubscribeResult = { ok: true } | { ok: false; error: 'invalid' | 'network' }

// Stub en memoria para esta primera versión: la web funciona de punta a
// punta y el cambio de proveedor queda aislado en esta función.
const memoryList: SubscribePayload[] = []

export async function subscribe(payload: SubscribePayload): Promise<SubscribeResult> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { ok: false, error: 'invalid' }
  }
  // latencia simulada para que el estado "enviando" sea real en la UI
  await new Promise((r) => setTimeout(r, 450))
  memoryList.push(payload)
  console.info('[cuore] alta en lista (stub):', payload)
  return { ok: true }
}
