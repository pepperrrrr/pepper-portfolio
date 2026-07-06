<script setup>
// Idea constellation: every idea saved becomes a star in the sky, placed
// randomly at birth and remembered forever (localStorage). Stars connect in
// the order they were added, so over time the collection reads as a
// constellation. Click a star to read the idea; remove it to let it go.
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { vReveal } from '../reveal.js'

const { t, locale } = useI18n()

const STORAGE = 'pepper-ideas'

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

const ideas = ref(load())
const text = ref('')
const selected = ref(null)

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(ideas.value))
}

function add() {
  const v = text.value.trim()
  if (!v) return
  const star = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: v.slice(0, 140),
    date: Date.now(),
    // birth position and character, fixed for life
    x: +(6 + Math.random() * 88).toFixed(2),
    y: +(8 + Math.random() * 80).toFixed(2),
    s: +(3 + Math.random() * 5).toFixed(1),      // core size, px
    tw: +(2 + Math.random() * 3).toFixed(1),      // twinkle period, s
    d: +(Math.random() * 3).toFixed(1),           // twinkle delay, s
    h: Math.floor(Math.random() * 360),           // its own colour, for life
  }
  ideas.value.push(star)
  save()
  text.value = ''
  selected.value = star
}

function remove(id) {
  ideas.value = ideas.value.filter((i) => i.id !== id)
  save()
  selected.value = null
}

function toggle(star) {
  selected.value = selected.value?.id === star.id ? null : star
}

// constellation path, in the sky's 0-100 coordinate space
const points = computed(() => ideas.value.map((i) => `${i.x},${i.y}`).join(' '))

const df = computed(() => {
  const tag = locale.value === 'zh' ? 'zh-CN' : locale.value === 'ar' ? 'ar' : 'en'
  return new Intl.DateTimeFormat(tag, { year: 'numeric', month: 'short', day: 'numeric' })
})
</script>

<template>
  <section class="ideas">
    <header class="head">
      <h1 class="page-title t-display" v-reveal>{{ t('ideas.title') }}</h1>
      <p class="sub" v-reveal="60">{{ t('ideas.sub') }}</p>
      <p v-if="ideas.length" class="t-label count" v-reveal="120">{{ t('ideas.count', { n: ideas.length }) }}</p>
    </header>

    <div class="sky" v-reveal>
      <!-- faint line joining stars in the order they were born -->
      <svg v-if="ideas.length > 1" class="lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="points" />
      </svg>

      <button v-for="i in ideas" :key="i.id" class="star" :class="{ sel: selected?.id === i.id, big: i.s > 6 }"
        :style="{ left: i.x + '%', top: i.y + '%', '--s': i.s + 'px', '--tw': i.tw + 's', '--d': i.d + 's', '--star-h': i.h ?? 210 }"
        :title="i.text" :aria-label="i.text" @click="toggle(i)"></button>

      <p v-if="!ideas.length" class="empty-msg">{{ t('ideas.empty') }}</p>
    </div>

    <!-- selected idea -->
    <div v-if="selected" class="detail">
      <span class="t-label">{{ df.format(selected.date) }}</span>
      <p class="detail-text">{{ selected.text }}</p>
      <button class="link-line detail-del" @click="remove(selected.id)">{{ t('ideas.remove') }}</button>
    </div>

    <!-- add a star -->
    <form class="add" @submit.prevent="add">
      <input v-model="text" class="add-input" :placeholder="t('ideas.placeholder')" maxlength="140" />
      <button type="submit" class="link-line add-btn" :disabled="!text.trim()">{{ t('ideas.add') }} ✦</button>
    </form>
  </section>
</template>

<style scoped>
.ideas {
  max-width: 1240px;
  margin: 0 auto;
  padding: 9rem clamp(1.2rem, 5vw, 3rem) 4rem;
}

.head { margin-bottom: 3rem; }

.page-title {
  font-size: clamp(3rem, 9vw, 6.5rem);
  margin-bottom: 1.4rem;
}

.sub {
  color: var(--fg-soft);
  font-size: clamp(1.05rem, 1.8vw, 1.25rem);
  max-width: 34rem;
  line-height: 1.8;
}

.count { display: block; margin-top: 1.6rem; }

/* ---------- the sky ---------- */
.sky {
  position: relative;
  height: min(62vh, 640px);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.lines polyline {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

/* a star: generous hit area, glowing core, optional cross sparkle */
.star {
  position: absolute;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  animation: born 0.9s var(--ease);
}

.star {
  /* each idea shines in its own colour; deeper tones on the light theme */
  --star-c: hsl(var(--star-h) 90% 72%);
}
:global([data-theme='light']) .star {
  --star-c: hsl(var(--star-h) 75% 42%);
}

.star::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: var(--s);
  height: var(--s);
  border-radius: 50%;
  background: var(--star-c);
  box-shadow: 0 0 calc(var(--s) * 2.4) 0 var(--star-c);
  animation: twinkle var(--tw) ease-in-out var(--d) infinite;
}

/* bigger stars get a four-point sparkle */
.star.big::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: calc(var(--s) * 3.6);
  height: calc(var(--s) * 3.6);
  background:
    linear-gradient(var(--star-c), var(--star-c)) center / 1px 100% no-repeat,
    linear-gradient(var(--star-c), var(--star-c)) center / 100% 1px no-repeat;
  opacity: 0.55;
  animation: twinkle var(--tw) ease-in-out var(--d) infinite;
}

.star.sel::before {
  box-shadow:
    0 0 calc(var(--s) * 2.4) 0 var(--star-c),
    0 0 0 8px color-mix(in srgb, var(--star-c) 22%, transparent);
  animation: none;
}

.star:hover::before { animation-play-state: paused; }

@keyframes twinkle {
  50% { opacity: 0.35; }
}

@keyframes born {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .star, .star::before, .star.big::after { animation: none; }
}

.empty-msg {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--fg-mute);
  font-size: 0.95rem;
  padding: 1rem;
  text-align: center;
}

/* ---------- selected idea ---------- */
.detail {
  display: flex;
  align-items: baseline;
  gap: 1.4rem;
  flex-wrap: wrap;
  padding: 1.6rem 0 0.4rem;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1.6rem;
}

.detail-text {
  flex: 1;
  min-width: 12rem;
  font-family: var(--display);
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 500;
  line-height: 1.6;
}

.detail-del {
  color: var(--fg-mute);
  background: transparent;
  border: 0;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.3s;
}
.detail-del:hover { color: var(--fg); }

/* ---------- add form ---------- */
.add {
  display: flex;
  align-items: flex-end;
  gap: 1.6rem;
  margin-top: 2.4rem;
}

.add-input {
  flex: 1;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: var(--fg);
  font-family: inherit;
  font-size: 1.05rem;
  padding: 0.7rem 0;
  transition: border-color 0.3s;
}

.add-input:focus {
  outline: none;
  border-bottom-color: var(--fg-soft);
}

.add-input::placeholder { color: var(--fg-mute); }

.add-btn {
  background: transparent;
  border: 0;
  color: var(--fg);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding-block: 0.7rem;
  white-space: nowrap;
}

.add-btn:disabled {
  color: var(--fg-mute);
  cursor: default;
}
</style>
