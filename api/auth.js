// api/auth.js
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = new URLSearchParams({
      client_id:     process.env.HYDRA_CLIENT_ID,
      client_secret: process.env.HYDRA_CLIENT_SECRET,
      grant_type:    'password',
      scope:         'api1',
      username:      process.env.HYDRA_USERNAME,
      password:      process.env.HYDRA_PASSWORD,
    })

    const response = await fetch('https://identity.hydra.africa/connect/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
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
