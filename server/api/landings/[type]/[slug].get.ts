export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, 'type')
  const slug = getRouterParam(event, 'slug')

  if ((type !== 'ville' && type !== 'techno') || !slug) {
    throw createError({ statusCode: 404, message: 'Page introuvable' })
  }

  const landing = await getLanding(type, slug)

  if (!landing) {
    throw createError({ statusCode: 404, message: 'Page introuvable' })
  }

  return landing
})
