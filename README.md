<div align="center">

# OSLD - Ou Sont Les Developpeuses ?

**The platform that makes women developers visible in France.**

[![Site](https://img.shields.io/badge/Site-ousontlesdeveloppeuses.fr-8B5CF6?style=for-the-badge)](https://ousontlesdeveloppeuses.fr)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Contribute](https://img.shields.io/badge/Contribute-Welcome-orange?style=for-the-badge)](CONTRIBUTING.md)

</div>

---

## Why OSLD?

Women developers are here. They code, they innovate, they inspire. But they often remain invisible.

**OSLD** changes that. A community platform to:
- Build visibility and grow your network
- Find speakers for your tech events
- Identify truly inclusive companies
- Help each other (QG / member area)

---

## Features

| Feature | Description |
|---|---|
| **Directory** | Developer profiles with skills, location and availability |
| **Speakers** | Speaker bureau for conferences and meetups |
| **Companies** | Community reviews and ratings on company inclusivity |
| **QG** | Member area: mutual help, side projects, help requests |
| **Side Projects** | Share your project and find contributors |
| **Profile Quiz** | Discover your developer profile with an interactive quiz |

---

## Tech Stack

```
Frontend     →  Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS
Backend      →  Nitro (Nuxt Server)
Database     →  NuxtHub (Cloudflare D1) + Drizzle ORM
Auth         →  GitHub OAuth via @sidebase/nuxt-auth
Deployment   →  Netlify
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- [NuxtHub](https://hub.nuxt.com) account (free)
- [GitHub OAuth App](https://github.com/settings/developers)

### Installation

```bash
# Clone the repo
git clone https://github.com/Kamsou/ousontlesdevs.git
cd ousontlesdevs

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Fill in the variables in `.env`:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Session secret (generate with `openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `NUXT_PUBLIC_AUTH_BASE_URL` | `http://localhost:3000` for local dev |

### Database

NuxtHub automatically creates a local SQLite database. **You do not have access to the production database.**

This means:
- The database starts empty (no profiles, no projects)
- Migrations are applied automatically on first `npm run dev`
- You need to create your own test data

```bash
# Start the server
npm run dev
```

The app runs on **http://localhost:3000**

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npx drizzle-kit generate` | Generate Drizzle migrations |
| `npx drizzle-kit studio` | Visual interface for local DB |

---

## Project Structure

```
ousontlesdevs/
├── app/
│   ├── pages/           # Pages (directory, speakers, companies, qg)
│   ├── components/      # Vue components
│   ├── composables/     # Reusable logic (useTechInput, etc.)
│   └── utils/           # Constants and helpers (sideProjectStatus, etc.)
├── server/
│   ├── api/             # REST endpoints
│   │   ├── developers/  # Profile CRUD
│   │   ├── companies/   # Company CRUD
│   │   ├── speakers/    # Speakers list
│   │   ├── side-projects/ # Side projects CRUD
│   │   ├── help-requests/ # Help requests
│   │   └── qg/          # QG activity
│   ├── db/
│   │   ├── schema.ts    # Drizzle schema (tables)
│   │   └── migrations/  # SQL migrations
│   └── utils/           # Helpers (db, validation)
├── nuxt.config.ts       # Nuxt config
└── drizzle.config.ts    # Drizzle config
```

---

## Contributing

Contributions are welcome!

1. Fork the project
2. Create your branch (`git checkout -b feature/my-feature`)
3. Commit (`git commit -m 'feat: add my feature'`)
4. Push (`git push origin feature/my-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## Community

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
By participating, you commit to creating a welcoming and inclusive space.

---

<div align="center">

**Made for all women developers by [Camille Coutens](https://linkedin.com/in/camillecoutens)**

MIT License

</div>
