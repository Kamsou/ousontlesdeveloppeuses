<div align="center">

<br />

# Ou Sont Les Developpeuses ?

The platform that makes women developers visible in France.

<br />

[![Site](https://img.shields.io/badge/ousontlesdeveloppeuses.fr-3B82F6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://ousontlesdeveloppeuses.fr)
[![License](https://img.shields.io/badge/MIT-green?style=for-the-badge&label=license)](LICENSE)
[![Contribute](https://img.shields.io/badge/welcome-orange?style=for-the-badge&label=contributions)](CONTRIBUTING.md)

</div>

<br />

## The problem

Women developers are here. They code, they innovate, they inspire. But they often remain invisible: missing from conference lineups, overlooked in expert lists, underrepresented in tech communities.

**OSLD** changes that.

<br />

## What OSLD does

**Directory** Developer profiles with skills, location and availability. Find the right person for your project or event.

**Speakers** A speaker bureau for conferences and meetups. No more excuses for all-male panels.

**Companies** Community reviews on real company inclusivity. Ratings and feedback from the women who work there.

**QG** The member area. Mutual help, side projects, help requests, job offers. A safe space for women developers to collaborate.

**Side Projects** Share your projects, find contributors, build together.

**Profile Quiz** Discover your developer profile with an AI-powered interactive quiz.

<br />

## Tech stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS |
| **Backend** | Nitro (Nuxt Server) |
| **Database** | NuxtHub (Cloudflare D1) · Drizzle ORM |
| **Auth** | GitHub OAuth · @sidebase/nuxt-auth |
| **Analytics** | PostHog |
| **Emails** | Resend |
| **AI** | Anthropic (profile quiz) |
| **Deployment** | Netlify |

<br />

## Quick start

### Prerequisites

- Node.js 20+
- [NuxtHub](https://hub.nuxt.com) account (free)
- [GitHub OAuth App](https://github.com/settings/developers)

### Installation

```bash
git clone https://github.com/Kamsou/ousontlesdevs.git
cd ousontlesdevs
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Session secret (`openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `NUXT_PUBLIC_AUTH_BASE_URL` | `http://localhost:3000` for local dev |

### Database

NuxtHub automatically creates a local SQLite database. You do not have access to the production database.

- The database starts empty
- Migrations are applied on first `npm run dev`
- Create your own test data

### Run the project

```bash
npm run dev
```

The app runs on **http://localhost:3000**

<br />

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npx drizzle-kit generate` | Generate Drizzle migrations |
| `npx drizzle-kit studio` | Visual interface for local DB |

<br />

## Project structure

```
app/
├── pages/                # Pages (file-based routing)
│   ├── index.vue         # Homepage
│   ├── annuaire/         # Developer directory
│   ├── speakers/         # Speakers list
│   ├── entreprises/      # Companies & reviews
│   ├── qg/               # Member area (QG)
│   │   ├── requests/     # Help requests
│   │   └── projects/     # Side projects
│   ├── profil/           # User profile
│   └── experience/       # Developer quiz
├── components/           # Vue components
│   └── qg/               # QG components
├── composables/          # Reusable logic
└── utils/                # Constants and helpers

server/
├── api/                  # REST endpoints
│   ├── developers/       # Profile CRUD
│   ├── companies/        # Company CRUD + reviews
│   ├── speakers/         # Speakers list
│   ├── help-requests/    # Help requests
│   ├── side-projects/    # Side projects
│   ├── offers/           # Job offers
│   ├── comments/         # Comments
│   ├── contact/          # Contact requests
│   ├── qg/               # QG activity
│   └── admin/            # Administration
├── db/
│   ├── schema.ts         # Drizzle schema (15 tables)
│   └── migrations/       # SQL migrations
└── utils/                # Helpers (db, validation, slugs)
```

<br />

## Contributing

Contributions are welcome. This project is built for and by the community.

1. Fork the project
2. Create your branch (`git checkout -b feature/my-feature`)
3. Commit (`git commit -m 'feat: add my feature'`)
4. Push (`git push origin feature/my-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details and project conventions.

<br />

## Community

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you commit to creating a welcoming and inclusive space.

<br />

---

<div align="center">

Made for all women developers by [Camille Coutens](https://linkedin.com/in/camillecoutens)

MIT License

</div>
