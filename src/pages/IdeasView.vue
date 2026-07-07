<script setup>
// Private idea constellation, synced across every device through a Netlify
// function backed by Netlify Blobs. A shared passcode (checked server-side)
// gates both reading and writing, so the sky stays private. The passcode is
// remembered locally so each of Pepper's devices only asks once.
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { vReveal } from '../reveal.js'

const { t, locale } = useI18n()

const API = '/.netlify/functions/ideas'
const KEY_STORE = 'pepper-ideas-key'

const key = ref(localStorage.getItem(KEY_STORE) || '')
const unlocked = ref(false)
const loading = ref(false)
const error = ref('')        // network/server error banner
const wrong = ref(false)     // bad passcode on the lock screen

const ideas = ref([])
const text = ref('')
const passInput = ref('')
const selected = ref(null)
const busy = ref(false)

async function api(method, { body, query } = {}) {
  const url = query ? `${API}?${new URLSearchParams(query)}` : API
  const res = await fetch(url, {
    method,
    headers: { 'x-ideas-key': key.value, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    const e = new Error('unauthorized')
    e.code = 401
    throw e
  }
  if (!res.ok) throw new Error('request failed')
  return res.status === 204 ? null : res.json()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    ideas.value = await api('GET')
    unlocked.value = true
  } catch (e) {
    if (e.code === 401) {
      // stored passcode no longer valid — fall back to the lock screen
      key.value = ''
      localStorage.removeItem(KEY_STORE)
      unlocked.value = false
      wrong.value = true
    } else {
      error.value = t('ideas.error')
    }
  } finally {
    loading.value = false
  }
}

async function unlock() {
  const v = passInput.value.trim()
  if (!v) return
  key.value = v
  wrong.value = false
  await load()
  if (unlocked.value) localStorage.setItem(KEY_STORE, v)
}

function lock() {
  key.value = ''
  localStorage.removeItem(KEY_STORE)
  unlocked.value = false
  ideas.value = []
  selected.value = null
  passInput.value = ''
}

async function add() {
  const v = text.value.trim()
  if (!v || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const star = await api('POST', { body: { text: v.slice(0, 140) } })
    ideas.value.push(star)
    text.value = ''
    selected.value = star
  } catch {
    error.value = t('ideas.error')
  } finally {
    busy.value = false
  }
}

async function remove(id) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await api('DELETE', { query: { id } })
    ideas.value = ideas.value.filter((i) => i.id !== id)
    selected.value = null
  } catch {
    error.value = t('ideas.error')
  } finally {
    busy.value = false
  }
}

function toggle(star) {
  selected.value = selected.value?.id === star.id ? null : star
}

const points = computed(() => ideas.value.map((i) => `${i.x},${i.y}`).join(' '))

const df = computed(() => {
  const tag = locale.value === 'zh' ? 'zh-CN' : locale.value === 'ar' ? 'ar' : 'en'
  return new Intl.DateTimeFormat(tag, { year: 'numeric', month: 'short', day: 'numeric' })
})

onMounted(() => {
  if (key.value) load() // a remembered device opens straight into the sky
})
</script>

