<script setup>
// A lightweight Three.js nebula/particle field that sits behind the whole page.
// The cursor acts as a moving light: particles near it brighten, and the whole
// field parallaxes gently toward the pointer. Built for performance — one draw
// call, capped DPR, fewer particles on small screens, pauses when backgrounded,
// and falls back to a single static frame when the user prefers reduced motion.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const canvas = ref(null)
let renderer, scene, camera, points, material, geometry
let raf = 0
let themeObserver = null
const clock = new THREE.Clock()

const mouse = new THREE.Vector2(0, 0)     // smoothed pointer, NDC (-1..1)
const mouseTarget = new THREE.Vector2(0, 0)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isSmall = window.matchMedia('(max-width: 720px)').matches

// Warm/purple palette tuned to the site's theme tokens.
const PALETTE = [
  [0.94, 0.66, 0.48], // accent warm
  [0.62, 0.45, 0.82], // purple
  [0.90, 0.55, 0.70], // pink
  [0.96, 0.92, 0.88], // soft cream
  [0.45, 0.60, 0.92], // cool blue (nebula depth)
]

function makeParticles(count) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const scales = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    // Distribute in a soft ellipsoidal cloud in front of the camera.
    const r = Math.pow(Math.random(), 0.7) * 9
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta) * 1.3
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.7 - 2
    const c = PALETTE[(Math.random() * PALETTE.length) | 0]
    colors[i * 3 + 0] = c[0]
    colors[i * 3 + 1] = c[1]
    colors[i * 3 + 2] = c[2]
    scales[i] = 0.6 + Math.random() * 1.4
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
  return g
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uGlow;
  uniform float uSize;
  uniform float uDpr;
  attribute vec3  aColor;
  attribute float aScale;
  varying vec3  vColor;
  varying float vBright;
  void main() {
    vColor = aColor;
    vec3 p = position;
    // very subtle, slow drift — calm enough to stare at without motion sickness
    p.x += sin(uTime * 0.07 + position.y * 0.6) * 0.06;
    p.y += cos(uTime * 0.06 + position.x * 0.6) * 0.06;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 proj = projectionMatrix * mv;
    vec2 ndc = proj.xy / proj.w;
    float d = distance(ndc, uMouse);
    float light = 1.0 + uGlow * smoothstep(0.55, 0.0, d);   // cursor "light"
    vBright = light;
    gl_Position = proj;
    gl_PointSize = uSize * aScale * uDpr * light;
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uExposure;
  varying vec3  vColor;
  varying float vBright;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float dist = length(c);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dist);
    gl_FragColor = vec4(vColor * vBright * uExposure, alpha * uExposure);
  }
`

function currentExposure() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 0.5 : 1.0
}

function init() {
  const el = canvas.value
  renderer = new THREE.WebGLRenderer({ canvas: el, antialias: false, alpha: true })
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(dpr)
  renderer.setSize(window.innerWidth, window.innerHeight)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 6

  geometry = makeParticles(isSmall ? 900 : 2600)
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uGlow: { value: 1.6 },
      uSize: { value: (isSmall ? 2.0 : 2.6) },
      uDpr: { value: dpr },
      uExposure: { value: currentExposure() },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  points = new THREE.Points(geometry, material)
  scene.add(points)

  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)

  // React to the light/dark toggle (data-theme on <html>).
  themeObserver = new MutationObserver(() => {
    material.uniforms.uExposure.value = currentExposure()
    if (reduced) renderOnce()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  if (reduced) renderOnce()
  else loop()
}

function onPointerMove(e) {
  mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1
  mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
}

function onResize() {
  if (!renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (reduced) renderOnce()
}

function onVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(raf)
    raf = 0
  } else if (!reduced && !raf) {
    clock.getDelta() // discard the gap so drift doesn't jump
    loop()
  }
}

function renderOnce() {
  material.uniforms.uTime.value = 1.0
  material.uniforms.uMouse.value.set(0, 0)
  renderer.render(scene, camera)
}

function loop() {
  raf = requestAnimationFrame(loop)
  const t = clock.getElapsedTime()
  material.uniforms.uTime.value = t
  // smooth the pointer for the light + parallax
  mouse.lerp(mouseTarget, 0.05)
  material.uniforms.uMouse.value.copy(mouse)
  // No constant auto-spin — the field is still at rest and only parallaxes
  // (gently) toward the pointer, so it doesn't make you dizzy.
  points.rotation.y = mouse.x * 0.08
  points.rotation.x = -mouse.y * 0.05
  renderer.render(scene, camera)
}

onMounted(init)
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('visibilitychange', onVisibility)
  themeObserver?.disconnect()
  geometry?.dispose()
  material?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="nebula" aria-hidden="true"></canvas>
</template>

<style scoped>
.nebula {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  display: block;
}
</style>
