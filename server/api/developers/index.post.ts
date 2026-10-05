import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'
import { sendWelcomeEmail } from '../../utils/email'
import { validateName, validateProfileUrls, validateOpenTo, validateLookingFor } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id
  const githubLogin = session.user.login

  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const body = await readBody(event)

  if (!body.linkedinUrl) {
    throw createError({ statusCode: 400, message: 'LinkedIn est requis' })
  }

  if (!body.cocAccepted) {
    throw createError({ statusCode: 400, message: 'Tu dois accepter le code de conduite' })
  }

  const urlError = validateProfileUrls(body)
  if (urlError) {
    throw createError({ statusCode: 400, message: urlError })
  }

  const db = useDrizzle()

  const name = (body.name || session.user.name || '').trim()
  const nameError = validateName(name)
  if (nameError) {
    throw createError({ statusCode: 400, message: nameError })
  }
  const slug = await generateUniqueSlug(name)
  const emailOptIn = body.emailOptIn === true

  const result = await db.insert(tables.developers).values({
    githubId,
    name,
    slug,
    email: session.user.email || null,
    avatarUrl: session.user.image || null,
    bio: body.bio || null,
    title: body.title || null,
    location: body.location || null,
    yearsExperience: typeof body.yearsExperience === 'number' ? body.yearsExperience : null,
    website: body.website || null,
    githubUrl: githubLogin ? `https://github.com/${githubLogin}` : null,
    linkedinUrl: body.linkedinUrl || null,
    twitterUrl: body.twitterUrl || null,
    emailOptIn,
    emailOptInDate: new Date(),
    cocAcceptedAt: new Date()
  }).onConflictDoNothing({ target: tables.developers.githubId }).returning()

  if (!result.length) {
    throw createError({ statusCode: 400, message: 'Profil déjà existant' })
  }

  const [developer] = result

  if (body.skills?.length) {
    await db.insert(tables.developerSkills).values(
      body.skills.map((skill: string) => ({
        developerId: developer.id,
        skillName: normalizeSkillName(skill)
      }))
    )
  }

  const validOpenTo = body.openTo?.length ? validateOpenTo(body.openTo) : []

  if (validOpenTo.length) {
    await db.insert(tables.developerOpenTo).values(
      validOpenTo.map(type => ({
        developerId: developer.id,
        type
      }))
    )
  }

  const validLookingFor = body.lookingFor?.length ? validateLookingFor(body.lookingFor) : []

  if (validLookingFor.length) {
    await db.insert(tables.developerLookingFor).values(
      validLookingFor.map(type => ({
        developerId: developer.id,
        type
      }))
    )
    await db.update(tables.developers).set({
      lookingForSince: new Date()
    }).where(eq(tables.developers.id, developer.id))
  }

  if (validOpenTo.includes('conference')) {
    await db.insert(tables.speakerProfiles).values({
      developerId: developer.id,
      topics: body.speakerTopics ? JSON.stringify(body.speakerTopics) : null,
      pastTalksUrl: body.pastTalksUrl?.trim() || null,
      available: true,
      remoteOk: body.remoteOk ?? true,
      travelWilling: body.travelWilling ?? false
    })
  }

  if (session.user.email) {
    await sendWelcomeEmail(session.user.email, developer.name).catch(console.error)
  }

  if (emailOptIn) {
    await syncBrevoContact(developer.email, developer.name, true)
      .catch(err => console.error('[brevo]', err))
  }

  return { id: developer.id, slug: developer.slug, message: 'Profil créé' }
})
