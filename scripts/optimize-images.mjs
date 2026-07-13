/**
 * Optimiza las fotos originales de /assets a webp responsivo en /public/img.
 * Los nombres de origen tienen espacios inconsistentes, así que se casan por
 * número de serie: "cuore NN.jpg" → serie a, "cuore-N.JPG" → serie b.
 */
import { readdir } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = path.resolve('assets')
const OUT = path.resolve('public/img')
const WIDTHS = [640, 1024, 1600, 2048]
const QUALITY = 72

// serie+número → slug semántico. null = excluida de la web.
const MAP = {
  a01: 'navy-bmw',
  a02: 'navy-sit',
  a03: 'navy-blur',
  a04: 'ride-walk',
  a05: 'hero', // camiseta blanca de pie junto a la MT-09 — hero de la home
  a06: 'ride-front',
  b1: 'tee-close',
  b2: 'bmw-front',
  b3: 'bmw-hood',
  b4: 'bmw-side',
  b5: 'mt09',
  b6: 'ride-blur',
  b7: 'ride-red',
  b8: 'ride-window',
  b9: null, // gesto no apto para la web pública
}

await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f))

for (const file of files) {
  const num = file.match(/(\d+)/)?.[1]
  if (!num) continue
  const series = file.endsWith('.JPG') ? 'b' : 'a'
  const key = series === 'a' ? `a${num.padStart(2, '0')}` : `b${num}`
  const slug = MAP[key]
  if (slug === undefined) console.warn(`sin mapear: ${file}`)
  if (!slug) continue

  const input = sharp(path.join(SRC, file)).rotate()
  for (const w of WIDTHS) {
    await input
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT, `${slug}-${w}.webp`))
  }
  console.log(`${file} → ${slug}-{${WIDTHS.join(',')}}.webp`)
}
