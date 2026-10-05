export interface FaqItem {
  question: string
  answer: string
  link?: { to: string, label: string }
}

// Rounded down so the prerendered text stays true between deploys
function atLeast(value: number | undefined) {
  if (!value) return null
  return value >= 20 ? `plus de ${Math.floor(value / 10) * 10}` : String(value)
}

export function homeFaq(stats: { developers: number, locations: number, speakers: number } | null | undefined): FaqItem[] {
  const developers = atLeast(stats?.developers)
  const locations = atLeast(stats?.locations)
  const speakers = atLeast(stats?.speakers)

  return [
    {
      question: 'Qu\'est-ce que Où sont les développeuses (OSLD)\u00a0?',
      answer: `Où sont les développeuses (OSLD) est un annuaire gratuit et open source des développeuses tech en France.${developers ? ` ${developers.charAt(0).toUpperCase()}${developers.slice(1)} développeuses y ont un profil${locations ? `, dans ${locations} villes` : ''}.` : ''} Chaque profil indique la stack, la ville, l'expérience et ce pour quoi elle est disponible : conférence, mentoring, coffee chat, pair programming, relecture de CV ou recherche d'emploi.`,
      link: { to: '/directory', label: 'Voir l\'annuaire' }
    },
    {
      question: 'Comment trouver une développeuse à recruter\u00a0?',
      answer: 'Dans l\'annuaire, filtre par ville, par technologie et par disponibilité. Le badge « En recherche » signale les développeuses qui cherchent un CDI, une mission freelance, un stage ou une alternance. Leur profil donne leur LinkedIn et leurs liens pour les contacter.',
      link: { to: '/directory', label: 'Chercher une développeuse' }
    },
    {
      question: 'Comment trouver une speakeuse tech pour un meetup ou une conférence\u00a0?',
      answer: `La page Speakeuses réunit ${speakers ?? 'les'} développeuses qui acceptent d'intervenir en conférence. Chaque profil précise ses sujets de talk, ses talks passés et si elle intervient en remote ou se déplace.`,
      link: { to: '/speakers', label: 'Trouver une speakeuse' }
    },
    {
      question: 'Comment trouver une mentore dans la tech\u00a0?',
      answer: 'Filtre l\'annuaire sur « Mentoring » : ces développeuses acceptent d\'accompagner une personne qui débute ou se reconvertit. Les programmes de mentorat et communautés comme Duchess France ou Rails Girls sont listés sur la page Programmes.',
      link: { to: '/programs', label: 'Voir les programmes' }
    },
    {
      question: 'Comment apparaître dans l\'annuaire\u00a0?',
      answer: 'Connecte-toi avec GitHub et remplis ton profil en trois étapes : qui tu es, ta stack, comment te trouver. Ça prend deux minutes et tu peux tout modifier ensuite. Ton profil est public dès sa création.'
    },
    {
      question: 'Qui peut s\'inscrire\u00a0?',
      answer: 'Toutes les développeuses francophones, quel que soit leur niveau : en formation, en reconversion, junior ou senior, salariée ou freelance.'
    },
    {
      question: 'Est-ce gratuit\u00a0? Mon email est-il visible\u00a0?',
      answer: 'OSLD est entièrement gratuit, sans publicité, et son code est open source sur GitHub. Ton email n\'est jamais affiché : les demandes de contact passent par OSLD et arrivent dans ta boîte mail, et tu choisis ce que tu montres sur ton profil.'
    }
  ]
}
