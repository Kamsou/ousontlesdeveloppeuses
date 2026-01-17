<script setup lang="ts">
useSeoMeta({
  title: 'Mentions légales - OSLD',
  description: 'Mentions légales du site OSLD - Où Sont Les Développeuses.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <header class="mb-16">
      <span class="text-xs uppercase tracking-[0.2em] text-foreground-muted mb-4 block">Informations</span>
      <h1 class="font-display text-4xl md:text-5xl font-medium tracking-tight mb-6">Mentions légales</h1>
    </header>

    <div class="prose prose-invert max-w-none space-y-12">
      <section>
        <h2 class="font-display text-2xl font-medium mb-6">Éditeur du site</h2>
        <p class="text-foreground-muted leading-relaxed">
          Le site <strong class="text-foreground">ousontlesdeveloppeuses.fr</strong> est édité par :
        </p>
        <ul class="mt-4 space-y-2 text-foreground-muted">
          <li>Camille Coutens</li>
          <li>Email : <a href="mailto:contact@ousontlesdeveloppeuses.fr" class="text-foreground underline hover:text-primary">contact@ousontlesdeveloppeuses.fr</a></li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-2xl font-medium mb-6">Hébergement</h2>
        <p class="text-foreground-muted leading-relaxed">
          Le site est hébergé par :
        </p>
        <ul class="mt-4 space-y-2 text-foreground-muted">
          <li>Netlify, Inc.</li>
          <li>44 Montgomery Street, Suite 300, San Francisco, CA 94104, USA</li>
          <li>Site : <a href="https://www.netlify.com" target="_blank" rel="noopener" class="text-foreground underline hover:text-primary">netlify.com</a></li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-2xl font-medium mb-6">Propriété intellectuelle</h2>
        <p class="text-foreground-muted leading-relaxed">
          Le code source de ce site est open source et disponible sur <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener" class="text-foreground underline hover:text-primary">GitHub</a>.
        </p>
        <p class="text-foreground-muted leading-relaxed mt-4">
          Les contenus publiés par les utilisatrices (profils, descriptions, etc.) restent leur propriété.
        </p>
      </section>

      <section>
        <h2 class="font-display text-2xl font-medium mb-6">Données personnelles</h2>
        <p class="text-foreground-muted leading-relaxed">
          Les données collectées sur ce site sont :
        </p>
        <ul class="mt-4 space-y-2 text-foreground-muted">
          <li>Les informations de profil GitHub (nom, avatar, email) lors de la connexion</li>
          <li>Les informations que vous renseignez sur votre profil OSLD</li>
        </ul>
        <p class="text-foreground-muted leading-relaxed mt-4">
          Ces données sont utilisées uniquement pour le fonctionnement de la plateforme et ne sont pas transmises à des tiers.
        </p>
        <p class="text-foreground-muted leading-relaxed mt-4">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@ousontlesdeveloppeuses.fr" class="text-foreground underline hover:text-primary">contact@ousontlesdeveloppeuses.fr</a>.
        </p>
      </section>

      <section>
        <h2 class="font-display text-2xl font-medium mb-6">Cookies</h2>
        <p class="text-foreground-muted leading-relaxed">
          Ce site utilise des cookies strictement nécessaires au fonctionnement (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
        </p>
      </section>

      <section>
        <h2 class="font-display text-2xl font-medium mb-6">Responsabilité</h2>
        <p class="text-foreground-muted leading-relaxed">
          L'éditeur s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Toutefois, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
        </p>
        <p class="text-foreground-muted leading-relaxed mt-4">
          Les profils et contenus publiés par les utilisatrices sont sous leur responsabilité.
        </p>
      </section>
    </div>
  </div>
</template>
