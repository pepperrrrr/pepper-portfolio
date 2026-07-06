<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { projects, findProject } from '../data/projects.js'
import { vReveal } from '../reveal.js'

const route = useRoute()
const { t, tm, rt } = useI18n()
const project = computed(() => findProject(route.params.slug))
// tm returns compiled message ASTs for arrays — rt renders each to a string
const highlights = computed(() =>
  project.value ? tm(`projects.items.${project.value.slug}.highlights`).map((h) => rt(h)) : []
)
const next = computed(() => {
  const i = projects.findIndex((p) => p.slug === route.params.slug)
  return i === -1 ? null : projects[(i + 1) % projects.length]
})
</script>

<template>
  <article v-if="project" class="project" :key="project.slug" :style="{ '--accent': project.accent }">
    <RouterLink :to="{ name: 'home' }" class="back link-line">← {{ t('common.back') }}</RouterLink>

    <header class="head">
      <h1 class="title t-display" v-reveal>{{ t(`projects.items.${project.slug}.title`) }}</h1>
      <p class="subtitle" v-reveal="70">{{ t(`projects.items.${project.slug}.subtitle`) }}</p>
    </header>

    <dl class="meta" v-reveal>
      <div class="meta-cell">
        <dt class="t-label">{{ t('projects.labels.year') }}</dt>
        <dd>{{ project.year }}</dd>
      </div>
      <div class="meta-cell">
        <dt class="t-label">{{ t('projects.labels.role') }}</dt>
        <dd>{{ t(`projects.items.${project.slug}.role`) }}</dd>
      </div>
      <div class="meta-cell meta-stack">
        <dt class="t-label">{{ t('projects.labels.stack') }}</dt>
        <dd>{{ project.tags.join(' · ') }}</dd>
      </div>
    </dl>

    <div class="shot reveal-clip" v-reveal>
      <img v-if="project.image" :src="project.image" :alt="t(`projects.items.${project.slug}.title`)" />
      <div v-else class="shot-type"><span dir="rtl">سوق</span></div>
    </div>

    <div class="copy">
      <section class="block" v-reveal>
        <h2 class="t-label block-t">{{ t('projects.labels.overview') }}</h2>
        <p class="body">{{ t(`projects.items.${project.slug}.overview`) }}</p>
      </section>

      <section class="block" v-reveal>
        <h2 class="t-label block-t">{{ t('projects.labels.highlights') }}</h2>
        <ul class="hl">
          <li v-for="(h, i) in highlights" :key="i">{{ h }}</li>
        </ul>
      </section>

      <div class="actions" v-reveal>
        <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener" class="link-line act">
          {{ t('projects.liveDemo') }} ↗
        </a>
        <a :href="project.link" target="_blank" rel="noopener" class="link-line act">
          {{ t('projects.viewCode') }} ↗
        </a>
      </div>
    </div>

    <RouterLink v-if="next" :to="{ name: 'project', params: { slug: next.slug } }" class="next">
      <span class="t-label">{{ t('common.next') }}</span>
      <span class="next-name t-display">{{ t(`projects.items.${next.slug}.title`) }} →</span>
    </RouterLink>
  </article>

  <div v-else class="notfound">
    <p>{{ t('common.notFound') }}</p>
    <RouterLink :to="{ name: 'home' }" class="back link-line">← {{ t('common.back') }}</RouterLink>
  </div>
</template>

<style scoped>
.project {
  max-width: 1240px;
  margin: 0 auto;
  padding: 9rem clamp(1.2rem, 5vw, 3rem) 4rem;
}

.back {
  color: var(--fg-mute);
  font-size: 0.85rem;
  transition: color 0.3s;
}
.back:hover { color: var(--fg); }

.head { margin: 3.5rem 0 2.5rem; }

.title {
  font-size: clamp(3rem, 10vw, 8rem);
  background: linear-gradient(100deg, var(--fg) 30%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  margin-top: 1.4rem;
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
  font-weight: 500;
  color: var(--fg-soft);
  max-width: 44rem;
  line-height: 1.6;
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: 3.5rem;
}

.meta-cell {
  padding: 1.4rem clamp(0.5rem, 2vw, 1.5rem) 1.4rem 0;
}
[dir='rtl'] .meta-cell { padding: 1.4rem 0 1.4rem clamp(0.5rem, 2vw, 1.5rem); }

.meta-cell dd {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: var(--fg-soft);
}

.shot {
  overflow: hidden;
  background: var(--surface);
  margin-bottom: 4.5rem;
  box-shadow: 0 40px 140px -30px color-mix(in srgb, var(--accent) 45%, transparent);
}

.shot img { width: 100%; display: block; }

.shot-type {
  aspect-ratio: 16 / 8;
  display: grid;
  place-items: center;
  font-family: 'Tajawal', sans-serif;
  font-weight: 800;
  font-size: clamp(5rem, 18vw, 15rem);
  color: var(--fg);
}

.copy { max-width: 680px; margin-inline-start: auto; }

.block { margin-bottom: 3.2rem; }

.block-t { display: block; margin-bottom: 1.2rem; color: var(--accent); }

.body {
  color: var(--fg-soft);
  font-size: 1.05rem;
  line-height: 1.95;
}

.hl { list-style: none; }

.hl li {
  position: relative;
  padding: 0.85rem 0 0.85rem 1.6rem;
  border-bottom: 1px solid var(--line);
  color: var(--fg-soft);
  font-size: 0.98rem;
  line-height: 1.7;
}
[dir='rtl'] .hl li { padding: 0.85rem 1.6rem 0.85rem 0; }

.hl li::before {
  content: '—';
  position: absolute;
  inset-inline-start: 0;
  color: var(--accent);
}

.actions {
  display: flex;
  gap: 2.2rem;
  flex-wrap: wrap;
  margin-top: 2.5rem;
}

.act { font-weight: 600; font-size: 0.95rem; }

.next {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-start;
  margin-top: 8rem;
  padding-top: 3rem;
  border-top: 1px solid var(--line);
  transition: opacity 0.4s;
}
.next:hover { opacity: 0.6; }

.next-name { font-size: clamp(2.2rem, 7vw, 5.5rem); }

.notfound {
  max-width: 720px;
  margin: 40vh auto 0;
  text-align: center;
  color: var(--fg-soft);
}
.notfound .back { display: inline-block; margin-top: 1rem; }
</style>
