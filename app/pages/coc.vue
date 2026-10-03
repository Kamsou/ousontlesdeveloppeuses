<script setup lang="ts">
useSeoMeta({
  title: 'Code de conduite',
  description: 'Nos engagements pour un espace safe, inclusif et bienveillant.',
  ogTitle: 'Code de conduite',
  ogDescription: 'Nos engagements pour un espace safe, inclusif et bienveillant.',
  robots: 'index, follow'
})
</script>

<template>
  <div>
    <PageHero narrow label="code-de-conduite" title="Code de conduite">
      OSLD s'engage à créer un espace sûr, inclusif et bienveillant, où chacune peut évoluer dans un cadre qui valorise les compétences et favorise l'entraide.
    </PageHero>

    <div class="px-4 md:px-16 pb-20 md:pb-32">
      <div class="w-full max-w-3xl mx-auto">
        <div class="grid md:grid-cols-2 gap-3 md:gap-4 border-t border-border/10 pt-10 md:pt-12">
          <section class="spotlight-card flex flex-col p-6 md:p-7 rounded-3xl border border-border/10 bg-background-card" @pointermove="trackPointer">
            <p class="font-mono text-xs text-foreground-muted mb-3"># encouragé</p>
            <h2 class="font-display text-2xl font-medium tracking-tight mb-6">
              Ce que nous encourageons
            </h2>
            <ul class="space-y-4 text-foreground-muted leading-relaxed">
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center" aria-hidden="true">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <span>Le respect des limites, des émotions et des besoins d'autrui</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center" aria-hidden="true">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <span>La valorisation des savoirs et des expériences de chacune</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center" aria-hidden="true">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <span>La bienveillance, l'humilité et le droit à l'erreur</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center" aria-hidden="true">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <span>Oser poser des questions, exposer son point de vue, reconnaître ses erreurs et apprendre ensemble</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center" aria-hidden="true">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <span>Utiliser un langage inclusif et soutenir les personnes qui vivent des discriminations</span>
              </li>
            </ul>
          </section>

          <section class="spotlight-card relative overflow-hidden flex flex-col p-6 md:p-7 rounded-3xl border border-dashed border-border/20 bg-background-card" @pointermove="trackPointer">
            <div aria-hidden="true" class="absolute inset-0 -z-10 bg-[repeating-linear-gradient(135deg,rgb(var(--foreground)/0.04)_0_1px,transparent_1px_12px)] [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]"></div>
            <p class="font-mono text-xs text-foreground-muted mb-3"># non-toléré</p>
            <h2 class="font-display text-2xl font-medium tracking-tight mb-6">
              Ce qui n'est pas toléré
            </h2>
            <ul class="space-y-4 text-foreground-muted leading-relaxed">
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full border border-foreground/40 text-foreground flex items-center justify-center" aria-hidden="true">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </span>
                <span>Propos ou comportements discriminatoires</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full border border-foreground/40 text-foreground flex items-center justify-center" aria-hidden="true">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </span>
                <span>Harcèlement, mépris, moqueries ou attitudes infantilisantes</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full border border-foreground/40 text-foreground flex items-center justify-center" aria-hidden="true">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </span>
                <span>Blagues, stéréotypes ou commentaires déplacés</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full border border-foreground/40 text-foreground flex items-center justify-center" aria-hidden="true">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </span>
                <span>Comportements intrusifs ou insistants (commentaires sur l'apparence, contact non consenti, etc.)</span>
              </li>
            </ul>
          </section>
        </div>

        <section class="mt-3 md:mt-4 p-6 md:p-8 rounded-3xl border border-border/10 bg-background-card">
          <p class="font-mono text-xs text-foreground-muted mb-3"># signaler</p>
          <h2 class="font-display text-2xl md:text-3xl font-medium tracking-tight mb-4">
            En cas de problème
          </h2>
          <p class="text-foreground-muted leading-relaxed mb-8">
            Si vous vivez ou assistez à une situation qui vous met mal à l'aise :
          </p>
          <ol class="relative mb-8 space-y-6 before:absolute before:left-[1.1rem] before:top-2 before:bottom-2 before:w-px before:bg-border/15">
            <li class="relative flex items-start gap-4">
              <span class="w-9 h-9 shrink-0 rounded-full border border-border/20 bg-background flex items-center justify-center font-mono text-xs" aria-hidden="true">01</span>
              <span class="pt-1.5 text-foreground-muted leading-relaxed">Vous êtes légitime à le signaler, à votre manière et à votre rythme</span>
            </li>
            <li class="relative flex items-start gap-4">
              <span class="w-9 h-9 shrink-0 rounded-full border border-border/20 bg-background flex items-center justify-center font-mono text-xs" aria-hidden="true">02</span>
              <span class="pt-1.5 text-foreground-muted leading-relaxed">Vous pouvez nous écrire à <a href="mailto:contact@ousontlesdeveloppeuses.fr" class="text-foreground underline underline-offset-[3px] decoration-foreground/40 hover:decoration-foreground transition-colors break-words">contact@ousontlesdeveloppeuses.fr</a></span>
            </li>
            <li class="relative flex items-start gap-4">
              <span class="w-9 h-9 shrink-0 rounded-full border border-border/20 bg-background flex items-center justify-center font-mono text-xs" aria-hidden="true">03</span>
              <span class="pt-1.5 text-foreground-muted leading-relaxed">Vous pouvez aussi demander à une personne de confiance de le faire pour vous</span>
            </li>
          </ol>
          <p class="pt-6 border-t border-border/10 text-foreground-muted leading-relaxed">
            Chaque signalement est traité avec sérieux, confidentialité et respect, en laissant à la personne concernée le choix de son niveau d'implication.
          </p>
        </section>

        <section class="mt-12 md:mt-16 grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs md:pt-2.5"># intention</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Notre intention</h2>
            <p class="mb-4">
              Nous souhaitons que chaque personne - quels que soient son parcours, son identité ou son expérience - se sente <strong class="text-foreground font-medium">accueillie, en sécurité et légitime</strong> dans notre communauté.
            </p>
            <p class="mb-4">
              Nous savons qu'un seul comportement déplacé peut fissurer la confiance : c'est pourquoi nous agissons avec vigilance et pédagogie, dans une logique de <strong class="text-foreground font-medium">prévention, d'écoute et de réparation</strong>.
            </p>
            <p>
              Notre objectif : mettre en lumière les talents des femmes dans la tech, dans une dynamique d'empouvoirement collectif.
            </p>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs md:pt-2.5"># engagements</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Nos engagements</h2>
            <p class="mb-4">
              Nous agissons pour protéger notre communauté. Nos réponses peuvent aller d'un simple rappel pédagogique à une exclusion, temporaire ou définitive.
            </p>
            <p class="mb-4">
              Nous cherchons avant tout à <strong class="text-foreground font-medium">protéger les personnes concernées</strong> et à <strong class="text-foreground font-medium">préserver la sécurité du groupe</strong>.
            </p>
            <p>
              Aucune personne affectée ne sera contrainte de se confronter à la personne mise en cause si elle ne le souhaite pas.
            </p>
          </div>
        </section>

        <section class="grid md:grid-cols-[9rem_1fr] gap-3 md:gap-8 py-10 md:py-12 border-t border-border/10 text-foreground-muted leading-[1.75]">
          <p class="font-mono text-xs md:pt-2.5"># portée</p>
          <div>
            <h2 class="font-display text-2xl font-medium tracking-tight text-foreground mb-4">Portée</h2>
            <p>
              Ce code s'applique à toutes les interactions sur OSLD : profils, demandes d'aide, échanges via la plateforme, et communications associées.
            </p>
          </div>
        </section>

        <section class="pt-12 md:pt-16 border-t border-border/10">
          <p class="font-display text-2xl md:text-4xl font-medium tracking-tight leading-[1.15] text-foreground/45">
            Nous ne cherchons pas la perfection, mais la <strong class="font-medium text-foreground">sécurité et la progression</strong> - individuelle comme collective.
          </p>
          <p class="mt-6 text-foreground-muted text-base md:text-lg leading-relaxed">
            Ensemble, faisons d'OSLD un lieu d'apprentissage, de confiance et d'entraide.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
