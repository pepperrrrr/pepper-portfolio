<script setup>
import { onMounted, onBeforeUnmount, reactive, ref } from 'vue'

const W = ref(window.innerWidth)
const H = ref(window.innerHeight)
const bowl = reactive({ x: 0, y: 0 })
const food = reactive({ x: 0, y: 0, active: false })
const treat = reactive({ x: 0, y: 0, dragging: false })
const found = ref(false)
const clicked = new Set()
let raf, last = 0

function rand(a, b) { return a + Math.random() * (b - a) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const breeds = [
  { name: 'Mimi',  base: '#efe9df', patch: '#e6a052', patch2: '#5b554f', eye: '#caa24a', pattern: 'calico',     short: true,  fluffy: false, tuft: false, scale: 0.92 },
  { name: 'Leo',   base: '#a87b4e', patch: '#6c4a2c', patch2: '#6c4a2c', eye: '#8fae6a', pattern: 'tabby',      short: false, fluffy: true,  tuft: true,  scale: 1.12 },
  { name: 'Blue',  base: '#8a93a3', patch: '#f4f2ef', patch2: '#f4f2ef', eye: '#caa24a', pattern: 'bicolor',    short: false, fluffy: true,  tuft: false, scale: 1.0  },
  { name: 'Sunny', base: '#e8954e', patch: '#c9742f', patch2: '#c9742f', eye: '#8fae6a', pattern: 'tabby',      short: false, fluffy: true,  tuft: true,  scale: 1.06 },
  { name: 'Mochi', base: '#f1e9db', patch: '#7c5b49', patch2: '#7c5b49', eye: '#6aa6d8', pattern: 'colorpoint', short: false, fluffy: true,  tuft: false, scale: 1.04 },
]

const cats = reactive(
  breeds.map((b, i) => ({
    id: i, breed: b,
    x: rand(120, window.innerWidth - 120),
    y: rand(150, window.innerHeight - 130),
    facing: Math.random() < 0.5 ? 1 : -1,
    state: 'wander', timer: rand(0, 2), speed: rand(28, 46),
    target: null, blink: false, blinkTimer: rand(2, 6), hover: false,
  }))
)

function depth(cat) { return cat.breed.scale * (0.78 + (cat.y / H.value) * 0.4) }

function decide(cat) {
  const r = Math.random()
  if (r < 0.10) { cat.target = { type: 'bowl' }; cat.state = 'wander' }
  else if (r < 0.26) { const o = pick(cats.filter((c) => c.id !== cat.id && c.state === 'wander')); if (o) { cat.target = { type: 'cat', id: o.id }; cat.state = 'wander' } else cat.target = { type: 'point', x: rand(60, W.value - 60), y: rand(140, H.value - 100) } }
  else if (r < 0.36) { cat.state = 'jump'; cat.timer = 0.6; cat.target = null }
  else if (r < 0.50) { cat.state = 'sleep'; cat.timer = rand(4, 7); cat.target = null }
  else if (r < 0.58) { cat.state = 'stretch'; cat.timer = 1; cat.target = null }
  else { cat.target = { type: 'point', x: rand(60, W.value - 60), y: rand(140, H.value - 100) }; cat.state = 'wander' }
}

function targetPos(cat) {
  const t = cat.target
  if (!t) return null
  if (t.type === 'point') return { x: t.x, y: t.y }
  if (t.type === 'bowl') return { x: bowl.x, y: bowl.y }
  if (t.type === 'food') return { x: food.x, y: food.y }
  if (t.type === 'cat') { const o = cats[t.id]; return { x: o.x, y: o.y } }
}

function step(t) {
  if (!last) last = t
  const dt = Math.min((t - last) / 1000, 0.05)
  last = t

  for (const cat of cats) {
    cat.blinkTimer -= dt
    if (cat.blinkTimer <= 0) { cat.blink = true; setTimeout(() => (cat.blink = false), 150); cat.blinkTimer = rand(2.5, 6) }

    if (['nuzzle', 'sit', 'drink', 'jump', 'sleep', 'stretch'].includes(cat.state)) {
      cat.timer -= dt
      if (cat.timer <= 0) decide(cat)
      continue
    }
    if (cat.state === 'eat') {
      cat.timer -= dt
      if (cat.timer <= 0) { food.active = false; decide(cat) }
      continue
    }

    // wandering toward a target
    const tp = targetPos(cat)
    if (!tp) { decide(cat); continue }
    if (cat.target.type === 'food' && !food.active) { decide(cat); continue }
    const dx = tp.x - cat.x, dy = tp.y - cat.y
    const dist = Math.hypot(dx, dy)
    cat.facing = dx < 0 ? -1 : 1
    const stop = cat.target.type === 'cat' ? 40 : 8
    if (dist < stop) {
      if (cat.target.type === 'point') { cat.state = 'sit'; cat.timer = rand(1.4, 3) }
      else if (cat.target.type === 'bowl') { cat.state = 'drink'; cat.timer = rand(2.2, 3.4) }
      else if (cat.target.type === 'food') { cat.state = 'eat'; cat.timer = 2.2 }
      else if (cat.target.type === 'cat') {
        const o = cats[cat.target.id]
        cat.state = 'nuzzle'; cat.timer = rand(1.8, 2.8); cat.facing = o.x < cat.x ? -1 : 1
        if (o.state === 'wander') { o.state = 'nuzzle'; o.timer = cat.timer; o.facing = cat.x < o.x ? -1 : 1; o.target = null }
      }
      cat.target = null
    } else {
      cat.x += (dx / dist) * cat.speed * dt
      cat.y += (dy / dist) * cat.speed * dt
    }
  }
  raf = requestAnimationFrame(step)
}

function poke(cat) {
  cat.state = 'jump'; cat.timer = 0.6; cat.target = null
  clicked.add(cat.id)
  if (clicked.size === cats.length && !found.value) {
    found.value = true
    cats.forEach((c) => { c.state = 'jump'; c.timer = 0.6; c.target = null })
    setTimeout(() => { found.value = false; clicked.clear() }, 4500)
  }
}

// drag the fish treat to feed a cat
function onTreatDown() {
  treat.dragging = true
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', onDrop)
}
function onDrag(e) { treat.x = e.clientX; treat.y = e.clientY }
function onDrop(e) {
  treat.dragging = false
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', onDrop)
  food.x = e.clientX; food.y = e.clientY; food.active = true
  let best = null, bd = Infinity
  for (const c of cats) {
    if (['sleep', 'eat', 'nuzzle'].includes(c.state)) continue
    const d = Math.hypot(c.x - food.x, c.y - food.y)
    if (d < bd) { bd = d; best = c }
  }
  if (best) { best.target = { type: 'food' }; best.state = 'wander' }
}

function onResize() {
  W.value = window.innerWidth; H.value = window.innerHeight
  bowl.x = window.innerWidth * 0.5; bowl.y = window.innerHeight * 0.8
}

onMounted(() => { onResize(); window.addEventListener('resize', onResize); raf = requestAnimationFrame(step) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) })
</script>

