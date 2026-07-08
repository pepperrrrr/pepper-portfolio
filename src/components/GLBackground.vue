<script setup>
// Full-screen WebGL background: a spiral galaxy — warm core, blue-white
// arms, pink nebula sprinkles — wrapped in a distant star shell. The camera
// orbits and closes in as you scroll (cinematic), the galaxy turns slowly on
// its own, and a light following the cursor brightens nearby stars.
// Monochrome-ink version on the light theme. Respects prefers-reduced-motion
// (single static frame), pauses when the tab is hidden, caps DPR, and drops
// star count on touch devices.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const canvas = ref(null)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

let renderer, scene, camera, group, points, material
let raf = 0
let running = false
let disposed = false

// scroll / pointer state
let scrollMax = 1
const pointer = { x: 0, y: 0, active: false } // NDC
const light = new THREE.Vector3(0, 4, 0)      // smoothed world-space light
const lightTarget = new THREE.Vector3(0, 4, 0)
let smoothScroll = 0

// galaxy shape
const GALAXY = fine ? 42000 : 15000
const SKY = fine ? 6000 : 2500
const R = 26            // galaxy radius
const BRANCHES = 5
const SPIN = 0.32       // radians of twist per unit radius
const TILT = -0.55      // how the disc leans toward the viewer

// palette sampled from a Milky Way illustration: cream core, blue-white
// arms, deep blue rim, scattered pink H II regions
const CORE = new THREE.Color('#ffe3b8')
const MID = new THREE.Color('#c9d2f2')
const OUTER = new THREE.Color('#7d93d6')
const PINK = new THREE.Color('#ff9fb4')

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  uniform float uPixelRatio;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vLight;
  varying float vFade;
  varying float vTwinkle;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);

    // cursor light: stars near it flare up
    float dl = distance(world.xyz, uLight);
    vLight = smoothstep(15.0, 0.0, dl);
    vTwinkle = 0.78 + 0.22 * sin(uTime * (0.5 + aSeed * 1.6) + aSeed * 40.0);
    vColor = aColor;

    vec4 mv = viewMatrix * world;
    float nd = -mv.z;
    vFade = smoothstep(2.0, 8.0, nd) * (1.0 - smoothstep(85.0, 140.0, nd));

    gl_PointSize = min(aSize * uPixelRatio * (170.0 / max(nd, 0.1)) * (0.8 + vLight * 0.9), 64.0);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uDark;
  varying vec3 vColor;
  varying float vLight;
  varying float vFade;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.08, d);
    float core = smoothstep(0.2, 0.0, d);
    // dark: additive starlight in the star's own colour, flaring white-warm
    // near the cursor light; light theme: ink dots tinted by the same colour
    vec3 dark = vColor * vTwinkle * (1.0 + vLight * 1.3) + core * 0.25;
    vec3 lite = mix(vec3(0.30, 0.31, 0.36), vColor * 0.34, 0.85) * (1.0 - vLight * 0.45);
    vec3 col = mix(lite, dark, uDark);
    float alpha = disc * vFade * mix(0.30 + 0.4 * vLight, 0.5 + 0.5 * vLight, uDark);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
  }
