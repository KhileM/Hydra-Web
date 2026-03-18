// src/services/weatherService.js

// Open-Meteo is free, no API key required
// Docs: https://open-meteo.com/en/docs
const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Coordinates for the HYDRA site (Western Cape, South Africa)
const SITE_COORDINATES = {
  latitude:  -33.9249,
  longitude:  18.4241,
}

// ─── Fetch Weather Data ───────────────────────────────────────────────────────

export async function fetchWeatherData(dateRange) {
  const params = new URLSearchParams({
    latitude:        SITE_COORDINATES.latitude,
    longitude:       SITE_COORDINATES.longitude,
    daily:           'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone:        'Africa/Johannesburg',
    start_date:      dateRange.from,
    end_date:        dateRange.to,
    forecast_days:   1,
  })

  const res = await fetch(`${BASE_URL}?${params}`)

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
