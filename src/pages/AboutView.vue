<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { vReveal } from '../reveal.js'

const { t, tm, rt } = useI18n()

// Experience entries live in i18n as an array of objects; rt renders each field
const jobs = computed(() =>
  tm('about.exp').map((j) => ({
    period: rt(j.period),
    org: rt(j.org),
    role: rt(j.role),
    desc: rt(j.desc),
  }))
)

const skillGroups = [
  { title: 'frontend', items: ['Vue 3', 'TypeScript', 'JavaScript', 'React', 'HTML / CSS', 'vue-i18n', 'Pinia'] },
  { title: 'specialties', items: ['Arabic / RTL', 'E-commerce', 'Shopify themes', 'Real-time (WebSocket)', 'SEO', 'PWA'] },
  { title: 'tools', items: ['Vite', 'Git', 'Three.js', 'GSAP', 'Node.js', 'REST APIs'] },
]
</script>

<template>
  <section class="about">
    <h1 class="page-title t-display" v-reveal>{{ t('about.title') }}</h1>

    <div class="bio">
      <p v-reveal>{{ t('about.p1') }}</p>
      <p v-reveal="60">{{ t('about.p2') }}</p>
      <p v-reveal="120">{{ t('about.p3') }}</p>
      <p class="hint" v-reveal="180">{{ t('about.p4') }}</p>
    </div>

    <h2 class="t-label sub" v-reveal>{{ t('about.expTitle') }}</h2>
    <ol class="timeline">
      <li v-for="(j, i) in jobs" :key="j.period" class="job" v-reveal="i * 80">
        <span class="job-period t-label">{{ j.period }}</span>
        <div class="job-body">
          <h3 class="job-org">{{ j.org }}</h3>
          <p class="job-role">{{ j.role }}</p>
          <p class="job-desc">{{ j.desc }}</p>
        </div>
      </li>
    </ol>

    <h2 class="t-label sub" v-reveal>{{ t('skills.title') }}</h2>
    <div class="skill-groups" v-reveal>
      <div v-for="g in skillGroups" :key="g.title" class="skill-group">
        <h3 class="t-label">{{ t('skills.' + g.title) }}</h3>
        <ul>
          <li v-for="item in g.items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <h2 class="t-label sub" v-reveal>{{ t('contact.title') }}</h2>
    <p class="contact-text" v-reveal>{{ t('contact.text') }}</p>
    <a href="mailto:adorexixixx@gmail.com" class="cta t-display" v-reveal="80">{{ t('contact.emailMe') }} ↗</a>
    <div class="links" v-reveal="140">
      <a href="https://github.com/pepperrrrr" target="_blank" rel="noopener" class="link-line">GitHub</a>
    </div>
  </section>
</template>

<style scoped>
.about {
  max-width: 920px;
  margin: 0 auto;
  padding: 10rem clamp(1.2rem, 5vw, 3rem) 6rem;
}

.page-title {
  font-size: clamp(3rem, 9vw, 6.5rem);
  margin-bottom: 4.5rem;
}

.bio { max-width: 660px; }

.bio p {
  color: var(--fg-soft);
  font-size: clamp(1.05rem, 1.8vw, 1.22rem);
  line-height: 1.9;
  margin-bottom: 1.6rem;
}

.hint { color: var(--fg); font-weight: 500; }

.sub {
  margin: 5.5rem 0 2.4rem;
  padding-top: 2.2rem;
  border-top: 1px solid var(--line);
}

/* ---------- experience timeline ---------- */
.timeline { list-style: none; }

.job {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: clamp(1rem, 3vw, 2.5rem);
  padding: 2rem 0;
  border-bottom: 1px solid var(--line);
}

.job-period { padding-top: 0.3rem; }

.job-org {
  font-family: var(--display);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
[dir='rtl'] .job-org { letter-spacing: normal; }

.job-role {
  color: var(--fg-mute);
  font-size: 0.88rem;
  margin: 0.3rem 0 1rem;
}

.job-desc {
  color: var(--fg-soft);
  font-size: 0.98rem;
  line-height: 1.85;
  max-width: 56ch;
}

@media (max-width: 640px) {
  .job { grid-template-columns: 1fr; gap: 0.6rem; }
}

/* ---------- skills ---------- */
.skill-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 2.5rem;
}

.skill-group h3 { margin-bottom: 1.1rem; }

.skill-group ul { list-style: none; }

.skill-group li {
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--line);
  color: var(--fg-soft);
  font-size: 0.95rem;
}

/* ---------- contact ---------- */
.contact-text {
  color: var(--fg-soft);
  max-width: 36rem;
  margin-bottom: 2rem;
}

.cta {
  display: inline-block;
  font-size: clamp(2.2rem, 7vw, 5rem);
  transition: opacity 0.4s;
}
.cta:hover { opacity: 0.6; }

.links {
  margin-top: 2.5rem;
  color: var(--fg-soft);
  font-size: 0.9rem;
}
</style>
