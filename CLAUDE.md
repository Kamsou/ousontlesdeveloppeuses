# CLAUDE.md

Ce fichier guide Claude Code pour travailler sur ce projet.

## Vue d'ensemble

**OSLD - Où Sont Les Développeuses** : Annuaire des développeuses en France.
Nuxt 4 + TypeScript, déployé sur Netlify avec NuxtHub (SQLite/D1).

## Architecture

```
app/
├── pages/               → Pages (file-based routing)
│   ├── index.vue       → Homepage
│   ├── annuaire/       → Annuaire développeuses
│   ├── speakers/       → Liste speakeuses
│   ├── entreprises/    → Entreprises certifiées
│   ├── profil/         → Profil utilisateur (auth required)
│   └── experience/     → Quiz "Quel dev es-tu?"
├── app.vue             → Layout principal
server/
├── api/                → API routes (Nitro)
│   ├── auth/[...].ts   → Auth.js (GitHub OAuth)
│   ├── developers/     → CRUD développeuses
│   ├── companies/      → CRUD entreprises + reviews
│   ├── speakers/       → Liste speakeuses
│   ├── experience/     → Quiz AI (Anthropic)
│   └── stats.get.ts    → Stats homepage
├── db/
│   ├── schema.ts       → Drizzle schema
│   └── migrations/     → SQL migrations
└── utils/
    └── drizzle.ts      → DB helper
```

## Commandes

```bash
npm run dev              # Dev server
npm run build            # Build production (Netlify)
npx drizzle-kit generate # Générer migrations
npx nuxthub database migrations list   # Voir migrations
npx nuxthub database migrations apply  # Appliquer en prod
```

## Stack technique

- **Nuxt 4** - Vue 3 + Nitro, compatibilityVersion 4
- **TypeScript** - Strict mode
- **Drizzle ORM** - SQLite (NuxtHub D1 en prod)
- **Auth.js** - GitHub OAuth via @sidebase/nuxt-auth
- **TailwindCSS** - Styling
- **@nuxtjs/seo** - SEO, schemaOrg, robots
- **@nuxtjs/google-fonts** - Inter + Space Grotesk
- **Anthropic SDK** - Quiz AI

## Base de données (Drizzle)

### Tables principales

```typescript
developers        // Profils développeuses
developerSkills   // Skills (many-to-many)
developerOpenTo   // Disponibilités (conference, mentoring, freelance, cdi, etc.)
speakerProfiles   // Infos speaker (topics, travel, remote)
companies         // Entreprises
companyReviews    // Avis sur entreprises
```

### Pattern API

```typescript
// server/api/[resource]/index.get.ts
export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  return db.query.developers.findMany({
    with: { skills: true, openTo: true }
  })
})

// server/api/[resource]/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = useDrizzle()
  return db.query.developers.findFirst({
    where: eq(tables.developers.id, Number(id)),
    with: { skills: true }
  })
})
```

## Patterns Nuxt

### Data fetching

```typescript
// SSR bloquant
const { data } = await useFetch('/api/developers')

// Client-side non-bloquant (avec loader)
const { data, status } = useLazyFetch('/api/stats')
const isLoading = computed(() => status.value === 'pending')
```

### Authentification

```typescript
const { status, data: session, signIn, signOut } = useAuth()

// Vérifier si connecté
if (status.value === 'authenticated') {
  // session.value.user contient les infos
}

// Login GitHub
signIn('github')
```

### SEO par page

```typescript
useSeoMeta({
  title: 'Page Title',
  description: 'Description',
  ogTitle: 'OG Title',
  ogDescription: 'OG Description',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
})
```

## Conventions de code

### Pages Vue

```vue
<script setup lang="ts">
// 1. Auth
const { status, signIn } = useAuth()

// 2. Data fetching
const { data } = await useFetch('/api/resource')

// 3. State local
const isOpen = ref(false)

// 4. Computed
const filtered = computed(() => data.value?.filter(...))

// 5. Methods
function handleAction() { }
</script>

<template>
  <!-- TailwindCSS classes -->
</template>
```

### API Routes

```typescript
// Toujours utiliser defineEventHandler
export default defineEventHandler(async (event) => {
  // Récupérer params
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const query = getQuery(event)

  // DB
  const db = useDrizzle()

  // Auth (si nécessaire)
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusCode: 401 })
  }

  return { success: true }
})
```

## Performance

### Prerendering (SSG)

Pages statiques configurées dans `nuxt.config.ts`:
```typescript
routeRules: {
  '/': { prerender: true },
  '/experience': { prerender: true },
}
```

### Hydration mismatches

Pour les données dynamiques sur pages prérendues, utiliser `<ClientOnly>`:
```vue
<ClientOnly>
  <span>{{ dynamicValue }}</span>
  <template #fallback>
    <span class="animate-pulse">...</span>
  </template>
</ClientOnly>
```

### Lazy loading

```typescript
// Non-bloquant pour données non-critiques
const { data, status } = useLazyFetch('/api/stats')
```

## Design system

### Couleurs (TailwindCSS)

```
bg         → Fond principal (#0a0a0f)
text       → Texte principal (#f8fafc)
text-muted → Texte secondaire (#94a3b8)
border     → Bordures (#1e293b)
primary    → Accent (#a78bfa)
```

### Fonts

- **Space Grotesk** → Titres (`font-display`)
- **Inter** → Corps de texte

### Composants récurrents

```html
<!-- Bouton principal -->
<button class="px-6 py-4 bg-text text-bg rounded-full font-medium">

<!-- Bouton secondaire -->
<button class="px-6 py-4 border border-border rounded-full hover:border-text">

<!-- Card -->
<div class="p-6 border border-border rounded-2xl">

<!-- Tag -->
<span class="px-3 py-1 border border-border rounded-full text-sm">
```

## Accessibilité

Module `@nuxt/a11y` activé. Règles critiques :
- Liens dans du texte : toujours `underline` pour les distinguer
- Contraste minimum 3:1 pour les liens
- Alt text sur les images

## Déploiement

- **Hébergement** : Netlify (preset nitro)
- **Base de données** : NuxtHub (Cloudflare D1)
- **Auth** : Variables d'env `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH_SECRET`

### Fix connu : unhead

Si erreur 500 avec schemaOrg sur Netlify :
```typescript
nitro: {
  externals: {
    inline: ['unhead'],
  },
}
```
