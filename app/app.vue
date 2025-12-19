<script setup>
const { data, status, signIn, signOut } = useAuth()
</script>

<template>
  <div class="app">
    <div class="gradient-bg"></div>

    <header class="header">
      <div class="header-content">
        <NuxtLink to="/" class="logo">
          <span class="logo-mark">
            <span class="mark-line"></span>
            <span class="mark-line"></span>
            <span class="mark-line"></span>
          </span>
          <span class="logo-text">OSLD</span>
        </NuxtLink>

        <nav class="nav">
          <NuxtLink to="/annuaire" class="nav-link">Annuaire</NuxtLink>
          <NuxtLink to="/speakers" class="nav-link">Speakeuses</NuxtLink>
          <NuxtLink to="/entreprises" class="nav-link">Entreprises</NuxtLink>
        </nav>

        <div class="auth" :class="{ 'auth-loading': status === 'loading' }">
          <template v-if="status === 'loading'">
            <div class="auth-placeholder"></div>
          </template>
          <template v-else-if="status !== 'authenticated'">
            <button @click="signIn('github')" class="btn btn-primary">
              <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connexion GitHub
            </button>
          </template>
          <template v-else>
            <div class="user-menu">
              <NuxtLink to="/profil" class="user-link">
                <img :src="data?.user?.image" :alt="data?.user?.name" class="avatar" />
                <span class="user-name">{{ data?.user?.name }}</span>
              </NuxtLink>
              <button @click="signOut()" class="btn btn-ghost">Déconnexion</button>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>

    <footer class="footer">
      <p>Fait pour la communauté tech</p>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');

:root {
  --primary: #8b5cf6;
  --primary-dark: #7c3aed;
  --secondary: #06b6d4;
  --accent: #22d3ee;
  --bg: #0a0a0f;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: rgba(255, 255, 255, 0.1);
  --radius: 16px;
  --radius-sm: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.gradient-bg {
  display: none;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  backdrop-filter: blur(20px);
  background: rgba(10, 10, 15, 0.8);
  border-bottom: 1px solid var(--border);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text);
}

.logo-mark {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 18px;
}

.mark-line {
  height: 2px;
  background: var(--text);
  border-radius: 1px;
  transition: all 0.3s ease;
}

.mark-line:nth-child(1) { width: 100%; }
.mark-line:nth-child(2) { width: 70%; }
.mark-line:nth-child(3) { width: 40%; }

.logo:hover .mark-line:nth-child(1) { width: 40%; }
.logo:hover .mark-line:nth-child(2) { width: 100%; }
.logo:hover .mark-line:nth-child(3) { width: 70%; }

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text);
}

.auth {
  display: flex;
  align-items: center;
  min-width: 180px;
  justify-content: flex-end;
}

.auth-placeholder {
  width: 140px;
  height: 38px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  opacity: 0.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: var(--text);
  color: var(--bg);
}

.btn-primary:hover {
  background: var(--text-muted);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  background: var(--bg-card);
  color: var(--text);
}

.github-icon {
  width: 18px;
  height: 18px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--primary);
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

main {
  flex: 1;
  position: relative;
  z-index: 1;
  padding-top: 80px;
}

.footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .nav {
    display: none;
  }

  .logo-text {
    font-size: 1rem;
  }

  .user-name {
    display: none;
  }
}
</style>
