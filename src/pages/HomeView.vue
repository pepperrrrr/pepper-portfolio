<script setup>
// Scroll-storytelling home: full-height hero → word-by-word statement →
// stats strip → capabilities → one full-screen chapter per project (image is
// the protagonist, parallax on scroll) → giant contact CTA. All monochrome;
// the WebGL field behind provides the atmosphere.
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { projects } from '../data/projects.js'
import { vReveal } from '../reveal.js'

const { t } = useI18n()

const words = computed(() => t('hero.tagline').split(' '))
const statKeys = ['years', 'langs', 'dirs', 'teams']
const caps = [
  { key: 'commerce', accent: '#f0a84e' },
  { key: 'rtl', accent: '#45d4e8' },
  { key: 'realtime', accent: '#a78bff' },
]

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Parallax: shots drift against the scroll direction, slightly scaling down
// as they settle. rAF-throttled scroll handler, disabled for reduced motion.
let ticking = false
function parallax() {
  ticking = false
  const vh = innerHeight
  for (const el of document.querySelectorAll('[data-parallax]')) {
    const r = el.getBoundingClientRect()
    if (r.bottom < -100 || r.top > vh + 100) continue
    const c = (r.top + r.height / 2 - vh / 2) / vh // -0.5..0.5 around center
    el.style.transform = `translate3d(0, ${(c * -9).toFixed(2)}%, 0) scale(${(1.06 - Math.min(Math.abs(c), 1) * 0.04).toFixed(3)})`
  }
}
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(parallax) }
}
onMounted(() => {
  if (!reduced) {
    addEventListener('scroll', onScroll, { passive: true })
    parallax()
  }
})
onBeforeUnmount(() => removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="home">
  <!-- Single root div: required by the route Transition in App.vue.
       Chapter 0 — hero -->
  <section class="hero">
    <p class="t-label" v-reveal>{{ t('hero.greeting') }}</p>
    <h1 class="name t-display t-grad" v-reveal="80">{{ t('hero.name') }}</h1>
    <p class="role" v-reveal="200">{{ t('hero.role') }}</p>
    <div class="cue" aria-hidden="true">
      <span class="t-label">{{ t('hero.scroll') }}</span>
      <i class="cue-line"></i>
    </div>
  </section>

  <!-- Chapter 1 — statement, one word at a time -->
  <section class="statement">
    <p class="statement-text" v-reveal>
      <span v-for="(w, i) in words" :key="i" class="w" :style="{ transitionDelay: `${i * 35}ms` }">{{ w }}&nbsp;</span>
    </p>
  </section>

  <!-- Chapter 2 — proof in numbers -->
  <section class="stats" v-reveal>
    <div v-for="k in statKeys" :key="k" class="stat">
      <span class="stat-v t-display">{{ t(`stats.${k}.v`) }}</span>
      <span class="stat-l">{{ t(`stats.${k}.l`) }}</span>
    </div>
  </section>

  <!-- Chapter 3 — capabilities -->
  <section class="caps">
    <p class="t-label caps-label" v-reveal>{{ t('caps.label') }}</p>
    <div class="caps-grid">
      <div v-for="(c, i) in caps" :key="c.key" class="cap" :style="{ '--accent': c.accent }" v-reveal="i * 90">
        <span class="cap-n t-display">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 class="cap-t">{{ t(`caps.${c.key}.t`) }}</h3>
        <p class="cap-d">{{ t(`caps.${c.key}.d`) }}</p>
      </div>
    </div>
  </section>

  <!-- Chapters 4..n — one screen per project -->
  <section id="work" class="work">
    <p class="t-label work-title" v-reveal>{{ t('projects.title') }}</p>

    <article v-for="(p, i) in projects" :key="p.slug" class="proj" :class="{ alt: i % 2 }"
      :style="{ '--accent': p.accent }">
      <span class="idx t-display" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>

      <RouterLink :to="{ name: 'project', params: { slug: p.slug } }" class="shot reveal-clip" v-reveal
        :aria-label="t(`projects.items.${p.slug}.title`)">
        <img v-if="p.image" :src="p.image" :alt="t(`projects.items.${p.slug}.title`)" loading="lazy" data-parallax />
        <!-- Souq has no public screenshot: type itself becomes the image -->
        <div v-else class="shot-type" data-parallax><span dir="rtl">سوق</span></div>
      </RouterLink>

      <div class="proj-copy">
        <h3 class="pname t-display" v-reveal>{{ t(`projects.items.${p.slug}.title`) }}</h3>
        <p class="psub" v-reveal="60">{{ t(`projects.items.${p.slug}.subtitle`) }}</p>
        <p class="pshort" v-reveal="120">{{ t(`projects.items.${p.slug}.overview`) }}</p>
        <p class="pmeta" v-reveal="180">
          {{ p.year }} · {{ t(`projects.items.${p.slug}.role`) }} · {{ p.tags.join(' · ') }}
        </p>
        <RouterLink :to="{ name: 'project', params: { slug: p.slug } }" class="link-line popen" v-reveal="240">
          {{ t('projects.open') }} <span class="arr">→</span>
        </RouterLink>
      </div>
    </article>
  </section>

  <!-- Final chapter — contact -->
  <section class="outro">
    <p class="t-label" v-reveal>{{ t('contact.title') }}</p>
    <a href="mailto:adorexixixx@gmail.com" class="cta t-display" v-reveal="100">
      <span class="t-grad">{{ t('contact.cta') }}</span><span class="arr"> ↗</span>
    </a>
    <p class="outro-sub" v-reveal="200">{{ t('contact.text') }}</p>
    <div class="outro-links" v-reveal="280">
      <a class="link-line" href="mailto:adorexixixx@gmail.com">Email</a>
      <a class="link-line" href="https://github.com/pepperrrrr" target="_blank" rel="noopener">GitHub</a>
    </div>
  </section>
  </div>
</template>

<style scoped>
section { position: relative; }

/* ---------- hero ---------- */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 1.5rem;
}

