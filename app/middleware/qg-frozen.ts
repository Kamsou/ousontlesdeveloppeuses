import { QG_FROZEN } from '#shared/utils/qg'

export default defineNuxtRouteMiddleware(() => {
  if (QG_FROZEN) {
    return navigateTo('/qg')
  }
})
