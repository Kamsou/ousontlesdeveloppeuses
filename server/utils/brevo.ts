const BREVO_BASE_URL = 'https://api.brevo.com/v3'

function getBrevoConfig() {
  const config = useRuntimeConfig()
  return {
    apiKey: config.brevoApiKey as string,
    listId: Number(config.brevoListId),
  }
}

function brevoFetch(path: string, body: Record<string, unknown>) {
  const { apiKey } = getBrevoConfig()

  return $fetch(`${BREVO_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body,
  })
}

export async function syncBrevoContact(email: string | null, name: string, optIn: boolean) {
  if (!email) return

  const { apiKey, listId } = getBrevoConfig()
  if (!apiKey || !listId) return

  if (optIn) {
    const [firstName, ...rest] = name.split(' ')
    await brevoFetch('/contacts', {
      email,
      attributes: {
        PRENOM: firstName || '',
        NOM: rest.join(' ') || '',
      },
      listIds: [listId],
      updateEnabled: true,
    })
  } else {
    await brevoFetch(`/contacts/lists/${listId}/contacts/remove`, {
      emails: [email],
    })
  }
}