.name {
  font-size: clamp(4.5rem, 19vw, 17rem);
  margin: 1.2rem 0 1.6rem;
}

.role {
  font-size: clamp(0.95rem, 2vw, 1.25rem);
  color: var(--fg-soft);
  max-width: 44rem;
}

.cue {
  position: absolute;
  bottom: 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.cue-line {
  width: 1px;
  height: 56px;
  background: var(--fg-mute);
  transform-origin: top;
  animation: cue 2.2s var(--ease) infinite;
}

@keyframes cue {
  0% { transform: scaleY(0); }
  45% { transform: scaleY(1); transform-origin: top; }
  55% { transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

@media (prefers-reduced-motion: reduce) {
  .cue-line { animation: none; }
}

/* ---------- statement ---------- */
.statement {
  min-height: 64vh;
  display: grid;
  place-items: center;
  padding: 10vh clamp(1.5rem, 8vw, 7rem);
}

.statement-text {
  max-width: 30ch;
  font-family: var(--display);
  font-size: clamp(1.5rem, 3.8vw, 3.1rem);
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.02em;
}
[dir='rtl'] .statement-text { letter-spacing: normal; line-height: 1.65; }

.w {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.6em);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
}
.statement-text.in .w { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .w { opacity: 1; transform: none; transition: none; }
}

/* ---------- stats ---------- */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0;
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: 6vh clamp(1.2rem, 6vw, 6rem) 10vh;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 2rem clamp(1rem, 2vw, 2rem);
  border-inline-start: 1px solid var(--line);
}

.stat-v {
  font-size: clamp(1.7rem, 3.4vw, 2.8rem);
  white-space: nowrap;
}

.stat-l {
  color: var(--fg-mute);
  font-size: 0.85rem;
}

/* ---------- capabilities ---------- */
.caps {
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: 8vh clamp(1.2rem, 6vw, 6rem) 10vh;
}

.caps-label { margin-bottom: 4rem; }

.caps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(2rem, 4vw, 4rem);
}

.cap {
  border-top: 1px solid color-mix(in srgb, var(--accent) 45%, var(--line));
  padding-top: 1.8rem;
}

.cap-n {
  display: block;
  font-size: 0.95rem;
  color: var(--accent);
  margin-bottom: 1.4rem;
}

