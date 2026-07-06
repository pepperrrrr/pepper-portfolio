import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './pages/HomeView.vue'
import ProjectView from './pages/ProjectView.vue'
import AboutView from './pages/AboutView.vue'
import IdeasView from './pages/IdeasView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/projects/:slug', name: 'project', component: ProjectView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/ideas', name: 'ideas', component: IdeasView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