<template>
  <div class="scene">
    <!-- water bowl -->
    <svg class="bowl" :style="{ left: bowl.x + 'px', top: bowl.y + 'px' }" width="56" height="26" viewBox="0 0 56 26">
      <ellipse cx="28" cy="19" rx="27" ry="6" fill="#cdbfa6" />
      <path d="M4 15 Q28 27 52 15 L49 9 Q28 17 7 9 Z" fill="#8fb6d6" />
      <ellipse cx="28" cy="10" rx="22" ry="3.6" fill="#a7cde8" />
    </svg>

    <!-- dropped food -->
    <div v-if="food.active" class="food" :style="{ left: food.x + 'px', top: food.y + 'px' }">🐟</div>

    <!-- draggable treat -->
    <div
      class="treat"
      :class="{ dragging: treat.dragging }"
      :style="treat.dragging ? { left: treat.x + 'px', top: treat.y + 'px' } : {}"
      @pointerdown.prevent="onTreatDown"
      title="拖我去喂猫"
    >🐟</div>

    <!-- found-all banner -->
    <transition name="pop"><div v-if="found" class="banner">你找到了全部 5 只猫咪! 🐾</div></transition>

    <!-- cats -->
    <div
      v-for="cat in cats"
      :key="cat.id"
      class="cat"
      :class="[cat.state, { blink: cat.blink }]"
      :style="{ transform: `translate(${cat.x - 40}px, ${cat.y - 56}px)`, zIndex: Math.round(cat.y) }"
      @click="poke(cat)"
      @mouseenter="cat.hover = true"
      @mouseleave="cat.hover = false"
    >
      <transition name="pop"><span v-if="cat.hover" class="namebubble">{{ cat.breed.name }}</span></transition>
      <span v-if="cat.state === 'sleep'" class="zzz">💤</span>
      <div class="flip" :style="{ transform: `scale(${depth(cat)}) scaleX(${cat.facing})` }">
        <svg width="80" height="64" viewBox="0 0 80 64">
          <path class="tail" d="M16 42 Q2 36 9 22" :stroke="cat.breed.base" :stroke-width="cat.breed.fluffy ? 9 : 6" fill="none" stroke-linecap="round" />
          <ellipse v-if="cat.breed.fluffy" class="ruff" cx="40" cy="44" rx="27" ry="17" :fill="cat.breed.base" opacity="0.5" />
          <ellipse class="body" cx="40" cy="44" rx="23" ry="15" :fill="cat.breed.base" />
          <template v-if="cat.breed.pattern === 'tabby'">
            <path d="M30 33 q4 6 0 12 M40 32 q4 7 0 14 M50 33 q4 6 0 12" :stroke="cat.breed.patch" stroke-width="2.5" fill="none" opacity="0.6" />
          </template>
          <template v-else-if="cat.breed.pattern === 'calico'">
            <ellipse cx="50" cy="40" rx="11" ry="9" :fill="cat.breed.patch" />
            <ellipse cx="30" cy="46" rx="8" ry="6" :fill="cat.breed.patch2" />
          </template>
          <template v-else-if="cat.breed.pattern === 'bicolor'">
            <ellipse cx="40" cy="50" rx="18" ry="9" :fill="cat.breed.patch" />
          </template>
          <rect class="leg leg-a" x="30" :y="cat.breed.short ? 54 : 52" width="6" :height="cat.breed.short ? 7 : 10" rx="3" :fill="cat.breed.base" />
          <rect class="leg leg-b" x="46" :y="cat.breed.short ? 54 : 52" width="6" :height="cat.breed.short ? 7 : 10" rx="3" :fill="cat.breed.pattern === 'colorpoint' ? cat.breed.patch : cat.breed.base" />
          <g class="head">
            <polygon points="48,14 55,2 60,16" :fill="cat.breed.pattern === 'colorpoint' ? cat.breed.patch : cat.breed.base" />
            <polygon points="63,16 71,4 73,18" :fill="cat.breed.pattern === 'colorpoint' ? cat.breed.patch : cat.breed.base" />
            <line v-if="cat.breed.tuft" x1="54" y1="6" x2="56" y2="14" :stroke="cat.breed.patch" stroke-width="1.5" />
            <line v-if="cat.breed.tuft" x1="69" y1="8" x2="68" y2="16" :stroke="cat.breed.patch" stroke-width="1.5" />
            <circle cx="59" cy="26" r="14" :fill="cat.breed.base" />
            <path v-if="cat.breed.pattern === 'colorpoint'" d="M59 14 a14 14 0 0 1 8 20 q-8 5 -16 0 a14 14 0 0 1 8 -20" :fill="cat.breed.patch" opacity="0.7" />
            <ellipse class="eye" cx="54" cy="25" rx="2.2" ry="3.2" :fill="cat.breed.eye" />
            <ellipse class="eye" cx="64" cy="25" rx="2.2" ry="3.2" :fill="cat.breed.eye" />
            <path d="M57 31 Q59 33 61 31" stroke="#3a2a26" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <polygon points="58,28 60,28 59,30" fill="#c87d7d" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.bowl { position: absolute; margin-inline-start: -28px; margin-top: -10px; }
