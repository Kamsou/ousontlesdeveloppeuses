<script setup lang="ts">
useSeoMeta({
  title: 'Découvre ton profil développeuse - OSLD',
  ogTitle: 'Découvre ton profil développeuse - OSLD',
  description: 'Réponds à 5 questions et découvre quel type de développeuse tu es. Un portrait personnalisé généré par IA.',
  ogDescription: 'Réponds à 5 questions et découvre quel type de développeuse tu es. Un portrait personnalisé généré par IA.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})

const { status, signIn } = useAuth()
const router = useRouter()

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

const questions = {
  q1: {
    title: 'Ton setup idéal pour coder ?',
    options: [
      { value: 'home', label: 'Home office cosy' },
      { value: 'cafe', label: 'Café avec du bruit ambiant' },
      { value: 'openspace', label: 'Open space avec l\'équipe' },
      { value: 'anywhere', label: 'N\'importe où avec du wifi' },
      { value: 'night', label: 'La nuit, quand tout dort' }
    ]
  },
  q2: {
    title: 'Nouveau projet. Tu commences par ?',
    options: [
      { value: 'schema', label: 'Un schéma d\'architecture' },
      { value: 'code', label: 'Du code pour tester l\'idée' },
      { value: 'doc', label: 'Lire la doc des technos' },
      { value: 'team', label: 'Discuter avec l\'équipe' },
      { value: 'poc', label: 'Un POC rapide' }
    ]
  },
  q3: {
    title: 'Bug en prod vendredi 17h. Ta réaction ?',
    options: [
      { value: 'stay', label: 'Je reste jusqu\'à ce que ce soit fix' },
      { value: 'methodical', label: 'Je debug méthodiquement, pas de panique' },
      { value: 'help', label: 'J\'appelle du renfort immédiatement' },
      { value: 'logs', label: 'Je check les logs et métriques d\'abord' },
      { value: 'reproduce', label: 'Je reproduis le bug en local avant tout' }
    ]
  },
  q4: {
    title: 'Décris en une phrase le projet dont tu es la plus fière',
    type: 'text' as const,
    placeholder: 'Ex: Une app qui aide les gens à...'
  },
  q5: {
    title: 'Si tu pouvais maîtriser un seul skill instantanément ?',
    options: [
      { value: 'estimate', label: 'Estimer parfaitement les délais' },
      { value: 'debug', label: 'Trouver n\'importe quel bug en 5 min' },
      { value: 'explain', label: 'Expliquer le technique à n\'importe qui' },
      { value: 'learn', label: 'Apprendre n\'importe quelle techno en 1 jour' },
      { value: 'predict', label: 'Prédire les bugs avant qu\'ils arrivent' }
    ]
  }
}

async function transitionTo(newStep: Step) {
  isTransitioning.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  step.value = newStep
  await new Promise(resolve => setTimeout(resolve, 50))
  isTransitioning.value = false
}

function start() {
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
    router.push('/profil')
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
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
    <Transition name="fade">
      <div v-if="step === 'intro' && !isTransitioning" class="flex-1 flex items-center px-4 md:px-16 py-16">
        <div class="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <div class="overflow-hidden mb-6">
              <span class="block text-xs uppercase tracking-[0.3em] text-text/80 animate-slide-up">Experience</span>
            </div>
            <div class="overflow-hidden">
              <h1 class="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.9] animate-slide-up animation-delay-100">
                Découvre<br/>ton profil
              </h1>
            </div>
            <div class="overflow-hidden mt-8">
              <p class="text-lg md:text-xl text-text-muted leading-relaxed max-w-md animate-slide-up animation-delay-200">
                Pas un CV. Pas un test technique. Juste 5 questions pour révéler qui tu es vraiment quand tu codes.
              </p>
            </div>
            <div class="overflow-hidden mt-12">
              <button
                @click="start"
                class="group inline-flex items-center gap-6 text-base font-medium cursor-pointer animate-slide-up animation-delay-300 bg-transparent border-none text-text"
              >
                <span class="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-text after:origin-left after:scale-x-100">C'est parti</span>
                <span class="flex items-center justify-center w-12 h-12 border border-text rounded-full transition-transform group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <div class="hidden lg:flex items-center justify-center">
            <div class="relative">
              <span class="font-display text-[280px] font-medium leading-none text-text/5 select-none">5</span>
              <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm uppercase tracking-[0.2em] text-text-muted">questions</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="(step === 'q1' || step === 'q2' || step === 'q3' || step === 'q5') && !isTransitioning" class="flex-1 flex px-4 md:px-16 py-12 md:py-16">
        <div class="max-w-6xl w-full mx-auto">
          <div class="flex items-center justify-between mb-12 md:mb-20">
            <button
              @click="previousStep"
              class="flex items-center gap-3 text-text-muted text-sm cursor-pointer bg-transparent border-none hover:text-text transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span class="hidden md:inline">Retour</span>
            </button>
            <div class="flex items-center gap-4">
              <span class="text-xs uppercase tracking-[0.2em] text-text-muted">{{ currentQuestion }}/5</span>
              <div class="flex gap-1.5">
                <div
                  v-for="i in 5"
                  :key="i"
                  :class="[
                    'w-6 md:w-10 h-0.5 transition-all duration-500',
                    i <= currentQuestion ? 'bg-text' : 'bg-text/10'
                  ]"
                ></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24">
            <div>
              <span class="font-display text-[100px] md:text-[150px] font-medium leading-none text-text/5 block mb-4">
                {{ String(currentQuestion).padStart(2, '0') }}
              </span>
              <h2 class="font-display text-3xl md:text-5xl font-medium tracking-tight leading-tight">
                {{ questions[step as keyof typeof questions].title }}
              </h2>
            </div>

            <div class="flex flex-col gap-3 self-center">
              <button
                v-for="(option, index) in (questions[step as keyof typeof questions] as { options: { value: string; label: string }[] }).options"
                :key="option.value"
                @click="selectOption(step as keyof typeof answers, option.value)"
                class="group w-full text-left px-6 md:px-8 py-5 md:py-6 bg-transparent border border-border text-text cursor-pointer transition-all duration-300 hover:bg-text hover:text-bg hover:border-text hover:pl-10 flex items-center gap-4"
              >
                <span class="text-xs text-text-muted group-hover:text-bg/50 font-mono w-6">{{ String.fromCharCode(65 + index) }}</span>
                <span class="text-base md:text-lg">{{ option.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="step === 'q4' && !isTransitioning" class="flex-1 flex px-4 md:px-16 py-12 md:py-16">
        <div class="max-w-6xl w-full mx-auto">
          <div class="flex items-center justify-between mb-12 md:mb-20">
            <button
              @click="previousStep"
              class="flex items-center gap-3 text-text-muted text-sm cursor-pointer bg-transparent border-none hover:text-text transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span class="hidden md:inline">Retour</span>
            </button>
            <div class="flex items-center gap-4">
              <span class="text-xs uppercase tracking-[0.2em] text-text-muted">4/5</span>
              <div class="flex gap-1.5">
                <div
                  v-for="i in 5"
                  :key="i"
                  :class="[
                    'w-6 md:w-10 h-0.5 transition-all duration-500',
                    i <= 4 ? 'bg-text' : 'bg-text/10'
                  ]"
                ></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24">
            <div>
              <span class="font-display text-[100px] md:text-[150px] font-medium leading-none text-text/5 block mb-4">04</span>
              <h2 class="font-display text-3xl md:text-5xl font-medium tracking-tight leading-tight">
                {{ questions.q4.title }}
              </h2>
            </div>

            <div class="flex flex-col gap-8 self-center">
              <textarea
                v-model="answers.q4"
                :placeholder="questions.q4.placeholder"
                maxlength="200"
                class="w-full px-0 py-6 bg-transparent border-0 border-b-2 border-border text-text text-xl md:text-2xl resize-none min-h-[150px] focus:outline-none focus:border-text placeholder:text-text/30 transition-colors"
              ></textarea>
              <div class="flex justify-between items-center">
                <span class="text-xs text-text-muted font-mono">{{ answers.q4.length }}/200</span>
                <button
                  @click="nextStep"
                  :disabled="!answers.q4.trim()"
                  class="group inline-flex items-center gap-4 text-base font-medium cursor-pointer bg-transparent border-none text-text disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                >
                  <span>Continuer</span>
                  <span class="flex items-center justify-center w-10 h-10 border border-text rounded-full transition-transform group-hover:scale-110 group-disabled:scale-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="step === 'generating'" class="flex-1 flex items-center justify-center px-4 md:px-16">
        <div class="text-center max-w-lg">
          <div class="mb-16">
            <div class="inline-flex gap-2">
              <span class="w-2 h-2 bg-text rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-text rounded-full animate-bounce animation-delay-100"></span>
              <span class="w-2 h-2 bg-text rounded-full animate-bounce animation-delay-200"></span>
            </div>
          </div>

          <p class="text-2xl md:text-4xl font-display font-medium mb-4 transition-all duration-500">
            {{ loadingMessages[loadingMessageIndex] }}
          </p>
          <div class="w-32 h-px bg-border mx-auto mt-8"></div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="step === 'result' && generatedProfile && !isTransitioning" class="flex-1 flex items-center justify-center px-4 md:px-16 py-16">
        <div class="max-w-3xl w-full text-center">
          <div class="mb-8">
            <span class="text-xs uppercase tracking-[0.3em] text-text-muted">Ton profil</span>
          </div>

          <div class="mb-12">
            <p class="text-lg text-text-muted mb-4">Tu es...</p>
            <h3 class="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight animate-slide-up">
              {{ generatedProfile.type }}
            </h3>
          </div>

          <div class="max-w-xl mx-auto mb-12">
            <p class="text-xl md:text-2xl text-text leading-relaxed mb-8 animate-slide-up animation-delay-100">
              "{{ generatedProfile.phrase }}"
            </p>
            <div class="w-16 h-px bg-border mx-auto mb-8"></div>
            <p class="text-sm text-text-muted animate-slide-up animation-delay-200">
              {{ generatedProfile.insight }}
            </p>
          </div>

          <p v-if="profileSaved" class="text-sm text-text-muted mb-6 animate-slide-up animation-delay-250">
            Profil sauvegardé dans ton compte
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
            <button
              @click="handleSignUp"
              class="px-8 py-4 bg-text text-bg border-none text-base font-medium cursor-pointer transition-all hover:opacity-80"
            >
              {{ status === 'authenticated' ? 'Voir mon profil' : 'Créer mon compte' }}
            </button>
            <button
              @click="shareProfile"
              class="px-8 py-4 bg-transparent border border-border text-text text-base cursor-pointer transition-all hover:border-text"
            >
              Partager
            </button>
            <button
              @click="restart"
              class="px-8 py-4 bg-transparent border-none text-text-muted text-base cursor-pointer transition-all hover:text-text"
            >
              Recommencer
            </button>
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
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-delay-100 {
  animation-delay: 0.1s;
  opacity: 0;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}

.animation-delay-250 {
  animation-delay: 0.25s;
  opacity: 0;
}

.animation-delay-300 {
  animation-delay: 0.3s;
  opacity: 0;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 0.8s ease-in-out infinite;
}
</style>
