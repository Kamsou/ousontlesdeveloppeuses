# CLAUDE.md

Project guide for Claude Code.

## Overview

**OSLD - Où Sont Les Développeuses**: Directory of women developers in France.
Nuxt 4 + TypeScript, deployed on Netlify with Turso (libSQL).

## Architecture

```
app/
├── pages/               → Pages (file-based routing)
│   ├── index.vue       → Homepage
│   ├── annuaire/       → Developer directory (public)
│   ├── speakers/       → Speakers list (public)
│   ├── entreprises/    → Companies + reviews (public)
│   ├── programmes.vue  → Programs & communities (public)
│   ├── podcasts.vue    → Podcasts (public)
│   ├── experience/     → Quiz "Quel dev es-tu?" (public)
│   ├── qg/             → Private dashboard (auth required)
│   │   ├── index.vue   → QG hub (tabs: entraide, offres, profil)
│   │   ├── ask.vue     → Create help request
│   │   ├── new-offer.vue → Create offer
│   │   ├── new-project.vue → Create side project
│   │   ├── requests/   → Help request detail + edit
│   │   └── projects/   → Side project detail + edit
│   ├── profil/         → Auth redirect (animated loading → QG)
│   ├── feedback/       → Contact feedback (token-based)
│   ├── admin/          → Admin dashboard
│   ├── legal.vue       → Legal notices
│   └── coc.vue         → Code of conduct
├── components/
│   └── qg/             → QG components (Feed, Comments, ProfileForm,
│                          RequestsList, OffersList, SideProjectsList, etc.)
├── app.vue             → Main layout (public header/footer + QG routing)
server/
├── api/                → API routes (Nitro)
│   ├── auth/[...].ts   → Auth.js (GitHub OAuth)
│   ├── developers/     → CRUD developers
│   ├── companies/      → CRUD companies + reviews
│   ├── speakers/       → Speakers list
│   ├── help-requests/  → Help requests + matches + comments
│   ├── side-projects/  → Side projects CRUD
│   ├── offers/         → Job offers CRUD
│   ├── comments/       → Comments + mark-read
│   ├── qg/             → QG activity feed
│   ├── contact/        → Contact requests + email (Resend)
│   ├── experience/     → AI quiz (Anthropic)
│   ├── programs/       → Programs list
│   ├── podcasts/       → Podcasts list
│   ├── admin/          → Admin endpoints
│   └── stats.get.ts    → Homepage stats
├── db/
│   ├── schema.ts       → Drizzle schema
│   └── migrations/     → SQL migrations
└── utils/
    └── drizzle.ts      → DB helper
```

## Commands

```bash
npm run dev              # Dev server
npm run build            # Production build (Netlify)
npx drizzle-kit generate # Generate migrations
```

### Database migrations (production)

La base de prod est sur **Turso** (SQLite managé). Utiliser le CLI Turso :

```bash
# Installer Turso CLI (macOS)
brew install tursodatabase/tap/turso

# Se connecter
turso auth login

# Lister les bases
turso db list

# Ouvrir un shell SQL sur la base
turso db shell NOM_DE_LA_BASE

# Ou exécuter directement une requête
turso db shell NOM_DE_LA_BASE "ALTER TABLE developers ADD column_name TYPE;"
```

## Tech stack

- **Nuxt 4** - Vue 3 + Nitro, compatibilityVersion 4
- **TypeScript** - Strict mode
- **Drizzle ORM** - SQLite local, Turso (libSQL) en prod
- **Auth.js** - GitHub OAuth via @sidebase/nuxt-auth
- **TailwindCSS** - Styling
- **@nuxtjs/seo** - SEO, schemaOrg, robots, sitemap, ogImage
- **PostHog** - Analytics (nuxt-posthog)
- **Resend** - Transactional emails (contact requests, feedback)
- **Anthropic SDK** - AI quiz

## Database (Drizzle)

### Main tables

```typescript
developers        // Developer profiles (slug, bio, location, skills, profileType)
developerSkills   // Skills (many-to-many)
developerOpenTo   // Availability (conference, mentoring, freelance, cdi, etc.)
speakerProfiles   // Speaker info (topics, travel, remote)
companies         // Companies
companyReviews    // Company reviews
helpRequests      // QG help requests (bug, review, advice, pair)
helpRequestTechs  // Techs per help request
offers            // Job offers (alternance, stage, cdi, freelance)
sideProjects      // Side projects (idea, open_to_contributors, completed)
sideProjectTechs  // Techs per side project
comments          // Comments on help requests & side projects
commentReads      // Read tracking per user per comment
contactRequests   // Contact messages between developers
contactFeedbacks  // Feedback on contact exchanges
programs          // External programs & communities
podcasts          // Podcast episodes
```

