// v-reveal: adds .reveal, then .in the first time the element scrolls into
// view (one-shot). Optional value = transition delay in ms.
// Usage: v-reveal or v-reveal="120". Pair with .reveal-clip for image reveals.
const io =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              io.unobserve(e.target)
            }
          }
        },
        { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
      )
    : null

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    io ? io.observe(el) : el.classList.add('in')
  },
  unmounted(el) {
    io?.unobserve(el)
  },
}
