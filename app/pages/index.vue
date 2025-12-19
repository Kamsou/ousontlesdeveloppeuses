<script setup lang="ts">
useSeoMeta({
  title: 'OSLD - Où Sont Les Développeuses',
  ogTitle: 'OSLD - Où Sont Les Développeuses',
  description: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
  ogDescription: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})

const { status, signIn } = useAuth()
const router = useRouter()

function handleCreateProfile() {
  if (status.value === 'authenticated') {
    router.push('/profil')
  } else {
    signIn('github')
  }
}

const { data: statsData } = await useFetch('/api/stats')

function pluralize(count: number, singular: string, plural: string) {
  return count <= 1 ? singular : plural
}

const stats = computed(() => {
  const devs = statsData.value?.developers || 0
  const companies = statsData.value?.companies || 0
  const locations = statsData.value?.locations || 0
  const speakers = statsData.value?.speakers || 0

  return [
    { value: devs, label: pluralize(devs, 'Développeuse', 'Développeuses') },
    { value: companies, label: pluralize(companies, 'Entreprise', 'Entreprises') },
    { value: locations, label: pluralize(locations, 'Ville', 'Villes') },
    { value: speakers, label: pluralize(speakers, 'Speakeuse', 'Speakeuses') }
  ]
})

const openToTags = [
  'Conférence',
  'Mentoring',
  'Freelance',
  'CDI',
  'Coffee chat',
  'Pair programming',
  'Relecture CV'
]

const features = [
  {
    number: '01',
    title: 'Speakeuses',
    description: 'Trouvez des speakeuses pour vos événements tech. Filtrez par sujet, disponibilité et localisation.'
  },
  {
    number: '02',
    title: 'Disponible pour...',
    description: 'Chaque profil indique ses disponibilités : conférence, mentoring, freelance, CDI, coffee chat, pair programming, relecture CV.'
  },
  {
    number: '03',
    title: 'Certifiée Inclusive',
    description: 'Les entreprises avec 5+ avis positifs obtiennent le badge "Certifiée Inclusive". Transparence totale.'
  }
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-content">
        <div class="hero-label">
          <span class="label-line"></span>
          <span>Annuaire</span>
        </div>

        <h1 class="hero-title">
          <span class="title-line">
            <span class="word">Où</span>
            <span class="word">sont</span>
            <span class="word">les</span>
          </span>
          <span class="title-line highlight">
            <span class="word">développeuses</span>
          </span>
        </h1>

        <p class="hero-subtitle">
          L'annuaire qui référence les développeuses en France.
          Trouvez des profils, des speakeuses, des mentors.
        </p>

        <div class="hero-actions">
          <button class="btn-main" @click="handleCreateProfile">
            <span>Créer mon profil</span>
            <span class="btn-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
          <NuxtLink to="/annuaire" class="btn-secondary">Explorer l'annuaire</NuxtLink>
        </div>
      </div>

      <div class="hero-scroll">
        <span class="scroll-text">Scroll</span>
        <span class="scroll-line"></span>
      </div>
    </section>

    <div class="tags-preview">
      <div class="tags-track">
        <span v-for="(tag, i) in [...openToTags, ...openToTags]" :key="i" class="tag-pill">
          {{ tag }}
        </span>
      </div>
    </div>

    <section class="stats">
      <div class="stats-grid">
        <div v-for="(stat, index) in stats" :key="stat.label" class="stat-item">
          <span class="stat-index">0{{ index + 1 }}</span>
          <div class="stat-content">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="features-header">
        <span class="section-label">Fonctionnalités</span>
        <h2 class="section-title">Plus qu'un<br/>annuaire</h2>
      </div>

      <div class="features-list">
        <div v-for="feature in features" :key="feature.title" class="feature-item">
          <span class="feature-number">{{ feature.number }}</span>
          <div class="feature-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
          <div class="feature-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <section class="badge-section">
      <div class="badge-content">
        <div class="badge-visual">
          <div class="badge-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span class="badge-label">Certifiée Inclusive</span>
        </div>
        <div class="badge-text">
          <h3 class="badge-title">Entreprises certifiées</h3>
          <p class="badge-description">
            Les entreprises avec au moins 5 avis et une note moyenne de 4/5
            obtiennent le badge Certifiée Inclusive. Basé sur les retours
            anonymes de la communauté.
          </p>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="cta-content">
        <span class="cta-label">Rejoindre</span>
        <h2 class="cta-title">
          Ajoutez votre profil<br/>à l'annuaire
        </h2>
        <p class="cta-text">
          Indiquez vos technos, votre localisation et ce pour quoi vous êtes disponible.
        </p>
        <button class="btn-cta" @click="handleCreateProfile">
          <span>Commencer</span>
          <span class="btn-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1600px;
  margin: 0 auto;
}

