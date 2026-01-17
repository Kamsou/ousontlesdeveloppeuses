import Anthropic from '@anthropic-ai/sdk'

const developerTypes = [
  'L\'Architecte',
  'La Détective',
  'La Speedrunner',
  'La Perfectionniste',
  'La Connectrice',
  'L\'Exploratrice',
  'La Gardienne',
  'La Créative',
  'La Mentore',
  'L\'Automatrice',
  'La Stratège',
  'La Bidouilleuse',
  'La Vulgarisatrice',
  'L\'Endurante'
]

const typeDescriptions: Record<string, string> = {
  'L\'Architecte': 'Pense système avant code. Structure, vision long-terme.',
  'La Détective': 'Trouve le bug que personne ne voit. Patience, logique implacable.',
  'La Speedrunner': 'Ship fast, fix later. Pragmatisme, vélocité.',
  'La Perfectionniste': 'Chaque ligne compte. Qualité, attention au détail.',
  'La Connectrice': 'Code = communication. Empathie, collaboration.',
  'L\'Exploratrice': 'Nouvelle techno ? J\'arrive. Curiosité, adaptabilité.',
  'La Gardienne': 'Sécurité et stabilité d\'abord. Fiabilité, rigueur.',
  'La Créative': 'Le code est un art. Innovation, originalité.',
  'La Mentore': 'Transmet, accompagne, fait grandir. Le code se partage.',
  'L\'Automatrice': 'Si c\'est répétitif, c\'est automatisable. Scripts et pipelines.',
  'La Stratège': 'Voit trois coups d\'avance. Tech et business alignés.',
  'La Bidouilleuse': 'Prototype, hack, improvise. Le MVP avant tout.',
  'La Vulgarisatrice': 'Explique le complexe simplement. Bridge tech/non-tech.',
  'L\'Endurante': 'Legacy, dette technique ? Challenge accepted. Ténacité.'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.q1 || !body.q2 || !body.q3 || !body.q4 || !body.q5) {
    throw createError({ statusCode: 400, message: 'Toutes les réponses sont requises' })
  }

  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    console.warn('ANTHROPIC_API_KEY not set, using fallback profile generation')
    return generateFallbackProfile(body)
  }

  try {
    const client = new Anthropic({
      apiKey: config.anthropicApiKey
    })

    const prompt = `Tu es un expert en personnalités de développeuses. Tu dois analyser les réponses à un quiz et déterminer le profil de la personne.

Basé sur ces réponses :

1. Setup idéal pour coder : ${body.q1}
2. Comment elle commence un nouveau projet : ${body.q2}
3. Réaction face à un bug en prod vendredi 17h : ${body.q3}
4. Projet dont elle est la plus fière : ${body.q4}
5. Skill qu'elle voudrait maîtriser instantanément : ${body.q5}

Les 8 types possibles sont :
${developerTypes.map(type => `- ${type}: ${typeDescriptions[type]}`).join('\n')}

Détermine :
1. Le TYPE le plus adapté parmi la liste ci-dessus
2. Une PHRASE personnalisée (20 mots max) qui capture l'essence de cette développeuse, en la tutoyant
3. Un INSIGHT fun et encourageant commençant par "Tu fais partie des..." (ex: "Tu fais partie des développeuses qui...")

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{"type": "...", "phrase": "...", "insight": "..."}`

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    try {
      const profile = JSON.parse(responseText.trim())

      if (!profile.type || !profile.phrase || !profile.insight) {
        throw new Error('Invalid profile structure')
      }

      if (!developerTypes.includes(profile.type)) {
        profile.type = 'L\'Exploratrice'
      }

      return profile
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText)
      return generateFallbackProfile(body)
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return generateFallbackProfile(body)
  }
})

