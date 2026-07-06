<script setup>
// Full-bleed art background with a pseudo-3D feel: the image parallax-shifts and
// tilts slightly toward the pointer, and a warm light sweeps across following the
// cursor. A scrim keeps page text readable. Pure CSS transforms (no WebGL) so it
// stays cheap; disabled for reduced-motion and touch (no hover) users.
import { onMounted, onBeforeUnmount, ref } from 'vue'

const root = ref(null)
let raf = 0
const target = { x: 0, y: 0 }   // pointer in -1..1
const cur = { x: 0, y: 0 }      // smoothed

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

function onMove(e) {
  target.x = (e.clientX / window.innerWidth) * 2 - 1
  target.y = (e.clientY / window.innerHeight) * 2 - 1
  if (!raf) raf = requestAnimationFrame(tick)
}

function tick() {
  cur.x += (target.x - cur.x) * 0.08
  cur.y += (target.y - cur.y) * 0.08
  const el = root.value
  if (el) {
    // parallax translate (px) + subtle 3D tilt (deg)
    el.style.setProperty('--px', (cur.x * -18).toFixed(2) + 'px')
    el.style.setProperty('--py', (cur.y * -18).toFixed(2) + 'px')
    el.style.setProperty('--ry', (cur.x * 3).toFixed(2) + 'deg')
    el.style.setProperty('--rx', (cur.y * -3).toFixed(2) + 'deg')
    // light position follows the actual pointer
    el.style.setProperty('--lx', (50 + cur.x * 50).toFixed(1) + '%')
    el.style.setProperty('--ly', (50 + cur.y * 50).toFixed(1) + '%')
  }
  if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) {
    raf = requestAnimationFrame(tick)
  } else {
    raf = 0
  }
}

onMounted(() => {
  if (canHover && !reduced) window.addEventListener('pointermove', onMove, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="root" class="art" aria-hidden="true">
    <div class="art-img"></div>
    <div class="art-light"></div>
    <div class="art-scrim"></div>
  </div>
</template>

<style scoped>
.art {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  perspective: 1200px;
  /* defaults so it looks right before the first pointer move */
  --px: 0px; --py: 0px; --rx: 0deg; --ry: 0deg; --lx: 50%; --ly: 42%;
}

.art-img {
  position: absolute;
  inset: -6%;
  background: #161014 url('/bg-art.jpg') center 28% / cover no-repeat;
  transform: translate3d(var(--px), var(--py), 0) rotateX(var(--rx)) rotateY(var(--ry)) scale(1.14);
  transform-style: preserve-3d;
  /* mild blur keeps the mood but lets page text stay crisp + adds depth */
  filter: blur(2.5px) brightness(0.92) saturate(1.05);
  will-change: transform;
}

/* warm light that follows the cursor */
.art-light {
  position: absolute;
  inset: -6%;
  background: radial-gradient(circle at var(--lx) var(--ly),
    rgba(255, 205, 150, 0.30) 0%,
    rgba(150, 130, 255, 0.12) 32%,
    transparent 60%);
  mix-blend-mode: screen;
  transition: opacity 0.3s;
}

/* readability scrim — darker at top (header) and bottom, lighter middle */
.art-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(12, 9, 14, 0.74) 0%, rgba(12, 9, 14, 0.46) 24%,
      rgba(12, 9, 14, 0.46) 68%, rgba(12, 9, 14, 0.82) 100%),
    radial-gradient(ellipse at 50% 42%, rgba(12, 9, 14, 0.20) 0%, rgba(12, 9, 14, 0.55) 100%);
}

:global([data-theme='light']) .art-scrim {
  background:
    linear-gradient(180deg, rgba(245, 240, 235, 0.70) 0%, rgba(245, 240, 235, 0.32) 24%,
      rgba(245, 240, 235, 0.32) 70%, rgba(245, 240, 235, 0.82) 100%);
}
</style>