/* Hero */
.hero {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 4rem 2rem;
  position: relative;
}

.hero-content {
  max-width: 1000px;
}

.hero-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.label-line {
  width: 40px;
  height: 1px;
  background: var(--text-muted);
}

.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(3.5rem, 10vw, 8rem);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin-bottom: 2rem;
}

.title-line {
  display: block;
  overflow: hidden;
}

.title-line .word {
  display: inline-block;
  margin-right: 0.2em;
}

.title-line.highlight {
  color: transparent;
  -webkit-text-stroke: 1px var(--text);
  transition: all 0.4s ease;
}

.title-line.highlight:hover {
  color: var(--text);
  -webkit-text-stroke: 0;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-muted);
  max-width: 450px;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.btn-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-main:hover {
  gap: 1.5rem;
  padding-right: 1.25rem;
}

.btn-arrow {
  display: flex;
  transition: transform 0.3s ease;
}

.btn-main:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-secondary {
  padding: 1rem 0;
  background: none;
  border: none;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  font-family: inherit;
}

.btn-secondary::after {
  content: '';
  position: absolute;
  bottom: 0.75rem;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--text);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.btn-secondary:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.hero-scroll {
  position: absolute;
  bottom: 2rem;
  right: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.scroll-text {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-muted);
  writing-mode: vertical-rl;
}

.scroll-line {
  width: 1px;
  height: 60px;
  background: var(--text-muted);
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; height: 60px; }
  50% { opacity: 1; height: 80px; }
}

/* Tags Preview */
.tags-preview {
  padding: 1.5rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.tags-track {
  display: flex;
  gap: 1rem;
  width: max-content;
  animation: tagsScroll 25s linear infinite;
}

.tag-pill {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.tag-pill:hover {
  border-color: var(--text);
  color: var(--text);
}

@keyframes tagsScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Stats */
.stats {
  padding: 6rem 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0;
  border-top: 1px solid var(--border);
}

.stat-index {
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Features */
.features {
  padding: 6rem 4rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
}

.features-header {
  position: sticky;
  top: 120px;
  height: fit-content;
}

.section-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.features-list {
  display: flex;
  flex-direction: column;
}

.feature-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  gap: 2rem;
  padding: 3rem 0;
  border-top: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-item:last-child {
  border-bottom: 1px solid var(--border);
}

.feature-item:hover {
  padding-left: 1rem;
}

.feature-number {
  font-family: 'Space Grotesk', monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}

.feature-item:hover .feature-title {
  color: var(--text);
}

.feature-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.7;
  max-width: 400px;
}

.feature-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: var(--text-muted);
}

.feature-item:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Badge Section */
.badge-section {
  padding: 6rem 4rem;
  border-top: 1px solid var(--border);
}

.badge-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.badge-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  border: 1px solid var(--border);
  border-radius: 16px;
}

.badge-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text);
}

.badge-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.badge-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badge-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.badge-description {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.8;
}

/* CTA */
.cta {
  padding: 8rem 4rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border);
}

.cta-content {
  max-width: 600px;
  text-align: center;
}

.cta-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.cta-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
}

.cta-text {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 2rem;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-cta:hover {
  background: var(--text-muted);
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .features {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .features-header {
    position: static;
  }

  .badge-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .badge-visual {
    max-width: 300px;
    margin: 0 auto;
  }

  .badge-text {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1.5rem 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-scroll {
    display: none;
  }

  .stats {
    padding: 4rem 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 2.5rem;
  }

  .features {
    padding: 4rem 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .feature-item {
    grid-template-columns: 50px 1fr 40px;
    gap: 1rem;
    padding: 2rem 0;
  }

  .feature-title {
    font-size: 1.25rem;
  }

  .badge-section {
    padding: 4rem 1.5rem;
  }

  .badge-title {
    font-size: 1.5rem;
  }

  .cta {
    padding: 4rem 1.5rem;
  }

  .cta-title {
    font-size: 1.75rem;
  }
}
</style>