function generateFallbackProfile(answers: Record<string, string>) {
  let type = 'L\'Exploratrice'
  let phrase = 'Tu explores, tu testes, tu apprends. Le code est ton terrain de jeu.'
  let insight = 'Tu fais partie des développeuses qui n\'ont pas peur de l\'inconnu.'

  if (answers.q2 === 'team' && answers.q5 === 'explain') {
    type = 'La Mentore'
    phrase = 'Tu transmets, tu accompagnes, tu fais grandir les autres.'
    insight = 'Tu fais partie des développeuses qui rendent les équipes meilleures.'
  } else if (answers.q5 === 'explain' && answers.q1 === 'openspace') {
    type = 'La Vulgarisatrice'
    phrase = 'Tu traduis le complexe en simple. Le pont entre deux mondes.'
    insight = 'Tu fais partie des développeuses qui rendent la tech accessible.'
  } else if (answers.q2 === 'poc' && answers.q1 === 'anywhere') {
    type = 'La Bidouilleuse'
    phrase = 'Tu prototypes, tu hack, tu improvises. Le MVP, c\'est ton terrain.'
    insight = 'Tu fais partie des développeuses qui trouvent toujours une solution.'
  } else if (answers.q3 === 'stay' && answers.q5 === 'debug') {
    type = 'L\'Endurante'
    phrase = 'Legacy, dette technique ? Tu relèves le défi. Ténacité incarnée.'
    insight = 'Tu fais partie des développeuses qui ne lâchent jamais.'
  } else if (answers.q2 === 'schema' && answers.q5 === 'estimate') {
    type = 'La Stratège'
    phrase = 'Tu vois trois coups d\'avance. Tech et business alignés.'
    insight = 'Tu fais partie des développeuses qui pensent impact.'
  } else if (answers.q5 === 'predict' && answers.q2 === 'doc') {
    type = 'L\'Automatrice'
    phrase = 'Si c\'est répétitif, tu l\'automatises. Scripts et pipelines, ton dada.'
    insight = 'Tu fais partie des développeuses qui optimisent tout.'
  } else if (answers.q2 === 'schema') {
    type = 'L\'Architecte'
    phrase = 'Tu vois le système avant de voir le code. La structure, c\'est ta force.'
    insight = 'Tu fais partie des développeuses qui pensent à long terme.'
  } else if (answers.q3 === 'methodical' || answers.q3 === 'logs') {
    type = 'La Détective'
    phrase = 'Rien ne t\'échappe. Tu trouves le bug que tout le monde a raté.'
    insight = 'Tu fais partie des développeuses qui gardent leur calme sous pression.'
  } else if (answers.q2 === 'code' || answers.q2 === 'poc') {
    type = 'La Speedrunner'
    phrase = 'Tu ship vite, tu itères. L\'action avant la perfection.'
    insight = 'Tu fais partie des développeuses qui font avancer les choses.'
  } else if (answers.q5 === 'estimate') {
    type = 'La Perfectionniste'
    phrase = 'Chaque détail compte. Tu ne laisses rien au hasard.'
    insight = 'Tu fais partie des développeuses qui visent l\'excellence.'
  } else if (answers.q2 === 'team' || answers.q5 === 'explain') {
    type = 'La Connectrice'
    phrase = 'Le code, c\'est aussi de la communication. Tu fais le lien.'
    insight = 'Tu fais partie des développeuses qui renforcent les équipes.'
  } else if (answers.q5 === 'learn') {
    type = 'L\'Exploratrice'
    phrase = 'Nouvelle techno ? Tu es déjà dessus. La curiosité te guide.'
    insight = 'Tu fais partie des développeuses qui n\'arrêtent jamais d\'apprendre.'
  } else if (answers.q3 === 'stay' || answers.q5 === 'predict') {
    type = 'La Gardienne'
    phrase = 'Tu protèges le code et l\'équipe. La stabilité, c\'est toi.'
    insight = 'Tu fais partie des développeuses sur qui on peut compter.'
  } else if (answers.q1 === 'night' || answers.q1 === 'home') {
    type = 'La Créative'
    phrase = 'Pour toi, coder c\'est créer. Chaque projet est une oeuvre.'
    insight = 'Tu fais partie des développeuses qui voient l\'art dans le code.'
  }

  return { type, phrase, insight }
}
