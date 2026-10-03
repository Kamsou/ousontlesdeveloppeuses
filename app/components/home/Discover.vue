<script setup lang="ts">
import { seededRandom } from '~/utils/home'

const reducedMotion = usePreferredReducedMotion()

const sectionRef = ref<HTMLElement | null>(null)
const visible = useRevealOnce(sectionRef, 0.15)

const queries = ['React · Lyon', 'Mentoring · Remote', 'Python · Nantes', 'Speakeuse · Paris', 'Coffee chat', 'Rust · Bordeaux']
const queryIndex = ref(0)
const typed = ref('')
let typingTimer: ReturnType<typeof setTimeout> | undefined

const waveform = (() => {
  const rand = seededRandom(11)
  return Array.from({ length: 32 }, () => 0.2 + rand() * 0.8)
})()

const contributions = (() => {
  const rand = seededRandom(99)
  return Array.from({ length: 7 * 18 }, () => {
    const r = rand()
    return r < 0.35 ? 0.06 : r < 0.6 ? 0.2 : r < 0.82 ? 0.45 : 0.85
  })
})()

function typeNext(charIndex = 0) {
  const query = queries[queryIndex.value] ?? ''
  if (charIndex <= query.length) {
    typed.value = query.slice(0, charIndex)
    typingTimer = setTimeout(() => typeNext(charIndex + 1), 70)
    return
  }
  typingTimer = setTimeout(() => {
    queryIndex.value = (queryIndex.value + 1) % queries.length
    typeNext(0)
  }, 1800)
}

watch(visible, (isVisible) => {
  if (!isVisible) return
  if (reducedMotion.value === 'reduce') {
    typed.value = queries[0] ?? ''
    return
  }
  typeNext()
})

onBeforeUnmount(() => {
  clearTimeout(typingTimer)
})
</script>

