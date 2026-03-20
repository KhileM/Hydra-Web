// api/energy.js
import { buildAuthBody, AUTH_ENDPOINT } from './_shared/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get a token first (server-to-server, no CORS issue)
    const authRes  = await fetch(AUTH_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    buildAuthBody(),
    })
    const authData = await authRes.json()

    if (!authRes.ok) {
      return res.status(authRes.status).json({ error: 'Auth failed' })
    }

    // Forward the energy data request
    const { deviceId, from, to, sensors } = req.body

    const dataRes = await fetch(
      'https://hydra-api.azurewebsites.net/Sensor/exportAggregatedNumbers?binBy=day',
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({ useCsv: false, deviceId, from, to, sensors }),
      }
    )

    const data = await dataRes.json()

    if (!dataRes.ok) {
      return res.status(dataRes.status).json({ error: 'Data fetch failed' })
    }

    return res.status(200).json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