<template>
  <section class="ideas">
    <header class="head">
      <h1 class="page-title t-display" v-reveal>{{ t('ideas.title') }}</h1>
      <p class="sub" v-reveal="60">{{ t('ideas.sub') }}</p>
      <p v-if="unlocked && ideas.length" class="t-label count" v-reveal="120">
        {{ t('ideas.count', { n: ideas.length }) }}
      </p>
    </header>

    <!-- Lock screen -->
    <form v-if="!unlocked" class="lock glass" @submit.prevent="unlock">
      <p class="lock-prompt">{{ t('ideas.lockPrompt') }}</p>
      <div class="lock-row">
        <input v-model="passInput" type="password" class="add-input" :placeholder="t('ideas.passcode')"
          :aria-label="t('ideas.passcode')" autocomplete="current-password" />
        <button type="submit" class="link-line add-btn" :disabled="!passInput.trim() || loading">
          {{ loading ? t('ideas.loading') : t('ideas.unlock') }} →
        </button>
      </div>
      <p v-if="wrong" class="lock-err">{{ t('ideas.wrong') }}</p>
      <p v-else-if="error" class="lock-err">{{ error }}</p>
    </form>

    <!-- The sky -->
    <template v-else>
      <div class="sky glass" v-reveal>
        <svg v-if="ideas.length > 1" class="lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline :points="points" />
        </svg>

        <button v-for="i in ideas" :key="i.id" class="star" :class="{ sel: selected?.id === i.id, big: i.s > 6 }"
          :style="{ left: i.x + '%', top: i.y + '%', '--s': i.s + 'px', '--tw': i.tw + 's', '--d': i.d + 's', '--star-h': i.h ?? 210 }"
          :title="i.text" :aria-label="i.text" @click="toggle(i)"></button>

        <p v-if="loading" class="empty-msg">{{ t('ideas.loading') }}</p>
        <p v-else-if="!ideas.length" class="empty-msg">{{ t('ideas.empty') }}</p>
      </div>

      <div v-if="selected" class="detail glass">
        <span class="t-label">{{ df.format(selected.date) }}</span>
        <p class="detail-text">{{ selected.text }}</p>
        <button class="link-line detail-del" :disabled="busy" @click="remove(selected.id)">{{ t('ideas.remove') }}</button>
      </div>

      <p v-if="error" class="lock-err feed-err">{{ error }}</p>

      <form class="add" @submit.prevent="add">
        <input v-model="text" class="add-input" :placeholder="t('ideas.placeholder')"
          :aria-label="t('ideas.placeholder')" maxlength="140" :disabled="busy" />
        <button type="submit" class="link-line add-btn" :disabled="!text.trim() || busy">{{ t('ideas.add') }} ✦</button>
      </form>

      <button class="lock-btn t-label" @click="lock">{{ t('ideas.lock') }}</button>
    </template>
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

/* ---------- lock screen ---------- */
.lock {
  max-width: 34rem;
  padding: 2.4rem 2.2rem 2.6rem;
  border-radius: var(--r-lg);
}

.lock-prompt {
  color: var(--fg-soft);
  margin-bottom: 1.4rem;
}

.lock-row {
  display: flex;
  align-items: flex-end;
  gap: 1.4rem;
}

.lock-err {
  margin-top: 1rem;
  color: #ff6b6b;
  font-size: 0.9rem;
}
[data-theme='light'] .lock-err { color: #d63b3b; }

.feed-err { margin: 1rem 0 0; }

/* ---------- the sky: one large glass pane over the cosmos ---------- */
.sky {
  position: relative;
  height: min(62vh, 640px);
  border-radius: var(--r-lg);
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
  margin-top: 1.4rem;
  padding: 1.3rem 1.6rem;
  border-radius: var(--r-md);
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
.detail-del:disabled { opacity: 0.5; cursor: default; }

/* ---------- add form ---------- */
.add {
  display: flex;
  align-items: flex-end;
  gap: 1.6rem;
  margin-top: 2.4rem;
}

.add-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--stroke);
  border-radius: var(--r-pill);
  box-shadow: inset 0 1px 0 var(--glass-hi);
  color: var(--fg);
  font-family: inherit;
  font-size: 1rem;
  padding: 0.7rem 1.2rem;
  transition: border-color 0.3s;
}

.add-input:focus {
  outline: none;
  border-color: var(--fg-soft);
}

.add-input::placeholder { color: var(--fg-mute); }
.add-input:disabled { opacity: 0.5; }

.add-btn {
  background: var(--surface);
  border: 1px solid var(--stroke);
  border-radius: var(--r-pill);
  box-shadow: inset 0 1px 0 var(--glass-hi);
  color: var(--fg);
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.7rem 1.4rem;
  white-space: nowrap;
  transition: transform 0.3s var(--ease), border-color 0.3s;
}

.add-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--fg-soft); }

.add-btn:disabled {
  color: var(--fg-mute);
  cursor: default;
}

.lock-btn {
  margin-top: 3rem;
  background: transparent;
  border: 0;
  color: var(--fg-mute);
  font-family: inherit;
  cursor: pointer;
  transition: color 0.3s;
}
.lock-btn:hover { color: var(--fg); }
</style>
