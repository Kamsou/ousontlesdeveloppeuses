<div align="center">

# OSLD - Où Sont Les Développeuses ?

**La plateforme qui rend visibles les développeuses en France.**

[![Site](https://img.shields.io/badge/Site-ousontlesdeveloppeuses.fr-8B5CF6?style=for-the-badge)](https://ousontlesdeveloppeuses.fr)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Contribuer](https://img.shields.io/badge/Contribuer-Welcome-orange?style=for-the-badge)](CONTRIBUTING.md)

</div>

---

## Pourquoi OSLD ?

Les développeuses sont là. Elles codent, elles innovent, elles inspirent. Mais elles restent souvent invisibles.

**OSLD** change ça. Une plateforme communautaire pour :
- Se faire connaître et développer sa visibilité
- Trouver des speakeuses pour vos événements tech
- Identifier les entreprises vraiment inclusives

---

## Fonctionnalités

| | Fonctionnalité | Description |
|---|---|---|
| 👩‍💻 | **Annuaire** | Profils de développeuses avec compétences, localisation et disponibilités |
| 🎤 | **Speakeuses** | Bureau des intervenantes pour vos conférences et meetups |
| 🏢 | **Entreprises** | Avis et notes sur l'inclusivité des entreprises par la communauté |
| ✨ | **Ton Profil dev** | Quiz interactif pour créer ton profil développeuse |

---

## Stack technique

```
Frontend     →  Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS
Backend      →  Nitro (Nuxt Server)
Database     →  NuxtHub (Cloudflare D1) + Drizzle ORM
Auth         →  GitHub OAuth via @sidebase/nuxt-auth
Déploiement  →  Netlify
```

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- Compte [NuxtHub](https://hub.nuxt.com) (gratuit)
- [GitHub OAuth App](https://github.com/settings/developers)

### Installation

```bash
# Clone le repo
git clone https://github.com/Kamsou/ousontlesdevs.git
cd ousontlesdevs

# Installe les dépendances
npm install

# Configure l'environnement
cp .env.example .env
```

Remplis les variables dans `.env` :

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Secret pour les sessions (génère avec `openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | Client ID de ton OAuth App GitHub |
| `GITHUB_CLIENT_SECRET` | Client Secret de ton OAuth App GitHub |
| `NUXT_PUBLIC_AUTH_BASE_URL` | `http://localhost:3000` en local |

> **Note** : En local, NuxtHub utilise une base SQLite locale. En production, la base D1 est gérée automatiquement.

```bash
# Lance le serveur
npm run dev
```

L'app tourne sur **http://localhost:3000**

---

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npx drizzle-kit generate` | Génère les migrations Drizzle |

> **Note** : Les migrations sont appliquées automatiquement à chaque déploiement Netlify.

---

## Structure du projet

```
ousontlesdevs/
├── app/
│   ├── pages/           # Pages (annuaire, speakers, entreprises, profil)
│   ├── utils/           # Constantes partagées (openToOptions)
│   └── app.vue          # Layout principal
├── server/
│   ├── api/             # Endpoints REST
│   ├── db/
│   │   ├── schema.ts    # Schéma Drizzle
│   │   └── migrations/  # Migrations SQL
│   └── utils/           # Helpers (db, parseTopics)
├── public/              # Assets statiques
├── nuxt.config.ts       # Config Nuxt
└── drizzle.config.ts    # Config Drizzle
```

---

## Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Crée ta branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'feat: ajoute ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvre une Pull Request

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

---

## Communauté

Ce projet suit le [Contributor Covenant](CODE_OF_CONDUCT.md).
En participant, tu t'engages à créer un espace bienveillant et inclusif.

---

<div align="center">

**Fait pour toutes les développeuses par [Camille Coutens](https://linkedin.com/in/camillecoutens)**

MIT License

</div>
