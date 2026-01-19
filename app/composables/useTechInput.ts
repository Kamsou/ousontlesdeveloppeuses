export function useTechInput(initialTechs: string[] = []) {
  const techs = ref(initialTechs)
  const techInput = ref('')

  function addTech() {
    const tech = techInput.value.trim()
    if (tech && !techs.value.includes(tech)) {
      techs.value.push(tech)
      techInput.value = ''
    }
  }

  function removeTech(tech: string) {
    techs.value = techs.value.filter(t => t !== tech)
  }

  function handleTechKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTech()
    }
  }

  function handleTechInput() {
    if (techInput.value.includes(',')) {
      const parts = techInput.value.split(',')
      parts.forEach(part => {
        const tech = part.trim()
        if (tech && !techs.value.includes(tech)) {
          techs.value.push(tech)
        }
      })
      techInput.value = ''
    }
  }

  return {
    techs,
    techInput,
    addTech,
    removeTech,
    handleTechKeydown,
    handleTechInput
  }
}
