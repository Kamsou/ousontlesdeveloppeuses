// This endpoint is used by the sitemap module to fetch dynamic routes
export default defineEventHandler(async () => {
  const routes: string[] = []
  
  try {
    const db = useDrizzle()
    
    // Fetch all developers for profile pages
    const developers = await db.query.developers.findMany({
      columns: { id: true }
    })
    
    developers.forEach((dev) => {
      if (dev?.id) {
        routes.push(`/profil/${dev.id}`)
      }
    })
  } catch (error) {
    console.warn('Could not fetch dynamic routes for sitemap:', error)
  }
  
  return routes
})

