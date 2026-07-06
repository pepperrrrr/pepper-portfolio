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
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中' },
  { code: 'ar', label: 'ع' },
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

  <!-- White text + difference blend = header auto-inverts over any backdrop -->
  <header class="site-header">
    <RouterLink :to="{ name: 'home' }" class="brand">{{ t('hero.name') }}</RouterLink>
    <nav class="nav">
      <RouterLink :to="{ name: 'home' }" class="link-line">{{ t('nav.home') }}</RouterLink>
      <RouterLink :to="{ name: 'ideas' }" class="link-line">{{ t('nav.ideas') }}</RouterLink>
      <RouterLink :to="{ name: 'about' }" class="link-line">{{ t('nav.about') }}</RouterLink>
    </nav>
    <div class="controls">
      <button class="ctl" @click="toggleTheme" :aria-label="'theme: ' + theme">◐</button>
      <button v-for="l in languages" :key="l.code" class="ctl" :class="{ active: locale === l.code }"
        @click="setLang(l.code)">
        {{ l.label }}
      </button>
    </div>
  </header>

  <main class="shell">
    <RouterView />
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

.site-header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: clamp(1.2rem, 3vw, 2.4rem);
  padding: clamp(1.1rem, 2.5vw, 1.8rem) clamp(1.2rem, 5vw, 4rem);
  color: #fff;
  mix-blend-mode: difference;
}

.brand {
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
[dir='rtl'] .brand { letter-spacing: 0.04em; }

.nav {
  display: flex;
  gap: clamp(1.1rem, 2.5vw, 2rem);
  margin-inline-start: auto;
}

.nav a {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.68;
  transition: opacity 0.3s;
}
[dir='rtl'] .nav a { letter-spacing: 0.03em; }

.nav a:hover,
.nav a.router-link-active { opacity: 1; }

.controls { display: flex; gap: 0.15rem; }

.ctl {
  border: 0;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.25rem 0.45rem;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.3s;
}

.ctl:hover { opacity: 1; }
.ctl.active { opacity: 1; text-decoration: underline; text-underline-offset: 5px; }

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
</style>