.food { position: absolute; font-size: 22px; transform: translate(-50%, -50%); animation: drop 0.3s ease; }
@keyframes drop { from { transform: translate(-50%, -120%); } to { transform: translate(-50%, -50%); } }

.treat {
  position: fixed; bottom: 24px; inset-inline-start: 24px; z-index: 30;
  font-size: 30px; cursor: grab; pointer-events: auto; user-select: none;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); touch-action: none;
}
.treat.dragging { cursor: grabbing; transform: translate(-50%, -50%) scale(1.2); bottom: auto; inset-inline-start: auto; }

.banner {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 30;
  background: var(--accent); color: #161014; font-weight: 700;
  padding: 0.7rem 1.4rem; border-radius: 999px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}

.cat { position: absolute; inset-inline-start: 0; top: 0; width: 80px; height: 64px; pointer-events: auto; cursor: pointer; will-change: transform; }
.flip { transform-origin: 40px 56px; }
.cat svg { display: block; overflow: visible; }

.namebubble {
  position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: #161014; font-size: 11px; font-weight: 700;
  padding: 2px 9px; border-radius: 999px; white-space: nowrap;
}
.zzz { position: absolute; top: -6px; inset-inline-start: 50px; font-size: 15px; animation: floatZ 1.8s ease-in-out infinite; }
@keyframes floatZ { 0%,100%{ opacity: 0.4; transform: translateY(2px);} 50%{ opacity: 1; transform: translateY(-6px);} }

