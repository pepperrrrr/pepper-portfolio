import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import { router } from './router.js'
import { messages } from './i18n.js'
import './style.css'

// Pick the language: ?lang= in the URL first, then the saved choice, then English.
const urlLang = new URLSearchParams(location.search).get('lang')
const allowed = ['en', 'zh', 'ar']
const saved = [urlLang, localStorage.getItem('lang')].find((l) => allowed.includes(l)) || 'en'

const i18n = createI18n({
  legacy: false,        // use the Composition API
  locale: saved,
  fallbackLocale: 'en',
  messages,
})

createApp(App).use(router).use(i18n).mount('#app')
