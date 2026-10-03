import type { PostHog } from 'posthog-js'

type TrackedMethod = 'capture' | 'identify' | 'reset'

export interface ClientPosthog {
  capture: (...args: Parameters<PostHog['capture']>) => void
  identify: (...args: Parameters<PostHog['identify']>) => void
  reset: (...args: Parameters<PostHog['reset']>) => void
}

export default defineNuxtPlugin(() => {
  const { publicKey, host } = useRuntimeConfig().public.posthog as { publicKey?: string, host: string }

  if (!publicKey) {
    return { provide: { clientPosthog: null as ClientPosthog | null } }
  }

  const queue: { method: TrackedMethod, args: unknown[] }[] = []
  let posthog: PostHog | null = null

  function call(method: TrackedMethod, args: unknown[]) {
    if (posthog) {
      (posthog[method] as (...a: unknown[]) => unknown)(...args)
    } else {
      queue.push({ method, args })
    }
  }

  const clientPosthog: ClientPosthog = {
    capture: (...args) => call('capture', args),
    identify: (...args) => call('identify', args),
    reset: (...args) => call('reset', args)
  }

  async function load() {
    const { default: instance } = await import('posthog-js')
    instance.init(publicKey!, {
      api_host: host,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      disable_surveys: true,
      disable_web_experiments: true,
      capture_dead_clicks: false
    })
    posthog = instance
    for (const { method, args } of queue.splice(0)) {
      (instance[method] as (...a: unknown[]) => unknown)(...args)
    }
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => load(), { timeout: 4000 })
  } else {
    setTimeout(load, 2000)
  }

  return { provide: { clientPosthog: clientPosthog as ClientPosthog | null } }
})
