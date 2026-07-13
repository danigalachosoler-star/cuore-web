import { MAX_DPR } from './capabilities'

/**
 * Tratamiento WebGL de la foto del hero: un único quad con shader.
 * Efectos: grano de película animado, aberración cromática radial, viñeta,
 * paralaje sutil con el ratón, barrido de faro cada ~9 s y un latigazo de
 * "scanline" ocasional. Sin three.js: es un plano, no hace falta más.
 */

const VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uMouse;   // -1..1, suavizado en JS
uniform vec2 uCover;   // escala de encuadre cover
uniform vec2 uCenter;  // punto focal en la foto
uniform float uSweep;  // posición del barrido de faro (fuera de rango = apagado)

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // encuadre cover con un 4% de zoom para dar margen al paralaje
  vec2 uv = (vUv - 0.5) * uCover * 0.96 + uCenter;
  uv += uMouse * vec2(0.012, 0.008);

  // latigazo scanline: banda fina que desplaza la imagen un instante por ciclo
  float cycle = floor(uTime * 0.13);
  float phase = fract(uTime * 0.13);
  float gate = smoothstep(0.0, 0.015, phase) * (1.0 - smoothstep(0.03, 0.05, phase));
  float bandY = hash(vec2(cycle, 7.3));
  float band = exp(-pow((vUv.y - bandY) * 90.0, 2.0));
  uv.x += band * gate * 0.018;

  // aberración cromática radial, más fuerte en los bordes
  vec2 dir = uv - 0.5;
  float ab = 0.012 * dot(dir, dir);
  vec3 col = vec3(
    texture2D(uTex, uv + dir * ab).r,
    texture2D(uTex, uv).g,
    texture2D(uTex, uv - dir * ab).b
  );
  float lum = dot(col, vec3(0.299, 0.587, 0.114));

  // barrido de faro: banda diagonal cálida que cruza el encuadre
  float d = abs(vUv.x * 0.82 + vUv.y * 0.18 - uSweep);
  float sweep = exp(-d * d * 60.0) * 0.32;
  col += sweep * vec3(0.93, 0.42, 0.16) * (0.4 + lum);

  // grano animado, más presente en sombras
  float gn = hash(gl_FragCoord.xy + fract(uTime) * 61.7) - 0.5;
  col += gn * 0.085 * (0.55 + 0.45 * (1.0 - lum));

  // viñeta
  float vig = smoothstep(0.92, 0.3, length(vUv - 0.5));
  col *= mix(0.68, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? 'shader compile error')
  }
  return sh
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export interface HeroGLOptions {
  /** punto focal de la foto en coordenadas 0..1 (x, y desde abajo) */
  focal?: [number, number]
  onReady?: () => void
}

export function createHeroGL(
  canvas: HTMLCanvasElement,
  src: string,
  { focal = [0.5, 0.55], onReady }: HeroGLOptions = {},
): () => void {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
  if (!gl) return () => {}

  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  gl.useProgram(program)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = {
    time: gl.getUniformLocation(program, 'uTime'),
    mouse: gl.getUniformLocation(program, 'uMouse'),
    cover: gl.getUniformLocation(program, 'uCover'),
    center: gl.getUniformLocation(program, 'uCenter'),
    sweep: gl.getUniformLocation(program, 'uSweep'),
  }
  gl.uniform2f(u.center, focal[0], focal[1])

  let imgAspect = 1
  let raf = 0
  let running = false
  let visible = true
  let textureReady = false
  const start = performance.now()

  // paralaje del ratón, suavizado
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  const onPointer = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1
  }

  function updateCover() {
    const canvasAspect = canvas.width / canvas.height
    if (canvasAspect > imgAspect) {
      gl!.uniform2f(u.cover, 1, imgAspect / canvasAspect)
    } else {
      gl!.uniform2f(u.cover, canvasAspect / imgAspect, 1)
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const w = Math.round(canvas.clientWidth * dpr)
    const h = Math.round(canvas.clientHeight * dpr)
    if (w === 0 || h === 0 || (canvas.width === w && canvas.height === h)) return
    canvas.width = w
    canvas.height = h
    gl!.viewport(0, 0, w, h)
    updateCover()
  }

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const t = (performance.now() - start) / 1000

    mouse.x += (mouse.tx - mouse.x) * 0.04
    mouse.y += (mouse.ty - mouse.y) * 0.04

    // barrido de faro: cada 9 s, cruza el encuadre en 1.8 s; si no, aparcado
    const tp = t % 9
    const sweep = tp < 1.8 ? easeInOut(tp / 1.8) * 1.5 - 0.25 : 5.0

    gl!.uniform1f(u.time, t)
    gl!.uniform2f(u.mouse, mouse.x, mouse.y)
    gl!.uniform1f(u.sweep, sweep)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function setRunning() {
    const should = textureReady && visible && !document.hidden
    if (should && !running) {
      running = true
      raf = requestAnimationFrame(frame)
    } else if (!should && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const img = new Image()
  img.src = src
  img.decode().then(() => {
    imgAspect = img.naturalWidth / img.naturalHeight
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
    textureReady = true
    resize()
    updateCover()
    setRunning()
    onReady?.()
  })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    setRunning()
  })
  io.observe(canvas)
  const onVisibility = () => setRunning()
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pointermove', onPointer)

  return () => {
    running = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pointermove', onPointer)
    // no se fuerza loseContext: en StrictMode el efecto se remonta sobre el
    // mismo canvas y un contexto perdido no se puede reutilizar
  }
}
