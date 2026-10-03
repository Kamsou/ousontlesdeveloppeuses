import type { MaybeElementRef } from '@vueuse/core'

export function useRevealOnce(target: MaybeElementRef, threshold = 0.2) {
  const visible = ref(false)

  const { stop } = useIntersectionObserver(target, ([entry]) => {
    if (entry?.isIntersecting) {
      visible.value = true
      stop()
    }
  }, { threshold })

  return visible
}
