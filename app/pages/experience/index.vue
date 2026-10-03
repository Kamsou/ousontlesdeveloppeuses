<script setup lang="ts">
import { quizQuestions } from '#shared/utils/quiz'

const { $clientPosthog } = useNuxtApp()
const { status, signIn } = useAuth()
const router = useRouter()
const route = useRoute()

useSeoMeta({
  title: 'Quel type de dev es-tu ?',
  ogTitle: 'Quel type de dev es-tu ?',
  description: '5 questions pour découvrir ton profil de développeuse. Portrait personnalisé généré par IA.',
  ogDescription: '5 questions pour découvrir ton profil de développeuse. Portrait personnalisé généré par IA.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})

type Step = 'intro' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'generating' | 'result'

const step = ref<Step>('intro')
const isTransitioning = ref(false)
const currentQuestion = computed(() => {
  const match = step.value.match(/^q(\d)$/)
  return match?.[1] ? parseInt(match[1]) : 0
})

const answers = reactive({
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: ''
})

const generatedProfile = ref<{
  type: string
  phrase: string
  insight: string
} | null>(null)

const loadingMessageIndex = ref(0)
const loadingMessages = [
  'Analyse de tes réponses',
  'Détection de tes patterns',
  'Consultation des archives',
  'Génération de ton profil',
  'Dernières touches'
]

const questions = quizQuestions

async function transitionTo(newStep: Step) {
  isTransitioning.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  step.value = newStep
  await new Promise(resolve => setTimeout(resolve, 50))
  isTransitioning.value = false
}

function start() {
  $clientPosthog?.capture('quiz_started')
  transitionTo('q1')
}

function selectOption(questionKey: keyof typeof answers, value: string) {
  answers[questionKey] = value
  nextStep()
}

function nextStep() {
  const steps: Step[] = ['intro', 'q1', 'q2', 'q3', 'q4', 'q5', 'generating', 'result']
  const currentIndex = steps.indexOf(step.value)
  const nextStepValue = steps[currentIndex + 1]
  if (currentIndex < steps.length - 1 && nextStepValue) {
    transitionTo(nextStepValue)

    if (nextStepValue === 'generating') {
      generateProfile()
    }
  }
}

function previousStep() {
  const steps: Step[] = ['intro', 'q1', 'q2', 'q3', 'q4', 'q5', 'generating', 'result']
  const currentIndex = steps.indexOf(step.value)
  const prevStepValue = steps[currentIndex - 1]
  if (currentIndex > 0 && prevStepValue) {
    transitionTo(prevStepValue)
  }
}

const profileSaved = ref(false)

async function generateProfile() {
  const startTime = Date.now()
  const minLoadingTime = 5000

  const messageInterval = setInterval(() => {
    loadingMessageIndex.value = (loadingMessageIndex.value + 1) % loadingMessages.length
  }, 1000)

  try {
    const response = await $fetch('/api/experience/generate', {
      method: 'POST',
      body: answers
    })

    generatedProfile.value = response as typeof generatedProfile.value

    localStorage.setItem('osld_experience_profile', JSON.stringify(generatedProfile.value))
    localStorage.setItem('osld_experience_answers', JSON.stringify(answers))

    if (status.value === 'authenticated' && generatedProfile.value) {
      try {
        await $fetch('/api/experience/save', {
          method: 'POST',
          body: {
            type: generatedProfile.value.type,
            phrase: generatedProfile.value.phrase
          }
        })
        profileSaved.value = true
      } catch (saveError) {
        console.error('Error saving profile:', saveError)
      }
    }

    const elapsed = Date.now() - startTime
    if (elapsed < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed))
    }

    $clientPosthog?.capture('quiz_completed', { profile_type: generatedProfile.value?.type })
    step.value = 'result'
  } catch (error) {
    console.error('Error generating profile:', error)
    generatedProfile.value = {
      type: 'L\'Exploratrice',
      phrase: 'Tu explores, tu testes, tu apprends. Le code est ton terrain de jeu.',
      insight: 'Tu fais partie des développeuses qui n\'ont pas peur de l\'inconnu.'
    }

    const elapsed = Date.now() - startTime
    if (elapsed < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed))
    }

    step.value = 'result'
  } finally {
    clearInterval(messageInterval)
  }
}

