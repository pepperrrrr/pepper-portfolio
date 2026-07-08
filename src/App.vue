<script setup>
import { useI18n } from 'vue-i18n'
import { ref, watch, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import Cats from './components/Cats.vue'

// Three.js is heavy — load the particle field after the shell renders so the
// first paint (type + layout) is instant; the field fades in when ready.
const GLBackground = defineAsyncComponent(() => import('./components/GLBackground.vue'))

const { t, locale } = useI18n()

// Easter egg: type "cat" anywhere to summon the roaming cats; type it again to
// send them home. (No visible hint — that's the point.)
const showCats = ref(false)
let typed = ''
function onKey(e) {
  if (e.key.length !== 1) return
  typed = (typed + e.key.toLowerCase()).slice(-3)
  if (typed === 'cat') showCats.value = !showCats.value
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中', name: '中文' },
  { code: 'ar', label: 'ع', name: 'العربية' },
]

function applyDirection() {
  document.documentElement.lang = locale.value
  document.documentElement.dir = locale.value === 'ar' ? 'rtl' : 'ltr'
}
function setLang(code) {
  locale.value = code
  localStorage.setItem('lang', code)
}
watch(locale, applyDirection)
onMounted(applyDirection)

// Dock hides when scrolling down, returns when scrolling up — it never
// collides with the full-bleed type scrolling underneath it.
const dockHidden = ref(false)
let lastY = 0
function onScrollDock() {
  const y = scrollY
  if (y < 140) {
    dockHidden.value = false // always visible near the top
    lastY = y
    return
  }
  const dy = y - lastY
  if (Math.abs(dy) > 4) {
    dockHidden.value = dy > 0 // down = hide, up = show
    lastY = y
  }
}
onMounted(() => addEventListener('scroll', onScrollDock, { passive: true }))
onBeforeUnmount(() => removeEventListener('scroll', onScrollDock))

// Light / dark theme
const theme = ref(localStorage.getItem('theme') || 'dark')
function applyTheme() { document.documentElement.setAttribute('data-theme', theme.value) }
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  applyTheme()
}
onMounted(applyTheme)
</script>

<template>
  <GLBackground />
  <!-- Cats are a hidden easter egg — type "cat" to summon them -->
  <Cats v-if="showCats" />

  <!-- Floating glass dock — refracts the particle field as the page scrolls -->
  <header class="dock glass" :class="{ 'dock-hidden': dockHidden }">
    <RouterLink :to="{ name: 'home' }" class="brand"><span class="brand-full">{{ t('hero.name') }}</span><span
        class="brand-mono" aria-hidden="true">P</span></RouterLink>
    <nav class="nav">
      <RouterLink :to="{ name: 'home' }">{{ t('nav.home') }}</RouterLink>
      <RouterLink :to="{ name: 'ideas' }">{{ t('nav.ideas') }}</RouterLink>
      <RouterLink :to="{ name: 'about' }">{{ t('nav.about') }}</RouterLink>
    </nav>
    <i class="dock-sep" aria-hidden="true"></i>
    <div class="controls">
      <button class="ctl" @click="toggleTheme" aria-label="Toggle theme" :aria-pressed="theme === 'dark'">◐</button>
      <button v-for="l in languages" :key="l.code" class="ctl" :class="{ active: locale === l.code }"
        :aria-label="l.name" :aria-pressed="locale === l.code" @click="setLang(l.code)">
        {{ l.label }}
      </button>
    </div>
  </header>

  <main class="shell">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </main>

  <footer class="site-footer">
    <p>© 2026 {{ t('hero.name') }} · {{ t('footer.built') }}</p>
  </footer>
</template>

<style scoped>
.shell {
  position: relative;
  z-index: 1;
}

.dock {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: clamp(0.9rem, 2vw, 1.5rem);
  padding: 0.55rem 0.6rem 0.55rem 1.1rem;
  border-radius: var(--r-pill);
  color: var(--fg);
  max-width: calc(100vw - 20px);
  transition: transform 0.5s var(--ease), opacity 0.4s;
}

.dock-hidden {
  transform: translate(-50%, -180%);
  opacity: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .dock { transition: none; }
}
[dir='rtl'] .dock { padding: 0.55rem 1.1rem 0.55rem 0.6rem; }

.brand {
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
[dir='rtl'] .brand { letter-spacing: 0.03em; }
.brand-mono { display: none; }

.nav { display: flex; gap: clamp(0.2rem, 1vw, 0.4rem); }

.nav a {
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-soft);
  padding: 0.4rem 0.7rem;
  border-radius: var(--r-pill);
  transition: color 0.3s, background 0.3s;
}
[dir='rtl'] .nav a { letter-spacing: 0.02em; }

.nav a:hover { color: var(--fg); }

/* the active page sits on its own inner glass pill */
.nav a.router-link-active {
  color: var(--fg);
  background: var(--surface);
  box-shadow: inset 0 1px 0 var(--glass-hi), inset 0 0 0 1px var(--stroke);
}

.dock-sep {
  width: 1px;
  height: 1.1rem;
  background: var(--stroke);
}

.controls { display: flex; gap: 0.1rem; }

.ctl {
  border: 0;
  background: transparent;
  color: var(--fg-mute);
  font-family: inherit;
  font-size: 0.78rem;
  padding: 0.4rem 0.5rem;
  border-radius: var(--r-pill);
  cursor: pointer;
  transition: color 0.3s, background 0.3s;
}

.ctl:hover { color: var(--fg); }
.ctl.active {
  color: var(--fg);
  background: var(--surface);
  box-shadow: inset 0 1px 0 var(--glass-hi), inset 0 0 0 1px var(--stroke);
}

.site-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 3rem 1rem 3.5rem;
  color: var(--fg-mute);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
}
[dir='rtl'] .site-footer { letter-spacing: normal; }

/* Route crossfade — quick and quiet, skipped for reduced motion */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.26s var(--ease);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active { transition: none; }
}

/* Narrow screens: the brand collapses to a monogram and every gap tightens
   so all three languages and the theme toggle stay reachable in the dock */
@media (max-width: 540px) {
  .dock { gap: 0.4rem; padding: 0.45rem 0.5rem 0.45rem 0.8rem; }
  [dir='rtl'] .dock { padding: 0.45rem 0.8rem 0.45rem 0.5rem; }
  .brand-full { display: none; }
  .brand-mono { display: inline; }
  .nav a { font-size: 0.68rem; letter-spacing: 0.04em; padding: 0.35rem 0.5rem; }
  .ctl { font-size: 0.68rem; padding: 0.35rem 0.38rem; }
  .dock-sep { display: none; }
}
</style>
