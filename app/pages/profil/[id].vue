<script setup lang="ts">
interface Developer {
  id: number
  name: string
  avatarUrl: string | null
  bio: string | null
  location: string | null
  yearsExperience: number | null
  website: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  skills: string[]
  openTo: string[]
  speakerProfile: {
    topics: string[]
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
}

const route = useRoute()
const id = route.params.id

const openToLabels: Record<string, string> = {
  conference: 'Conférence',
  mentoring: 'Mentoring',
  freelance: 'Freelance',
  cdi: 'CDI',
  coffee_chat: 'Coffee chat',
  pair_programming: 'Pair programming',
  cv_review: 'Relecture CV'
}

const { data: developer, error } = await useFetch<Developer>(`/api/developers/${id}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Profil non trouvé' })
}

// SEO centralisé avec données dynamiques
const getDescription = () => {
  if (!developer.value) return 'Profil de développeuse sur OSLD'
  const parts = []
  if (developer.value.bio) parts.push(developer.value.bio)
  if (developer.value.location) parts.push(`Basée à ${developer.value.location}`)
  if (developer.value.skills?.length) parts.push(`Technologies: ${developer.value.skills.slice(0, 3).join(', ')}`)
  return parts.join('. ') || 'Profil de développeuse sur OSLD'
}

const { canonicalUrl, siteUrl } = usePageSEO({
  title: () => developer.value ? `${developer.value.name} - Développeuse | OSLD` : 'Profil - OSLD',
  description: getDescription,
  path: () => `/profil/${id}`,
  image: () => developer.value?.avatarUrl ? `${siteUrl}${developer.value.avatarUrl}` : undefined,
  type: 'profile'
})

// Structured Data type-safe
const schema = useSchemaOrgSEO()
watchEffect(() => {
  if (developer.value) {
    schema.setPerson({
      name: developer.value.name,
      bio: developer.value.bio,
      avatarUrl: developer.value.avatarUrl,
      location: developer.value.location,
      website: developer.value.website,
      linkedinUrl: developer.value.linkedinUrl,
      githubUrl: developer.value.githubUrl,
      skills: developer.value.skills
    })
    
    schema.setBreadcrumb([
      { name: 'Accueil', url: siteUrl },
      { name: 'Annuaire', url: `${siteUrl}/annuaire` },
      { name: developer.value.name, url: canonicalUrl }
    ])
  }
})
</script>

<template>
  <div class="profil-page">
    <div v-if="developer" class="profil-content">
      <header class="profil-header">
        <NuxtLink to="/annuaire" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Annuaire
        </NuxtLink>

        <div class="header-main">
          <img
            :src="developer.avatarUrl || '/default-avatar.png'"
            :alt="`Photo de profil de ${developer.name}, développeuse${developer.location ? ` basée à ${developer.location}` : ''}`"
            class="avatar"
            loading="lazy"
          />
          <div class="header-info">
            <h1 class="name">{{ developer.name }}</h1>
            <div class="meta">
              <span v-if="developer.location" class="location">{{ developer.location }}</span>
              <span v-if="developer.yearsExperience" class="experience">
                {{ developer.yearsExperience }} ans d'expérience
              </span>
            </div>
          </div>
        </div>

        <div class="links">
          <a v-if="developer.linkedinUrl" :href="developer.linkedinUrl" target="_blank" class="link-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
          </a>
          <a v-if="developer.githubUrl" :href="developer.githubUrl" target="_blank" class="link-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a v-if="developer.website" :href="developer.website" target="_blank" class="link-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Site
          </a>
        </div>
      </header>

      <section v-if="developer.bio" class="section">
        <h2 class="section-title">Bio</h2>
        <p class="bio">{{ developer.bio }}</p>
      </section>

      <section v-if="developer.skills?.length" class="section">
        <h2 class="section-title">Technologies</h2>
        <div class="skills">
          <span v-for="skill in developer.skills" :key="skill" class="skill-pill">
            {{ skill }}
          </span>
        </div>
      </section>

      <section v-if="developer.openTo?.length" class="section">
        <h2 class="section-title">Disponible pour</h2>
        <div class="open-to">
          <span v-for="tag in developer.openTo" :key="tag" class="open-to-tag">
            {{ openToLabels[tag] || tag }}
          </span>
        </div>
      </section>

      <section v-if="developer.speakerProfile" class="section speaker-section">
        <div class="speaker-badge-large">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          Speakeuse
        </div>

        <h2 class="section-title">Profil Speakeuse</h2>

        <div v-if="developer.speakerProfile.topics?.length" class="topics">
          <span class="topics-label">Sujets :</span>
          <span v-for="topic in developer.speakerProfile.topics" :key="topic" class="topic-tag">
            {{ topic }}
          </span>
        </div>

        <div class="speaker-options">
          <span v-if="developer.speakerProfile.remoteOk" class="option">Remote possible</span>
          <span v-if="developer.speakerProfile.travelWilling" class="option">Se déplace</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profil-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--text);
}

.profil-header {
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.meta {
  display: flex;
  gap: 1.5rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.links {
  display: flex;
  gap: 1rem;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.link-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--text-muted);
}

.section {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.bio {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text);
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-pill {
  padding: 0.5rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.9rem;
}

.open-to {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.open-to-tag {
  padding: 0.75rem 1.5rem;
  background: var(--text);
  color: var(--bg);
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 500;
}

.speaker-section {
  border-bottom: none;
}

.speaker-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.topics-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.topic-tag {
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.85rem;
}

.speaker-options {
  display: flex;
  gap: 1rem;
}

.option {
  font-size: 0.9rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .profil-page {
    padding: 0 1.5rem 4rem;
  }

  .header-main {
    flex-direction: column;
    text-align: center;
  }

  .meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .name {
    font-size: 2rem;
  }

  .links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
