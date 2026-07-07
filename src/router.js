import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './pages/HomeView.vue'
import ProjectView from './pages/ProjectView.vue'
import AboutView from './pages/AboutView.vue'
import IdeasView from './pages/IdeasView.vue'
import { messages } from './i18n.js'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/projects/:slug', name: 'project', component: ProjectView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/ideas', name: 'ideas', component: IdeasView },
  // anything else lands back on home instead of a blank screen
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Per-route document titles (English base — search engines and tab bars).
const NAME = 'Pepper Duan'
// Matches the <title> in index.html so the home route keeps the full SEO title
const BASE = `${NAME} — Senior Front-end Engineer · E-commerce, Real-time, Arabic RTL`
router.afterEach((to) => {
  if (to.name === 'project') {
    const title = messages.en.projects.items[to.params.slug]?.title
    document.title = title ? `${title} — ${NAME}` : BASE
  } else if (to.name === 'about') {
    document.title = `About — ${NAME}`
  } else if (to.name === 'ideas') {
    document.title = `Ideas — ${NAME}`
  } else {
    document.title = BASE
  }
})