<template>
  <section id="discover" ref="sectionRef" class="py-16 md:py-40 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10">
    <div class="w-full max-w-7xl mx-auto">
      <div class="mb-10 lg:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <a href="#discover" class="inline-block font-mono text-xs text-foreground-muted mb-3 no-underline hover:text-foreground transition-colors"># découvre</a>
          <h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight">
            Ce que tu trouves sur OSLD
          </h2>
        </div>
        <p class="text-foreground-muted text-sm md:text-base max-w-sm">
          Pour les devs, les orgas d'événements, les recruteurs et recruteuses. Tout est public, gratuit et open source.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <NuxtLink to="/directory" class="spotlight-card group md:col-span-2 lg:col-span-3 grid lg:grid-cols-2 gap-8 lg:gap-12 lg:items-end p-6 md:p-8 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground" @pointermove="trackPointer">
          <div>
            <span class="font-mono text-xs text-foreground-muted">/directory</span>
            <h3 class="font-display text-3xl md:text-4xl font-medium mt-3 mb-3">Annuaire</h3>
            <p class="text-foreground-muted text-sm md:text-base leading-relaxed">
              Profils de développeuses en France. Filtre par localisation, langages et disponibilités.
            </p>
          </div>
          <div>
            <div class="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/15 bg-background/60 font-mono text-sm">
              <svg class="w-4 h-4 text-foreground-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
              <span class="truncate">{{ typed }}</span>
              <span class="caret -ml-2 w-[2px] h-4 bg-foreground"></span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span v-for="tag in ['Freelance', 'CDI', 'Mentoring', 'Coffee chat', 'Pair programming']" :key="tag" class="px-2.5 py-1 text-xs border border-border/15 rounded-full text-foreground-muted group-hover:text-foreground group-hover:border-foreground/30 transition-colors">{{ tag }}</span>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/speakers" class="spotlight-card group flex flex-col justify-between gap-6 p-6 md:p-7 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground overflow-hidden" @pointermove="trackPointer">
          <div class="badge h-28 flex flex-col items-center" aria-hidden="true">
            <span class="w-px h-6 bg-foreground/30"></span>
            <div class="w-20 h-[5.5rem] rounded-xl border border-border/20 bg-background flex flex-col items-center justify-center gap-1.5 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]">
              <span class="w-4 h-1 rounded-full bg-foreground/20"></span>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/>
              </svg>
              <span class="font-mono text-[0.5rem] tracking-[0.2em] uppercase">Speakeuse</span>
            </div>
          </div>
          <div>
            <h3 class="font-display text-2xl font-medium mb-2">Speakeuses</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Des speakeuses pour tes événements tech, par sujet et format.
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/companies" class="spotlight-card group flex flex-col justify-between gap-6 p-6 md:p-7 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground" @pointermove="trackPointer">
          <div class="inline-flex self-start items-center gap-2.5 px-3.5 py-2 rounded-full border border-border/20">
            <span class="flex gap-0.5" aria-hidden="true">
              <svg v-for="i in 5" :key="i" class="star w-3 h-3" :style="{ transitionDelay: `${i * 60}ms` }" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>
              </svg>
            </span>
            <span class="text-xs font-medium">Certifiée Inclusive</span>
          </div>
          <div>
            <h3 class="font-display text-2xl font-medium mb-2">Entreprises</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Avis sur les entreprises tech. Badge « Certifiée Inclusive » dès 5 avis positifs.
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/programs" class="spotlight-card group flex flex-col justify-between gap-6 p-6 md:p-7 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground" @pointermove="trackPointer">
          <div class="relative h-[4.5rem]" aria-hidden="true">
            <span class="fan absolute left-0 top-0 px-3 py-1.5 rounded-full border border-border/20 bg-background text-xs [--r:-6deg] [--tx:0px]">Duchess France</span>
            <span class="fan absolute left-8 top-5 px-3 py-1.5 rounded-full border border-border/20 bg-background text-xs [--r:3deg] [--tx:18px]">Rails Girls</span>
            <span class="fan absolute left-20 top-10 px-3 py-1.5 rounded-full bg-foreground text-background text-xs [--r:-2deg] [--tx:36px]">+ plus encore</span>
          </div>
          <div>
            <h3 class="font-display text-2xl font-medium mb-2">Programmes</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Communautés, formations, mentorat. Pour apprendre ou se reconvertir.
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/podcasts" class="spotlight-card group flex flex-col justify-between gap-6 p-6 md:p-7 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground" @pointermove="trackPointer">
          <div class="flex items-center gap-[3px] h-14" aria-hidden="true">
            <span
              v-for="(height, i) in waveform"
              :key="i"
              class="wave flex-1 rounded-full bg-foreground/40 group-hover:bg-foreground transition-colors"
              :style="{ height: `${height * 100}%`, animationDelay: `${i * -90}ms` }"
            ></span>
          </div>
          <div>
            <h3 class="font-display text-2xl font-medium mb-2">Podcasts</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Des épisodes avec des développeuses. Des parcours inspirants à écouter.
            </p>
          </div>
        </NuxtLink>

        <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener noreferrer" class="spotlight-card group flex flex-col justify-between gap-6 p-6 md:p-7 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground overflow-hidden" @pointermove="trackPointer">
          <div class="grid grid-flow-col grid-rows-7 gap-[3px] justify-start h-14 lg:h-[4.5rem]" aria-hidden="true">
            <span
              v-for="(level, i) in contributions"
              :key="i"
              class="contrib aspect-square h-full rounded-[2px] bg-foreground"
              :style="{ opacity: level, animationDelay: `${Math.floor(i / 7) * 40}ms` }"
            ></span>
          </div>
          <div>
            <h3 class="font-display text-2xl font-medium mb-2 flex items-center gap-2">
              Open Source
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M8 7h9v9"/>
              </svg>
            </h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Contribue, propose des features. Ta première PR peut commencer ici.
            </p>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.caret {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.badge {
  transform-origin: 50% 0;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group:hover .badge {
  transform: rotate(-8deg);
}

.star {
  fill: transparent;
  transition: fill 0.2s ease;
}

.group:hover .star {
  fill: currentColor;
}

.fan {
  transform: rotate(var(--r)) translateX(0);
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group:hover .fan {
  transform: rotate(0deg) translateX(var(--tx));
}

.wave {
  transform-origin: center;
}

.group:hover .wave {
  animation: wave 0.9s ease-in-out infinite alternate;
}

@keyframes wave {
  from { transform: scaleY(0.3); }
  to { transform: scaleY(1); }
}

.group:hover .contrib {
  animation: pop 0.6s ease both;
}

@keyframes pop {
  50% { transform: scale(1.35); }
}

@media (prefers-reduced-motion: reduce) {
  .caret,
  .group:hover .wave,
  .group:hover .contrib {
    animation: none;
  }

  .badge,
  .fan {
    transition: none;
  }
}
</style>