.cap-t {
  font-family: var(--display);
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
[dir='rtl'] .cap-t { letter-spacing: normal; }

.cap-d {
  color: var(--fg-soft);
  font-size: 0.98rem;
  line-height: 1.85;
}

/* ---------- work chapters ---------- */
.work { padding: 10vh 0 6vh; }

.work-title {
  text-align: center;
  margin-bottom: 4vh;
}

.proj {
  position: relative; /* anchors the ghost .idx to each chapter */
  min-height: 130vh;
  padding: 14vh clamp(1.2rem, 6vw, 6rem) 8vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* huge ghost index — outlined numeral that floats over the top of the image
   (transparent fill, so it never hides the shot beneath it) */
.idx {
  position: absolute;
  top: 3vh;
  inset-inline-start: clamp(0.5rem, 4vw, 4rem);
  z-index: 2; /* sit in front of .shot so the numeral is never clipped */
  font-size: clamp(6rem, 20vw, 18rem);
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.4px color-mix(in srgb, var(--accent) 70%, transparent);
  user-select: none;
  pointer-events: none;
}

.shot {
  position: relative;
  display: block;
  width: min(100%, 1240px);
  margin-inline: auto;
  aspect-ratio: 16 / 9.5;
  overflow: hidden;
  background: var(--surface);
  /* each chapter glows in its own colour */
  box-shadow: 0 40px 140px -30px color-mix(in srgb, var(--accent) 45%, transparent);
}

.shot img,
.shot-type {
  position: absolute;
  inset: -7% 0;
  width: 100%;
  height: 114%;
  object-fit: cover;
  object-position: top;
  will-change: transform;
  transition: filter 0.6s var(--ease);
}

.shot:hover img { filter: brightness(1.08); }

.shot-type {
  display: grid;
  place-items: center;
  font-family: 'Tajawal', sans-serif;
  font-weight: 800;
  font-size: clamp(6rem, 22vw, 19rem);
  color: var(--fg);
  background: var(--surface);
}

.proj-copy {
  width: min(100%, 1240px);
  margin-inline: auto;
  padding-top: clamp(1.6rem, 4vh, 3.2rem);
  max-width: 600px;
  margin-inline-start: auto;
  margin-inline-end: max(calc((100% - 1240px) / 2), 0px);
}

.proj.alt .proj-copy {
  margin-inline-start: max(calc((100% - 1240px) / 2), 0px);
  margin-inline-end: auto;
}

.pname {
  font-size: clamp(2.2rem, 5.5vw, 4.2rem);
  margin-bottom: 0.9rem;
  background: linear-gradient(100deg, var(--fg) 30%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.psub {
  font-size: clamp(1.05rem, 1.8vw, 1.3rem);
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 1.1rem;
}

.pshort {
  color: var(--fg-soft);
  font-size: 0.98rem;
  line-height: 1.85;
  margin-bottom: 1.4rem;
}

.pmeta {
  color: var(--fg-mute);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}
[dir='rtl'] .pmeta { letter-spacing: normal; }

.popen { font-weight: 600; font-size: 0.95rem; transition: color 0.3s; }
.popen:hover { color: var(--accent); }

.arr {
  display: inline-block;
  transition: transform 0.4s var(--ease);
}
.popen:hover .arr { transform: translateX(6px); }
[dir='rtl'] .arr { transform: scaleX(-1); }
[dir='rtl'] .popen:hover .arr { transform: scaleX(-1) translateX(6px); }

/* ---------- outro ---------- */
.outro {
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10vh 1.5rem 6vh;
  gap: 1.6rem;
}

.cta {
  font-size: clamp(3rem, 11vw, 9.5rem);
  transition: opacity 0.4s;
}
.cta:hover { opacity: 0.6; }
.cta .arr { transition: transform 0.5s var(--ease); }
.cta:hover .arr { transform: translate(8px, -8px); }
[dir='rtl'] .cta .arr { transform: scaleX(-1); }
[dir='rtl'] .cta:hover .arr { transform: scaleX(-1) translate(8px, -8px); }

.outro-sub {
  color: var(--fg-soft);
  max-width: 36rem;
  font-size: 1.02rem;
}

.outro-links {
  display: flex;
  gap: 2rem;
  margin-top: 0.6rem;
  color: var(--fg-soft);
  font-size: 0.9rem;
}

@media (max-width: 720px) {
  .proj { min-height: auto; padding-top: 18vh; }
  .proj-copy, .proj.alt .proj-copy { margin-inline: 0; max-width: none; }
  .stat { border-inline-start: 0; border-top: 1px solid var(--line); padding-inline: 0; }
}
</style>
