export const quizQuestions = {
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