### API pattern

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

## Nuxt patterns

### Data fetching

```typescript
// SSR blocking
const { data } = await useFetch('/api/developers')

// Client-side non-blocking (with loader)
const { data, status } = useLazyFetch('/api/stats')
const isLoading = computed(() => status.value === 'pending')
```

### Authentication

```typescript
const { status, data: session, signIn, signOut } = useAuth()

// Check if authenticated
if (status.value === 'authenticated') {
  // session.value.user contains user info
}

// GitHub login
signIn('github')
```

### Per-page SEO

```typescript
useSeoMeta({
  title: 'Page Title',
  description: 'Description',
  ogTitle: 'OG Title',
  ogDescription: 'OG Description',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
})
```

## Code conventions

### Vue `<script setup>` order

Always follow this order in `<script setup>`. Do not add section comments.

```vue
<script setup lang="ts">
// 1. Imports
import { openToOptions } from '~/utils/constants'

// 2. Props & emits
const props = defineProps<{ ... }>()
const emit = defineEmits<{ ... }>()

// 3. Composables (auth, router, etc.)
const { status, signIn } = useAuth()
const toast = useToast()

// 4. Data fetching
const { data } = await useFetch('/api/resource')

// 5. Local state (refs)
const isOpen = ref(false)

// 6. Computed
const filtered = computed(() => data.value?.filter(...))

// 7. Methods
function handleAction() { }

// 8. Watch

// 9. Lifecycle hooks
onMounted(() => { })
</script>

<template>
  <!-- TailwindCSS classes -->
</template>
```

When data fetching depends on computed/state (e.g. `useLazyFetch` with reactive query params), place the dependency before the fetch call.

### API routes

```typescript
// Always use defineEventHandler
export default defineEventHandler(async (event) => {
  // Get params
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const query = getQuery(event)

  // DB
  const db = useDrizzle()

  // Auth (if needed)
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusCode: 401 })
  }

  return { success: true }
})
```

## Performance

### Prerendering (SSG)

Static pages configured in `nuxt.config.ts`:
```typescript
routeRules: {
  '/': { prerender: true },
  '/experience': { prerender: true },
  '/programmes': { prerender: true },
  '/podcasts': { prerender: true },
  '/speakers': { prerender: true },
}
```

### Hydration mismatches

For dynamic data on prerendered pages, use `<ClientOnly>`:
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
// Non-blocking for non-critical data
const { data, status } = useLazyFetch('/api/stats')
```

## Design system

### Colors (TailwindCSS)

```
background       → Main background (#0a0a0f)
foreground       → Primary text (#f8fafc)
foreground-muted → Secondary text (#94a3b8)
border           → Borders (rgba 10%)
primary          → Accent blue (#3B82F6) - QG only, not on public pages
```

### Color rules

- **Public pages** (homepage, annuaire, speakers, entreprises, programmes, podcasts, legal, coc): neutral colors only (`foreground`, `foreground-muted`, `border`). No `primary`/blue.
- **QG (private)**: blue accent (`primary`) for tabs, CTAs, card hovers, header.

### Fonts

- **Space Grotesk** → Headings (`font-display`)
- **Satoshi** → Body text

### Button patterns

```html
<!-- Primary button (physical shelf effect) -->
<button class="px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">

<!-- Secondary button -->
<button class="px-6 py-4 border border-border rounded-full hover:border-foreground">

<!-- Card -->
<div class="p-6 border border-border rounded-2xl">

<!-- Tag -->
<span class="px-3 py-1 border border-border rounded-full text-sm">
```

## Accessibility

Module `@nuxt/a11y` enabled. Critical rules:
- Links in text: always `underline` to distinguish them
- Minimum 3:1 contrast for links
- Alt text on images

## Deployment

- **Hosting**: Netlify (nitro preset)
- **Database**: Turso (libSQL) - env vars `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- **Auth**: Env vars `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH_SECRET`

### Known fix: unhead

If 500 error with schemaOrg on Netlify:
```typescript
nitro: {
  externals: {
    inline: ['unhead'],
  },
}
```
