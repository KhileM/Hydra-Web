// src/services/hydraService.js

const AUTH_URL = '/auth/connect/token'
const DATA_URL = '/api/Sensor/exportAggregatedNumbers?binBy=day'

let cachedToken = null
let tokenExpiry = null

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60_000) {
    return cachedToken
  }

  const body = new URLSearchParams({
    client_id:     import.meta.env.HYDRA_CLIENT_ID,
    client_secret: import.meta.env.HYDRA_CLIENT_SECRET,
    grant_type:    'password',
    scope:         'api1',
    username:      import.meta.env.HYDRA_USERNAME,
    password:      import.meta.env.HYDRA_PASSWORD,
  })

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  cachedToken = data.access_token
  // expires_in is in seconds, convert to ms timestamp
  tokenExpiry = Date.now() + data.expires_in * 1000

  return cachedToken
}

// ─── Fetch Energy Data ────────────────────────────────────────────────────────

export async function fetchEnergyData(site, dateRange) {
  const token = await getToken()

  const res = await fetch(DATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      useCsv:   false,
      deviceId: site.id,
      from:     dateRange.from,
      to:       dateRange.to,
      sensors:  [site.sensorId],
    }),
  })

  if (!res.ok) {
    throw new Error(`Data fetch failed: ${res.status} ${res.statusText}`)
  }

  const raw = await res.json()
  return transformEnergyData(raw)
}

// ─── Transform ────────────────────────────────────────────────────────────────

function transformEnergyData(raw) {
  return raw
    .map(entry => ({
      date: `${entry.year}-${String(entry.month).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`,
      kwh:  parseFloat(((entry.max - entry.min) / 1000).toFixed(2)),
    }))
    // Remove any days with negative or zero kWh (bad sensor readings)
    .filter(entry => entry.kwh > 0)
    // Sort ascending by date
    .sort((a, b) => a.date.localeCompare(b.date))
}
