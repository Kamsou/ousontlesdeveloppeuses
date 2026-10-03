import { QG_FROZEN } from '#shared/utils/qg'

export function assertQgOpen() {
  if (QG_FROZEN) {
    throw createError({ statusCode: 403, message: 'Le QG est en lecture seule' })
  }
}