function handleSignUp() {
  if (status.value === 'authenticated') {
    router.push('/profile')
  } else {
    signIn('github')
  }
}

function shareProfile() {
  const text = `Je suis ${generatedProfile.value?.type} ! Découvre ton profil développeuse sur OSLD`
  const url = window.location.origin + '/experience'

  if (navigator.share) {
    navigator.share({ text, url })
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`)
    alert('Lien copié !')
  }
}

function restart() {
  answers.q1 = ''
  answers.q2 = ''
  answers.q3 = ''
  answers.q4 = ''
  answers.q5 = ''
  generatedProfile.value = null
  loadingMessageIndex.value = 0
  transitionTo('intro')
}

onMounted(() => {
  const prefill = route.query.q1
  if (typeof prefill === 'string' && questions.q1.options.some(o => o.value === prefill)) {
    answers.q1 = prefill
    $clientPosthog?.capture('quiz_started', { source: 'homepage' })
    step.value = 'q2'
  }
})
</script>

<template>
  <div class="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
    <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_top_left,#000_15%,transparent_70%)] pointer-events-none"></div>
    <div aria-hidden="true" class="grain absolute inset-0 pointer-events-none"></div>

    <Transition name="fade">
      <div v-if="step === 'intro' && !isTransitioning" class="relative flex-1 flex items-center px-4 md:px-16 py-16">
        <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-center">
          <div>
            <p class="font-mono text-xs text-foreground-muted mb-4 animate-slide-up"># quiz</p>
            <div class="overflow-hidden pb-[0.08em]">
              <h1 class="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.95] animate-slide-up animation-delay-100">
                Découvre<br/>ton profil
              </h1>
            </div>
            <p class="mt-6 text-base md:text-lg text-foreground-muted leading-relaxed max-w-md animate-slide-up animation-delay-200">
              Juste 5 questions pour révéler qui tu es vraiment quand tu codes. Fun, rapide, et étonnamment juste.
            </p>
            <div class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 animate-slide-up animation-delay-300">
              <button
                class="group flex items-center gap-4 px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:gap-6 hover:pr-5 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
                @click="start"
              >
                <span>C'est parti</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <span class="inline-flex items-center gap-2 font-mono text-xs text-foreground-muted">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Quiz IA · 2 min
              </span>
            </div>
          </div>
          <div aria-hidden="true" class="hidden lg:flex items-center justify-center">
            <div class="relative flex items-center justify-center w-[26rem] h-[26rem]">
              <span class="absolute inset-0 rounded-full border border-border/10"></span>
              <span class="absolute inset-12 rounded-full border border-border/10"></span>
              <span class="absolute inset-24 rounded-full border border-dashed border-border/15 orbit"></span>
              <span class="intro-five font-display text-[280px] font-medium leading-none select-none">5</span>
              <span class="absolute bottom-16 font-mono text-xs text-foreground-muted">questions</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="(step === 'q1' || step === 'q2' || step === 'q3' || step === 'q5') && !isTransitioning" class="relative flex-1 flex items-center px-4 md:px-16 py-10 md:py-16">
        <div class="w-full max-w-5xl mx-auto">
          <div class="spotlight-card relative p-6 md:p-14 border border-border/10 rounded-[2rem] bg-background-card overflow-hidden" @pointermove="trackPointer">
            <div aria-hidden="true" class="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-border/10"></div>
            <div aria-hidden="true" class="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-border/10"></div>

            <div class="relative flex items-center justify-between gap-4 mb-10">
              <button
                class="inline-flex items-center gap-2 font-mono text-xs text-foreground-muted cursor-pointer bg-transparent border-none transition-colors hover:text-foreground"
                @click="previousStep"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                retour
              </button>
              <span class="font-mono text-xs text-foreground-muted">{{ currentQuestion }} / 5</span>
            </div>

            <div class="relative h-px bg-foreground/10 mb-10 md:mb-14">
              <span class="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-700 ease-out" :style="{ width: `${currentQuestion * 20}%` }"></span>
            </div>

            <p class="relative font-mono text-xs text-foreground-muted mb-3">question {{ String(currentQuestion).padStart(2, '0') }}</p>
            <h2 class="relative font-display text-3xl md:text-5xl font-medium tracking-tight leading-tight mb-8 md:mb-10 max-w-3xl">
              {{ questions[step as keyof typeof questions].title }}
            </h2>

            <div class="relative flex flex-wrap gap-2 md:gap-3">
              <button
                v-for="(option, index) in (questions[step as keyof typeof questions] as { options: { value: string; label: string }[] }).options"
                :key="option.value"
                class="group inline-flex items-center gap-2.5 px-5 py-3 border border-b-[3px] border-border/15 border-b-border/30 rounded-full text-sm md:text-base font-medium text-left bg-background/60 text-foreground cursor-pointer transition-all hover:bg-foreground hover:text-background hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b"
                @click="selectOption(step as keyof typeof answers, option.value)"
              >
                <span class="font-mono text-xs text-foreground-muted group-hover:text-background/60" aria-hidden="true">{{ String.fromCharCode(65 + index) }}</span>
                {{ option.label }}
                <svg class="h-3.5 w-0 -ml-1 opacity-0 shrink-0 transition-all group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="step === 'q4' && !isTransitioning" class="relative flex-1 flex items-center px-4 md:px-16 py-10 md:py-16">
        <div class="w-full max-w-5xl mx-auto">
          <div class="spotlight-card relative p-6 md:p-14 border border-border/10 rounded-[2rem] bg-background-card overflow-hidden" @pointermove="trackPointer">
            <div aria-hidden="true" class="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-border/10"></div>
            <div aria-hidden="true" class="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-border/10"></div>

            <div class="relative flex items-center justify-between gap-4 mb-10">
              <button
                class="inline-flex items-center gap-2 font-mono text-xs text-foreground-muted cursor-pointer bg-transparent border-none transition-colors hover:text-foreground"
                @click="previousStep"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                retour
              </button>
              <span class="font-mono text-xs text-foreground-muted">4 / 5</span>
            </div>

            <div class="relative h-px bg-foreground/10 mb-10 md:mb-14">
              <span class="absolute inset-y-0 left-0 w-4/5 bg-foreground"></span>
            </div>

            <p class="relative font-mono text-xs text-foreground-muted mb-3">question 04</p>
            <h2 id="quiz-q4-title" class="relative font-display text-3xl md:text-5xl font-medium tracking-tight leading-tight mb-8 md:mb-10 max-w-3xl">
              {{ questions.q4.title }}
            </h2>

            <div class="relative">
              <textarea
                v-model="answers.q4"
                :placeholder="questions.q4.placeholder"
                maxlength="200"
                aria-labelledby="quiz-q4-title"
                class="block w-full px-5 py-4 md:px-6 md:py-5 bg-background/60 border border-border/15 rounded-2xl text-foreground text-lg md:text-xl leading-relaxed resize-none min-h-[150px] transition-colors focus:outline-none focus:border-foreground/60 placeholder:text-foreground-muted/60"
              ></textarea>
              <div class="mt-5 flex justify-between items-center gap-4">
                <span class="font-mono text-xs text-foreground-muted">{{ answers.q4.length }} / 200</span>
                <button
                  :disabled="!answers.q4.trim()"
                  class="group flex items-center gap-3 px-6 py-3.5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                  @click="nextStep"
                >
                  <span>Continuer</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="step === 'generating'" class="relative flex-1 flex items-center justify-center px-4 md:px-16 py-16">
        <div class="text-center max-w-lg w-full" role="status" aria-live="polite">
          <div aria-hidden="true" class="relative mx-auto mb-12 w-28 h-28 flex items-center justify-center">
            <span class="absolute inset-0 rounded-full border border-border/10"></span>
            <span class="absolute inset-0 rounded-full border border-transparent border-t-foreground spin"></span>
            <span class="absolute inset-5 rounded-full border border-dashed border-border/20 orbit"></span>
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>

          <p class="font-mono text-xs text-foreground-muted mb-4"># génération</p>
          <div class="h-12 md:h-14 overflow-hidden">
            <Transition name="msg" mode="out-in">
              <p :key="loadingMessageIndex" class="font-display text-2xl md:text-4xl font-medium tracking-tight">
                {{ loadingMessages[loadingMessageIndex] }}<span class="dots" aria-hidden="true"></span>
              </p>
            </Transition>
          </div>
          <div class="relative w-40 h-px bg-foreground/10 mx-auto mt-8 overflow-hidden">
            <span class="scan absolute inset-y-0 left-0 w-1/3 bg-foreground"></span>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="step === 'result' && generatedProfile && !isTransitioning" class="relative flex-1 flex items-center px-4 md:px-16 py-10 md:py-16">
        <div class="w-full max-w-4xl mx-auto">
          <div class="spotlight-card relative p-6 md:p-14 border border-border/10 rounded-[2rem] bg-background-card overflow-hidden" @pointermove="trackPointer">
            <div aria-hidden="true" class="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-border/10"></div>
            <div aria-hidden="true" class="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-border/10"></div>

            <div class="relative flex items-center justify-between gap-4 mb-10">
              <span class="font-mono text-xs text-foreground-muted"># ton-profil</span>
              <span class="font-mono text-xs text-foreground-muted">5 / 5</span>
            </div>

            <div class="relative h-px bg-foreground/10 mb-10 md:mb-14">
              <span class="absolute inset-y-0 left-0 w-full bg-foreground"></span>
            </div>

            <p class="relative text-base md:text-lg text-foreground-muted mb-3">Tu es...</p>
            <div class="relative overflow-hidden pb-[0.08em] mb-8 md:mb-10">
              <h3 class="font-display text-5xl md:text-7xl font-medium tracking-tight leading-[0.95] animate-slide-up">
                {{ generatedProfile.type }}
              </h3>
            </div>

            <blockquote class="relative max-w-2xl pl-5 border-l border-foreground mb-8 animate-slide-up animation-delay-100">
              <p class="text-xl md:text-2xl text-foreground leading-relaxed">« {{ generatedProfile.phrase }} »</p>
            </blockquote>

            <div class="relative max-w-2xl pt-5 border-t border-border/10 mb-10 animate-slide-up animation-delay-200">
              <p class="font-mono text-[0.65rem] text-foreground-muted mb-2">insight</p>
              <p class="text-sm md:text-base text-foreground-muted leading-relaxed">{{ generatedProfile.insight }}</p>
            </div>

            <p v-if="profileSaved" class="relative inline-flex items-center gap-2 font-mono text-xs text-foreground-muted mb-6 animate-slide-up animation-delay-250">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Profil sauvegardé dans ton compte
            </p>

            <div class="relative flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 animate-slide-up animation-delay-300">
              <button
                class="px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
                @click="handleSignUp"
              >
                {{ status === 'authenticated' ? 'Voir mon profil' : 'Créer mon compte (développeuse only)' }}
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 px-6 py-4 bg-background/60 border border-b-[3px] border-border/15 border-b-border/30 text-foreground rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-foreground hover:text-background hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b"
                @click="shareProfile"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
                </svg>
                Partager
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 px-4 py-4 bg-transparent border-none font-mono text-xs text-foreground-muted cursor-pointer transition-colors hover:text-foreground"
                @click="restart"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                recommencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.msg-enter-active,
.msg-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(60%);
}

.msg-leave-to {
  opacity: 0;
  transform: translateY(-60%);
}

.intro-five {
  color: transparent;
  -webkit-text-stroke: 1px rgb(var(--foreground) / 0.35);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-250 {
  animation-delay: 0.25s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1.1s linear infinite;
}

.orbit {
  animation: spin 24s linear infinite;
}

@keyframes scan {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(300%);
  }
}

.scan {
  animation: scan 1.6s ease-in-out infinite;
}

.dots::after {
  content: '';
  animation: dots 1.2s steps(4, end) infinite;
}

@keyframes dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-slide-up,
  .spin,
  .orbit,
  .scan,
  .dots::after {
    animation: none;
  }

  .msg-enter-active,
  .msg-leave-active {
    transition: opacity 0.2s ease;
  }

  .msg-enter-from,
  .msg-leave-to {
    transform: none;
  }
}
</style>