.cat.wander .body, .cat.wander .head, .cat.wander .ruff { animation: bob 0.5s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
.cat.wander .leg-a { animation: stepA 0.5s linear infinite; }
.cat.wander .leg-b { animation: stepB 0.5s linear infinite; }
@keyframes stepA { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-3px);} }
@keyframes stepB { 0%,100%{ transform: translateY(-3px);} 50%{ transform: translateY(0);} }

.cat.jump svg { animation: hopY 0.6s ease; }
@keyframes hopY { 0%,100%{ transform: translateY(0);} 45%{ transform: translateY(-32px);} }

.cat.drink .head, .cat.eat .head { animation: lap 0.4s ease-in-out infinite; transform-origin: 59px 26px; }
@keyframes lap { 0%,100%{ transform: translateY(3px) rotate(8deg);} 50%{ transform: translateY(9px) rotate(12deg);} }

/* head rub when two cats meet */
.cat.nuzzle .head { animation: nuzzle 0.45s ease-in-out infinite; transform-origin: 50px 30px; }
@keyframes nuzzle { 0%,100%{ transform: translateX(2px) rotate(8deg);} 50%{ transform: translateX(6px) rotate(15deg);} }

/* sleeping: settle down and breathe */
.cat.sleep .flip { transform: scale(var(--s,1)) translateY(6px) !important; }
.cat.sleep .body, .cat.sleep .ruff { animation: breathe 2.4s ease-in-out infinite; }
@keyframes breathe { 0%,100%{ transform: scaleY(1);} 50%{ transform: scaleY(1.06);} }
.cat.sleep .eye { transform: scaleY(0.1); transform-origin: center; }

/* stretch */
.cat.stretch .body { animation: stretchB 1s ease; }
@keyframes stretchB { 0%,100%{ transform: scaleX(1);} 35%{ transform: scaleX(1.18) translateY(2px);} }

.tail { transform-origin: 13px 40px; animation: wag 1.3s ease-in-out infinite; }
@keyframes wag { 0%,100%{ transform: rotate(-6deg);} 50%{ transform: rotate(12deg);} }

.cat.blink .eye { transform: scaleY(0.1); transform-origin: center; }

.pop-enter-active, .pop-leave-active { transition: opacity 0.2s, transform 0.2s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateX(-50%) scale(0.8); }
</style>