`

// cheap gaussian-ish jitter centred on 0
function jitter() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

function buildScene() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 220)

  const total = GALAXY + SKY
  const pos = new Float32Array(total * 3)
  const col = new Float32Array(total * 3)
  const size = new Float32Array(total)
  const seed = new Float32Array(total)
  const c = new THREE.Color()

  // — the galaxy disc —
  for (let i = 0; i < GALAXY; i++) {
    const t = Math.pow(Math.random(), 2.2)      // 0 core → 1 rim, dense centre
    const r = t * R
    const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2
    const spin = r * SPIN
    const spread = 0.35 + t * 2.1               // arms blur outward
    pos[i * 3] = Math.cos(branch + spin) * r + jitter() * spread
    pos[i * 3 + 1] = jitter() * (1.6 - t * 1.1) // thick core, thin rim
    pos[i * 3 + 2] = Math.sin(branch + spin) * r + jitter() * spread

    if (Math.random() < 0.035 && t > 0.25) {
      c.copy(PINK)
    } else if (t < 0.4) {
      c.copy(CORE).lerp(MID, t / 0.4)
    } else {
      c.copy(MID).lerp(OUTER, (t - 0.4) / 0.6)
    }
    const glow = 0.72 + Math.random() * 0.5
    col[i * 3] = c.r * glow
    col[i * 3 + 1] = c.g * glow
    col[i * 3 + 2] = c.b * glow
    size[i] = (0.7 + Math.pow(Math.random(), 2.4) * 1.7) * (1.3 - t * 0.55)
    seed[i] = Math.random()
  }

  // — the distant star shell around everything —
  for (let i = GALAXY; i < total; i++) {
    const u = Math.random() * 2 - 1
    const th = Math.random() * Math.PI * 2
    const rr = 55 + Math.random() * 45
    const s = Math.sqrt(1 - u * u)
    pos[i * 3] = rr * s * Math.cos(th)
    pos[i * 3 + 1] = rr * u
    pos[i * 3 + 2] = rr * s * Math.sin(th)
    const glow = 0.35 + Math.random() * 0.45
    col[i * 3] = 0.62 * glow
    col[i * 3 + 1] = 0.66 * glow
    col[i * 3 + 2] = 0.8 * glow
    size[i] = 0.5 + Math.random() * 0.7
    seed[i] = Math.random()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uLight: { value: light },
      uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
      uDark: { value: isDark() ? 1 : 0 },
    },
  })
  applyBlending()

  points = new THREE.Points(geo, material)
  points.frustumCulled = false
  group = new THREE.Group()
  group.rotation.x = TILT
  group.add(points)
  scene.add(group)
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') !== 'light'
}
function applyBlending() {
  material.uniforms.uDark.value = isDark() ? 1 : 0
  material.blending = isDark() ? THREE.AdditiveBlending : THREE.NormalBlending
  material.needsUpdate = true
}

function scrollProgress() {
  return Math.min(Math.max(scrollY / scrollMax, 0), 1)
}

// Project the pointer toward the galaxy so the light lives among the stars.
const ndc = new THREE.Vector3()
function updateLightTarget(t) {
  if (pointer.active) {
    ndc.set(pointer.x, pointer.y, 0.5).unproject(camera)
    const dir = ndc.sub(camera.position).normalize()
    lightTarget.copy(camera.position).addScaledVector(dir, camera.position.length() * 0.8)
  } else {
    // no pointer (touch): the light drifts around the core on its own
    lightTarget.set(Math.sin(t * 0.25) * 9, 3, Math.cos(t * 0.2) * 9)
  }
}

function frame(time) {
  raf = running ? requestAnimationFrame(frame) : 0
  const t = time * 0.001
  material.uniforms.uTime.value = t

  // the galaxy turns slowly on its own
  group.rotation.y = t * 0.014

  // cinematic orbit: the camera circles the galaxy and closes in with scroll
  smoothScroll += (scrollProgress() - smoothScroll) * 0.045
  const p = smoothScroll
  const az = 0.3 + p * 2.3 + t * 0.008
  const el = 0.92 - p * 0.34
  const dist = 36 - p * 12
  camera.position.set(
    Math.cos(el) * Math.sin(az) * dist,
    Math.sin(el) * dist,
    Math.cos(el) * Math.cos(az) * dist
  )
  camera.lookAt(pointer.x * 2.2, pointer.y * 1.4, 0)

  updateLightTarget(t)
  light.lerp(lightTarget, 0.07)

  renderer.render(scene, camera)
}

function start() {
  if (!running && !disposed) { running = true; raf = requestAnimationFrame(frame) }
}
function stop() {
  running = false
  cancelAnimationFrame(raf)
  raf = 0
}

function onPointer(e) {
  pointer.x = (e.clientX / innerWidth) * 2 - 1
  pointer.y = -(e.clientY / innerHeight) * 2 + 1
  pointer.active = true
}
function onResize() {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  material.uniforms.uPixelRatio.value = Math.min(devicePixelRatio, 2)
  measure()
}
function measure() {
  scrollMax = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
}
function onVisibility() {
  document.hidden ? stop() : (!reduced && start())
}

let themeObserver, sizeObserver

onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, fine ? 2 : 1.5))
  buildScene()
  measure()

  themeObserver = new MutationObserver(applyBlending)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  sizeObserver = new ResizeObserver(measure)
  sizeObserver.observe(document.body)
  addEventListener('resize', onResize)
  if (fine) addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)

  if (reduced) {
    // static single frame — no motion for reduced-motion users
    frame(0)
    stop()
  } else {
    start()
  }
})

onBeforeUnmount(() => {
  disposed = true
  stop()
  themeObserver?.disconnect()
  sizeObserver?.disconnect()
  removeEventListener('resize', onResize)
  removeEventListener('pointermove', onPointer)
  document.removeEventListener('visibilitychange', onVisibility)
  points.geometry.dispose()
  material.dispose()
  renderer.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="gl" aria-hidden="true"></canvas>
  <div class="vignette" aria-hidden="true"></div>
</template>

<style scoped>
.gl {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: block;
  pointer-events: none;
  animation: gl-in 1.6s var(--ease) both;
}

@keyframes gl-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* cinematic vignette on top of the stars, below the content */
.vignette {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 50%, transparent 55%, var(--bg) 135%);
  opacity: 0.85;
}
</style>
