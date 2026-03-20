// api/auth.js
import { buildAuthBody, AUTH_ENDPOINT } from './_shared/auth.js'

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(AUTH_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    buildAuthBody(),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Auth failed', detail: data })
    }

    return res.status(200).json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
