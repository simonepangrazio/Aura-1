function contactRequestUrl() {
  const apiUrl = import.meta.env.VITE_CONTACT_API_URL || ''
  return `${apiUrl}/contact/request`
}

export async function sendContactRequest(payload) {
  const response = await fetch(contactRequestUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      pageUrl: window.location.href,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Invio richiesta non riuscito')
  }

  return data
}
