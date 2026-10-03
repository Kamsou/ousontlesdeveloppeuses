<script setup lang="ts">
useSeoMeta({
  title: 'Mentions légales',
  description: 'Mentions légales du site OSLD.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <PageHero narrow label="mentions-légales" title="Mentions légales">
      Qui édite OSLD, où le site est hébergé et ce qu'on fait de tes données.
    </PageHero>

    <div class="px-4 md:px-16 pb-20 md:pb-32">
      <div class="w-full max-w-3xl mx-auto">
        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs text-foreground-muted md:pt-2.5"># éditeur</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Éditeur du site</h2>
            <p>
              Le site <strong class="text-foreground font-medium">ousontlesdeveloppeuses.fr</strong> est édité par :
            </p>
            <ul class="mt-4 space-y-2">
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">Camille Coutens</li>
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">Email : <a href="mailto:contact@ousontlesdeveloppeuses.fr" class="text-foreground underline underline-offset-[3px] decoration-foreground/40 hover:decoration-foreground transition-colors break-words">contact@ousontlesdeveloppeuses.fr</a></li>
            </ul>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs text-foreground-muted md:pt-2.5"># hébergement</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Hébergement</h2>
            <p>
              Le site est hébergé par :
            </p>
            <ul class="mt-4 space-y-2">
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">Netlify, Inc.</li>
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">44 Montgomery Street, Suite 300, San Francisco, CA 94104, USA</li>
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">Site : <a href="https://www.netlify.com" target="_blank" rel="noopener" class="text-foreground underline underline-offset-[3px] decoration-foreground/40 hover:decoration-foreground transition-colors break-words">netlify.com</a></li>
            </ul>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs text-foreground-muted md:pt-2.5"># propriété</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Propriété intellectuelle</h2>
            <p>
              Le code source de ce site est open source et disponible sur <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener" class="text-foreground underline underline-offset-[3px] decoration-foreground/40 hover:decoration-foreground transition-colors break-words">GitHub</a>.
            </p>
            <p class="mt-4">
              Les contenus publiés par les utilisatrices (profils, descriptions, etc.) restent leur propriété.
            </p>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs text-foreground-muted md:pt-2.5"># données</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Données personnelles</h2>
            <p>
              Les données collectées sur ce site sont :
            </p>
            <ul class="mt-4 space-y-2">
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">Les informations de profil GitHub (nom, avatar, email) lors de la connexion</li>
              <li class="relative pl-6 before:content-['—'] before:absolute before:left-0 before:text-foreground-muted/60">Les informations que vous renseignez sur votre profil OSLD</li>
            </ul>
            <p class="mt-4">
              Ces données sont utilisées uniquement pour le fonctionnement de la plateforme et ne sont pas transmises à des tiers.
            </p>
            <p class="mt-4">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@ousontlesdeveloppeuses.fr" class="text-foreground underline underline-offset-[3px] decoration-foreground/40 hover:decoration-foreground transition-colors break-words">contact@ousontlesdeveloppeuses.fr</a>.
            </p>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs text-foreground-muted md:pt-2.5"># cookies</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Cookies</h2>
            <p>
              Ce site utilise des cookies strictement nécessaires au fonctionnement (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs text-foreground-muted md:pt-2.5"># responsabilité</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Responsabilité</h2>
            <p>
              L'éditeur s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Toutefois, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
            </p>
            <p class="mt-4">
              Les profils et contenus publiés par les utilisatrices sont sous leur responsabilité.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
