<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref(null)
let ctx, raf
let w = 0, h = 0
let nodes = []        // the "constellation" particles (drift + connect with lines)
let dust = []         // tiny twinkling background stars (depth + parallax)
let shooting = []
const mouse = { x: -9999, y: -9999, px: 0, py: 0, active: false }

const LINK = 132      // connect two nodes closer than this
const MLINK = 210     // connect the cursor to nodes closer than this

function build() {
  w = canvas.value.width = window.innerWidth
  h = canvas.value.height = window.innerHeight

  const nodeCount = Math.min(130, Math.floor((w * h) / 14000))
  nodes = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.6 + 0.6,
  }))

  const dustCount = Math.min(220, Math.floor((w * h) / 7000))
  dust = Array.from({ length: dustCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 0.8 + 0.2,
    r: Math.random() * 1.1 + 0.2,
    tw: Math.random() * Math.PI * 2,
    tws: Math.random() * 0.03 + 0.005,
  }))
}

function maybeShoot() {
  if (Math.random() < 0.01 && shooting.length < 2) {
    shooting.push({ x: Math.random() * w * 0.8, y: -20, len: 0, speed: 9 + Math.random() * 7 })
  }
}

function draw() {
  ctx.clearRect(0, 0, w, h)

  // smooth parallax follow
  mouse.px += (mouse.x - mouse.px) * 0.05
  mouse.py += (mouse.y - mouse.py) * 0.05
  const ox = mouse.active ? (mouse.px - w / 2) * 0.012 : 0
  const oy = mouse.active ? (mouse.py - h / 2) * 0.012 : 0

  // background dust
  for (const s of dust) {
    s.tw += s.tws
    const tw = 0.45 + 0.55 * Math.sin(s.tw)
    ctx.beginPath()
    ctx.arc(s.x + ox * s.z * 5, s.y + oy * s.z * 5, s.r * s.z, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(210, 220, 255, ${tw * s.z * 0.8})`
    ctx.fill()
  }

  // move nodes (base drift + a gentle pull toward the cursor, recomputed each frame so they relax back)
  for (const n of nodes) {
    n.x += n.vx
    n.y += n.vy
    if (mouse.active) {
      const dx = mouse.x - n.x, dy = mouse.y - n.y
      const d = Math.hypot(dx, dy)
      if (d < MLINK && d > 0.1) {
        const pull = (1 - d / MLINK) * 0.35
        n.x += (dx / d) * pull
        n.y += (dy / d) * pull
      }
    }
    if (n.x < -20) n.x = w + 20
    if (n.x > w + 20) n.x = -20
    if (n.y < -20) n.y = h + 20
    if (n.y > h + 20) n.y = -20
  }

  // links between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      const dx = a.x - b.x, dy = a.y - b.y
      const d = Math.hypot(dx, dy)
      if (d < LINK) {
        ctx.strokeStyle = `rgba(140, 160, 255, ${(1 - d / LINK) * 0.18})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  // links from the cursor
  if (mouse.active) {
    for (const n of nodes) {
      const dx = mouse.x - n.x, dy = mouse.y - n.y
      const d = Math.hypot(dx, dy)
      if (d < MLINK) {
        ctx.strokeStyle = `rgba(175, 185, 255, ${(1 - d / MLINK) * 0.5})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(mouse.x, mouse.y)
        ctx.lineTo(n.x, n.y)
        ctx.stroke()
      }
    }
  }

  // glowing nodes
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(150, 165, 255, 0.9)'
  for (const n of nodes) {
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(225, 230, 255, 0.95)'
    ctx.fill()
  }
  ctx.shadowBlur = 0

  // shooting stars
  maybeShoot()
  for (let i = shooting.length - 1; i >= 0; i--) {
    const sh = shooting[i]
    sh.x += sh.speed
    sh.y += sh.speed
    sh.len = Math.min(sh.len + sh.speed, 200)
    const g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.len, sh.y - sh.len)
    g.addColorStop(0, 'rgba(255,255,255,0.95)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.strokeStyle = g
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(sh.x, sh.y)
    ctx.lineTo(sh.x - sh.len, sh.y - sh.len)
    ctx.stroke()
    if (sh.x > w + 60 || sh.y > h + 60) shooting.splice(i, 1)
  }

  raf = requestAnimationFrame(draw)
}

function onMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true }
function onLeave() { mouse.active = false; mouse.x = -9999; mouse.y = -9999 }

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  build()
  mouse.px = w / 2; mouse.py = h / 2
  window.addEventListener('resize', build)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseout', onLeave)
  draw()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', build)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseout', onLeave)
})
</script>

<template>
  <canvas ref="canvas" class="starfield"></canvas>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: block;
  pointer-events: none;
}
</style>
