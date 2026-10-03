<script setup lang="ts">
import { quizQuestions } from '#shared/utils/quiz'

const { $clientPosthog } = useNuxtApp()

const firstQuestion = quizQuestions.q1

function answer(value: string) {
  $clientPosthog?.capture('cta_clicked', { cta: 'homepage_quiz', answer: value })
  navigateTo({ path: '/experience', query: { q1: value } })
}
</script>

<template>
  <section id="quiz" class="py-16 md:py-32 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10">
    <div class="w-full max-w-5xl mx-auto">
      <div class="spotlight-card relative p-6 md:p-14 border border-border/10 rounded-[2rem] bg-background-card overflow-hidden" @pointermove="trackPointer">
        <div aria-hidden="true" class="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-border/10"></div>
        <div aria-hidden="true" class="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-border/10"></div>

        <div class="relative flex items-center justify-between gap-4 mb-10">
          <span class="inline-flex items-center gap-2 font-mono text-xs text-foreground-muted">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Quiz IA · 2 min
          </span>
          <span class="font-mono text-xs text-foreground-muted">1 / 5</span>
        </div>

        <div class="relative h-px bg-foreground/10 mb-10">
          <span class="absolute inset-y-0 left-0 w-1/5 bg-foreground"></span>
        </div>

        <h2 class="relative font-display text-3xl md:text-5xl font-medium tracking-tight mb-2">Quel dev es-tu ?</h2>
        <p class="relative text-foreground-muted mb-10">Réponds, on s'occupe du reste. Fun, rapide, et étonnamment juste.</p>

        <p class="relative font-display text-xl md:text-2xl font-medium mb-5">{{ firstQuestion.title }}</p>
        <div class="relative flex flex-wrap gap-2 md:gap-3">
          <button
            v-for="option in firstQuestion.options"
            :key="option.value"
            class="group inline-flex items-center gap-2 px-5 py-3 border border-b-[3px] border-border/15 border-b-border/30 rounded-full text-sm font-medium bg-background/60 cursor-pointer transition-all hover:bg-foreground hover:text-background hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b"
            @click="answer(option.value)"
          >
            {{ option.label }}
            <svg class="h-3.5 w-0 -ml-1 opacity-0 transition-all group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
