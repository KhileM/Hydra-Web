// src/utils/analyticsUtils.js

// ─── kWh Calculation ──────────────────────────────────────────────────────────
// Already done in hydraService.js transform (max - min / 1000)
// but exported here for testing and transparency

export function calcKwh(max, min) {
  return parseFloat(((max - min) / 1000).toFixed(2))
}

// ─── 7-Day Moving Average ─────────────────────────────────────────────────────
// For each day, average the current day + 6 days before it.
// Days with fewer than 7 predecessors use whatever is available (no null padding).

export function calcMovingAverage(data, window = 7) {
  return data.map((day, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1)
    const avg = slice.reduce((sum, d) => sum + d.kwh, 0) / slice.length
    return {
      ...day,
      movingAvg: parseFloat(avg.toFixed(2)),
    }
  })
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────
// A day is an anomaly if its kWh exceeds its moving average.
// We also attach a severity: how many standard deviations above the mean.

export function detectAnomalies(data) {
  const kwhValues = data.map(d => d.kwh)
  const mean = kwhValues.reduce((a, b) => a + b, 0) / kwhValues.length
  const stdDev = Math.sqrt(
    kwhValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / kwhValues.length
  )

  return data.map(day => {
    const isAnomaly = day.movingAvg !== undefined
      ? day.kwh > day.movingAvg
      : false

    const zScore = stdDev > 0
      ? parseFloat(((day.kwh - mean) / stdDev).toFixed(2))
      : 0

    return {
      ...day,
      isAnomaly,
      zScore,
      // Severity tiers for chart styling
      anomalySeverity: !isAnomaly
        ? null
        : zScore > 2
        ? 'high'
        : zScore > 1
        ? 'medium'
        : 'low',
    }
  })
}

// ─── 3-Day Forecast ───────────────────────────────────────────────────────────
// Simple linear regression over the full dataset.
// Returns 3 future date entries with predicted kWh values.

export function calcForecast(data, days = 3) {
  const n = data.length
  if (n < 2) return []

  // Assign each data point an index (x) and use kwh as y
  const xValues = data.map((_, i) => i)
  const yValues = data.map(d => d.kwh)

  const xMean = xValues.reduce((a, b) => a + b, 0) / n
  const yMean = yValues.reduce((a, b) => a + b, 0) / n

  const numerator   = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0)
  const denominator = xValues.reduce((sum, x)    => sum + Math.pow(x - xMean, 2), 0)

  const slope     = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean

  // Get the last date in the dataset to calculate future dates from
  const lastDate = new Date(data[n - 1].date)

  return Array.from({ length: days }, (_, i) => {
    const futureDate = new Date(lastDate)
    futureDate.setDate(futureDate.getDate() + i + 1)

    const predictedKwh = slope * (n + i) + intercept

    return {
      date:       futureDate.toISOString().split('T')[0],
      kwh:        null,                                        // No real value
      forecastKwh: parseFloat(Math.max(0, predictedKwh).toFixed(2)),
      isForecast: true,
    }
  })
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

export function calcSummary(data) {
  if (!data.length) {
    return { totalKwh: 0, avgDailyKwh: 0, anomalyCount: 0, peakDay: null }
  }

  const totalKwh = parseFloat(
    data.reduce((sum, d) => sum + d.kwh, 0).toFixed(2)
  )

  const avgDailyKwh = parseFloat(
    (totalKwh / data.length).toFixed(2)
  )

  const anomalyCount = data.filter(d => d.isAnomaly).length

  const peakDay = data.reduce((peak, d) =>
    d.kwh > (peak?.kwh ?? 0) ? d : peak, null
  )

  return { totalKwh, avgDailyKwh, anomalyCount, peakDay }
}

// ─── Master Function ──────────────────────────────────────────────────────────
// Called by useEnergyData hook with merged energy + weather data.
// Runs the full pipeline and returns everything the UI needs.

export function processEnergyData(mergedData) {
  if (!mergedData.length) {
    return {
      processedData: [],
      forecast:      [],
      summary:       { totalKwh: 0, avgDailyKwh: 0, anomalyCount: 0, peakDay: null },
    }
  }

  // Pipeline: moving average → anomaly detection
  const withMovingAvg = calcMovingAverage(mergedData)
  const withAnomalies = detectAnomalies(withMovingAvg)

  // Forecast runs on clean data before anomaly flags
  const forecast = calcForecast(mergedData)

  // Summary runs on fully processed data
  const summary = calcSummary(withAnomalies)

  return {
    processedData: withAnomalies,
    forecast,
    summary,
  }
}
