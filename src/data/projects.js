// Project metadata. All display copy (title / subtitle / overview / highlights)
// lives in src/i18n.js keyed by slug. Images live in public/projects/.
// Souq is a private Shopify theme, so it has no public screenshot
// (image: null -> the giant type block is shown instead).
export const projects = [
  {
    slug: 'vue-rtl-store',
    accent: '#f0a84e',
    year: '2026',
    tags: ['Vue 3', 'vue-i18n', 'RTL', 'Intl'],
    link: 'https://github.com/pepperrrrr/vue-rtl-store',
    image: '/projects/vue-rtl-store.png',
  },
  {
    slug: 'vue-live-auction',
    accent: '#45d4e8',
    year: '2026',
    tags: ['Vue 3', 'WebSocket', 'Node.js', 'Real-time'],
    link: 'https://github.com/pepperrrrr/vue-live-auction',
    image: '/projects/vue-live-auction.png',
  },
  {
    slug: 'pet-health-keeper',
    accent: '#ff8a6b',
    year: '2026',
    tags: ['Vue 3', 'TypeScript', 'PWA', 'IndexedDB', 'GSAP', 'WebGL'],
    link: 'https://github.com/pepperrrrr/pet-health-keeper',
    demo: 'https://pepperrrrr.github.io/pet-health-keeper/',
    image: '/projects/pet-health-keeper.png',
  },
  {
    slug: 'souq-rtl-theme',
    accent: '#a78bff',
    year: '2026',
    tags: ['Shopify', 'Liquid', 'RTL', 'Arabic'],
    link: 'https://github.com/pepperrrrr',
    image: null,
  },
  {
    slug: 'cosmic-explorer',
    accent: '#6da2ff',
    year: '2026',
    tags: ['React', 'Three.js', 'react-three-fiber', 'WebGL'],
    link: 'https://github.com/pepperrrrr/cosmic-explorer',
    demo: 'https://pepper-cosmic-explorer.netlify.app',
    image: '/projects/cosmic-explorer.png',
  },
]

export function findProject(slug) {
  return projects.find((p) => p.slug === slug)
}
