<script setup>
// Full-screen WebGL background: a GPU particle field the camera dollies through
// as you scroll (cinematic camera), lit by a light that follows the cursor
// (particles brighten near it, and are gently pushed away). Monochrome on both
// themes. Respects prefers-reduced-motion (single static frame), pauses when
// the tab is hidden, caps DPR, and drops particle count on touch devices.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const canvas = ref(null)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

let renderer, scene, camera, points, material
let raf = 0
let running = false
let disposed = false

// scroll / pointer state
let scrollMax = 1
const pointer = { x: 0, y: 0, active: false } // NDC
const light = new THREE.Vector3(0, 0, -14)    // smoothed world-space light
const lightTarget = new THREE.Vector3(0, 0, -14)
const camPos = new THREE.Vector3(0, 0, 12)
const lookAt = new THREE.Vector3(0, 0, -10)
let smoothScroll = 0

const COUNT = fine ? 9000 : 3500
const DEPTH = 165 // particles span z ∈ [12, -153]; camera travels z 12 → -100

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  uniform float uPixelRatio;
  attribute vec3 aSeed;
  attribute float aSize;
  varying float vLight;
  varying float vFade;
  varying float vTwinkle;
  varying float vHueSeed;

  void main() {
    vec3 p = position;

    // gentle flow field — cheap trig "curl"
    float t = uTime * 0.14;
    p.x += sin(p.y * 0.24 + t * 2.0 + aSeed.x * 6.2831) * 1.1;
    p.y += cos(p.x * 0.21 + t * 1.5 + aSeed.y * 6.2831) * 0.9;
    p.z += sin(p.x * 0.11 + p.y * 0.16 + t + aSeed.z * 6.2831) * 1.0;

    // cursor light pushes nearby particles away
    vec3 toL = p - uLight;
    float dl = length(toL);
    p += (toL / max(dl, 0.001)) * smoothstep(6.0, 0.0, dl) * 2.6;

    // real-time point-light falloff → brightness varying
    vLight = smoothstep(22.0, 0.0, dl);
    vTwinkle = 0.78 + 0.22 * sin(uTime * (0.6 + aSeed.x * 1.4) + aSeed.y * 6.2831);
    vHueSeed = aSeed.y;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float nd = -mv.z;
    // fade in just before the camera and out into the far fog
    vFade = smoothstep(1.5, 7.0, nd) * (1.0 - smoothstep(85.0, 135.0, nd));

    gl_PointSize = min(aSize * uPixelRatio * (150.0 / max(nd, 0.1)) * (0.7 + vLight * 1.1), 80.0);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uDark;
  uniform float uHue; // scroll-driven colour journey
  varying float vLight;
  varying float vFade;
  varying float vTwinkle;
  varying float vHueSeed;

  // cosine palette (IQ): full iridescent sweep across the hue axis
  vec3 pal(float t) {
    return 0.55 + 0.45 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.67)));
  }

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.06, d);
    float core = smoothstep(0.22, 0.0, d);
    // each particle sits near the scene hue, with its own slight offset;
    // the cursor light pushes colours toward white-hot
    float hue = fract(uHue + (vHueSeed - 0.5) * 0.22);
    vec3 tint = pal(hue);
    vec3 dark = mix(tint * 0.62, mix(tint, vec3(1.0), 0.6), vLight) * vTwinkle;
    vec3 lite = mix(tint * 0.52, tint * 0.30, vLight);
    vec3 col = mix(lite, dark, uDark);
    float alpha = disc * vFade * mix(0.34 + 0.5 * vLight, 0.30 + 0.62 * vLight + core * 0.4, uDark);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
  }
`

function buildScene() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200)
  camera.position.copy(camPos)

  const pos = new Float32Array(COUNT * 3)
  const seed = new Float32Array(COUNT * 3)
  const size = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 58
    pos[i * 3 + 1] = (Math.random() - 0.5) * 34
    pos[i * 3 + 2] = 12 - Math.random() * DEPTH
    seed[i * 3] = Math.random()
    seed[i * 3 + 1] = Math.random()
    seed[i * 3 + 2] = Math.random()
    size[i] = 0.5 + Math.pow(Math.random(), 2.2) * 1.6
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))

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
      uHue: { value: 0.33 },
    },
  })
  applyBlending()
  points = new THREE.Points(geo, material)
  points.frustumCulled = false
  scene.add(points)
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

// Project the pointer onto a plane ~22 units in front of the camera so the
// light lives in world space at particle depth.
const ndc = new THREE.Vector3()
function updateLightTarget() {
  if (pointer.active) {
    ndc.set(pointer.x, pointer.y, 0.5).unproject(camera)
    const dir = ndc.sub(camera.position).normalize()
    if (dir.z < -0.001) lightTarget.copy(camera.position).addScaledVector(dir, -22 / dir.z)
  } else {
    // no pointer (touch): the light slowly orbits ahead of the camera
    const t = material.uniforms.uTime.value * 0.3
    lightTarget.set(Math.sin(t) * 7, Math.cos(t * 0.8) * 4, camera.position.z - 22)
  }
}

function frame(time) {
  raf = running ? requestAnimationFrame(frame) : 0
  const t = time * 0.001
  material.uniforms.uTime.value = t
  // colour journey: blue-violet at the top of the page, sweeping through
  // teal and gold toward magenta as you scroll, with a slow ambient drift
  material.uniforms.uHue.value = 0.33 + smoothScroll * 0.75 + t * 0.008

  // cinematic camera: dolly through the field with a lateral sway,
  // easing toward the scroll target so motion feels weighted
  smoothScroll += (scrollProgress() - smoothScroll) * 0.045
  const p = smoothScroll
  camPos.set(Math.sin(p * Math.PI * 1.6) * 4.0, Math.cos(p * Math.PI) * 1.6, 12 - p * 112)
  camera.position.lerp(camPos, 0.08)

  // look slightly ahead on the path + a touch of pointer parallax
  const pa = p + 0.07
  lookAt.set(
    Math.sin(pa * Math.PI * 1.6) * 2.4 + pointer.x * 1.6,
    Math.cos(pa * Math.PI) * 1.0 + pointer.y * 1.0,
    camera.position.z - 20
  )
  camera.lookAt(lookAt)
  camera.rotateZ(Math.sin(p * Math.PI * 2) * 0.02 + pointer.x * -0.012)

  updateLightTarget()
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
    smoothScroll = 0
    renderer.render(scene, camera)
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
/* cinematic vignette on top of the particles, below the content */
.vignette {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 50%, transparent 55%, var(--bg) 135%);
  opacity: 0.85;
}
</style>
