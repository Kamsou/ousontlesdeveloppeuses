# Contributing to OSLD

Thanks for wanting to contribute to OSLD! This project is made for and by the community of women developers.

## Before You Start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md)
- Check [open issues](https://github.com/Kamsou/ousontlesdevs/issues) to see what's in progress
- Issues labeled `good first issue` are perfect for getting started

## Local Setup

### Prerequisites

- Node.js 20+
- A [NuxtHub](https://hub.nuxt.com) account (free)
- A [GitHub OAuth App](https://github.com/settings/developers)

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/ousontlesdevs.git
cd ousontlesdevs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in the variables in `.env`:

**GitHub OAuth**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create an OAuth App
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and Client Secret

**AUTH_SECRET**
```bash
# Generate a random secret
openssl rand -base64 32
```

> **Note**: In local development, NuxtHub uses a local SQLite database. No additional database setup required.

### 4. Start the Server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000)

## Contribution Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-fix
```

### 2. Make Your Changes

- Follow the existing code style
- Add TypeScript types if necessary
- Test your changes locally

### 3. Commit

```bash
git add .
git commit -m "feat: description of the feature"
```

**Commit conventions:**
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `style:` formatting, no code change
- `refactor:` code refactoring

### 4. Push and Pull Request

```bash
git push origin feature/my-new-feature
```

Then open a Pull Request on GitHub.

## Code Structure

```
app/pages/       # Vue pages
server/api/      # API endpoints
server/db/       # Drizzle schema and migrations
```

## Questions?

Open an [issue](https://github.com/Kamsou/ousontlesdevs/issues) or contact us!
