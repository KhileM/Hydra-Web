// src/services/weatherService.js

// Open-Meteo is free, no API key required
// Docs: https://open-meteo.com/en/docs/historical-weather-api
// Archive endpoint handles historical date ranges reliably
const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive'

// Coordinates for the HYDRA site (Western Cape, South Africa)
const SITE_COORDINATES = {
  latitude:  -33.9249,
  longitude:  18.4241,
}

// ─── Fetch Weather Data ───────────────────────────────────────────────────────

export async function fetchWeatherData(dateRange, { signal } = {}) {
  // Cap end_date to yesterday since archive API doesn't have today's data yet
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const maxDate = yesterday.toISOString().split('T')[0]
  const endDate = dateRange.to > maxDate ? maxDate : dateRange.to

  const params = new URLSearchParams({
    latitude:        SITE_COORDINATES.latitude,
    longitude:       SITE_COORDINATES.longitude,
    daily:           'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone:        'Africa/Johannesburg',
    start_date:      dateRange.from,
    end_date:        endDate,
  })

  const res = await fetch(`${BASE_URL}?${params}`, { signal })

  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return transformWeatherData(data)
}

// ─── Transform ────────────────────────────────────────────────────────────────

function transformWeatherData(raw) {
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = raw.daily

  return time.map((date, i) => ({
    date,
    tempMax:       temperature_2m_max[i],
    tempMin:       temperature_2m_min[i],
    tempAvg:       parseFloat(((temperature_2m_max[i] + temperature_2m_min[i]) / 2).toFixed(1)),
    precipitation: precipitation_sum[i],
  }))
}
