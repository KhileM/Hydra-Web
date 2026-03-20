// src/components/insights/InsightPanel.jsx
import { useEnergy } from '../../context/EnergyContext'
import { formatDate, formatKwh, pctAbove } from '../../utils/formatters'
import { SEVERITY_COLORS, TEMP_THRESHOLDS } from '../../utils/constants'

// ─── Weather Context Builder ──────────────────────────────────────────────────
// Translates raw weather numbers into plain-English phrases

function buildWeatherContext(day) {
  if (!day.tempAvg && !day.precipitation) return null

  const parts = []

  // Temperature narrative
  if (day.tempAvg != null) {
    if (day.tempAvg >= TEMP_THRESHOLDS.extreme) {
      parts.push(`temperatures were extreme at ${day.tempAvg}°C — well into heatwave territory`)
    } else if (day.tempAvg >= TEMP_THRESHOLDS.veryHot) {
      parts.push(`it was a very hot day at ${day.tempAvg}°C, driving heavy air-conditioning load`)
    } else if (day.tempAvg >= TEMP_THRESHOLDS.warm) {
      parts.push(`temperatures reached ${day.tempAvg}°C, likely increasing cooling demand`)
    } else if (day.tempAvg >= TEMP_THRESHOLDS.mild) {
      parts.push(`mild temperatures of ${day.tempAvg}°C suggest weather wasn't the primary driver`)
    } else if (day.tempAvg >= TEMP_THRESHOLDS.cool) {
      parts.push(`cool temperatures of ${day.tempAvg}°C may have increased heating demand`)
    } else {
      parts.push(`cold conditions at ${day.tempAvg}°C would have significantly raised heating load`)
    }
  }

  // Precipitation narrative
  if (day.precipitation != null) {
    if (day.precipitation >= 20) {
      parts.push(`heavy rainfall of ${day.precipitation}mm was recorded`)
    } else if (day.precipitation >= 5) {
      parts.push(`there was moderate rainfall of ${day.precipitation}mm`)
    } else if (day.precipitation > 0) {
      parts.push(`light rainfall of ${day.precipitation}mm was recorded`)
    } else {
      parts.push(`conditions were dry with no rainfall`)
    }
  }

  return parts.join(', and ')
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }) {
  const c = SEVERITY_COLORS[severity] || SEVERITY_COLORS.low

  return (
    <span style={{
      padding:      '3px 10px',
      borderRadius: 999,
      fontSize:     12,
      fontWeight:   600,
      background:   c.bg,
      color:        c.text,
    }}>
      {c.label}
    </span>
  )
}

// ─── Single Insight Card ──────────────────────────────────────────────────────

function InsightCard({ anomaly, rank, avgDailyKwh }) {
  const weatherContext = buildWeatherContext(anomaly)
  const pct            = pctAbove(anomaly.kwh, avgDailyKwh)
  const isWeatherDriven = anomaly.tempAvg >= TEMP_THRESHOLDS.veryHot || anomaly.tempAvg <= TEMP_THRESHOLDS.cool

  // Build the full plain-English insight sentence
  function buildInsight() {
    const base = `On ${formatDate(anomaly.date)}, the site consumed ${formatKwh(anomaly.kwh)} kWh — ${pct}% above the ${formatKwh(avgDailyKwh)} kWh daily average.`

    if (weatherContext) {
      const attribution = isWeatherDriven
        ? `This spike is consistent with weather-driven load: ${weatherContext}.`
        : `Weather data shows ${weatherContext}, though the spike may have non-weather causes such as equipment faults, extended operating hours, or a scheduled high-load process.`
      return `${base} ${attribution}`
    }

    return `${base} No weather data is available for this day — the spike may be linked to equipment behaviour, occupancy patterns, or an unscheduled high-load event.`
  }

  return (
    <div style={styles.card}>

      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <span style={styles.rankLabel}>#{rank} largest anomaly</span>
          <SeverityBadge severity={anomaly.anomalySeverity} />
        </div>
        <span style={styles.dateLabel}>{anomaly.date}</span>
      </div>

      {/* Metrics row */}
      <div style={styles.metricsRow}>
        <Metric
          label="Consumption"
          value={`${formatKwh(anomaly.kwh)} kWh`}
          highlight
        />
        <Metric
          label="7-day average"
          value={`${formatKwh(anomaly.movingAvg)} kWh`}
        />
        <Metric
          label="Above average"
          value={`+${pct}%`}
          highlight
        />
        {anomaly.zScore != null && (
          <Metric
            label="Z-score"
            value={anomaly.zScore}
          />
        )}
        {anomaly.tempAvg != null && (
          <Metric
            label="Avg temp"
            value={`${anomaly.tempAvg}°C`}
            color="#f97316"
          />
        )}
        {anomaly.precipitation != null && (
          <Metric
            label="Rainfall"
            value={`${anomaly.precipitation} mm`}
            color="#6366f1"
          />
        )}
      </div>

      {/* Plain-English insight */}
      <div style={styles.insightBox}>
        <span style={styles.insightIcon}>💡</span>
        <p style={styles.insightText}>{buildInsight()}</p>
      </div>

      {/* Weather-driven indicator */}
      {isWeatherDriven && anomaly.tempAvg != null && (
        <div style={styles.tag}>
          <span style={styles.tagDot} />
          Weather-correlated spike
        </div>
      )}

    </div>
  )
}

function Metric({ label, value, highlight, color }) {
  return (
    <div style={styles.metric}>
      <span style={styles.metricLabel}>{label}</span>
      <span style={{
        ...styles.metricValue,
        color: color || (highlight ? '#dc2626' : '#111827'),
        fontWeight: highlight ? 700 : 500,
      }}>
        {value}
      </span>
    </div>
  )
}

// ─── Forecast Insight ─────────────────────────────────────────────────────────

function ForecastInsight({ forecast, avgDailyKwh }) {
  if (!forecast.length) return null

  const avgForecast = forecast.reduce((s, d) => s + d.forecastKwh, 0) / forecast.length
  const trend = avgForecast > avgDailyKwh ? 'above' : 'below'
  const pct   = Math.abs(((avgForecast - avgDailyKwh) / avgDailyKwh) * 100).toFixed(1)

  return (
    <div style={{ ...styles.card, borderLeft: '3px solid #8b5cf6' }}>
      <div style={styles.cardHeader}>
        <span style={{ ...styles.rankLabel, color: '#8b5cf6' }}>
          3-day forecast
        </span>
      </div>

      <div style={styles.forecastDays}>
        {forecast.map(day => (
          <div key={day.date} style={styles.forecastDay}>
            <span style={styles.forecastDate}>
              {formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })}
            </span>
            <span style={styles.forecastKwh}>
              {formatKwh(day.forecastKwh)} kWh
            </span>
          </div>
        ))}
      </div>

      <div style={styles.insightBox}>
        <span style={styles.insightIcon}>📈</span>
        <p style={styles.insightText}>
          Based on recent consumption trends, the next 3 days are forecast to average{' '}
          <strong>{formatKwh(avgForecast)} kWh/day</strong> — {pct}% {trend} the
          current period average of {formatKwh(avgDailyKwh)} kWh.{' '}
          {avgForecast > avgDailyKwh
            ? 'Consider reviewing scheduled loads or equipment schedules to manage elevated consumption.'
            : 'Consumption appears to be trending downward — monitor to confirm the pattern holds.'
          }
        </p>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function NoAnomalies() {
  return (
    <div style={styles.empty}>
      <span style={styles.emptyIcon}>✅</span>
      <p style={styles.emptyTitle}>No anomalies detected</p>
      <p style={styles.emptyText}>
        All days in the selected period are within normal consumption range.
        Try extending the date range to surface longer-term patterns.
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InsightPanel() {
  const { state } = useEnergy()
  const { processedData, forecast, summary, loading } = state

  if (loading || !processedData.length) return null

  // Sort anomalies by how far above average they are — biggest spike first
  const anomalies = processedData
    .filter(d => d.isAnomaly)
    .sort((a, b) => (b.kwh - b.movingAvg) - (a.kwh - a.movingAvg))

  // Show top 3 anomalies maximum — enough detail without overwhelming
  const topAnomalies = anomalies.slice(0, 3)

  return (
    <div style={styles.wrapper}>

      <div style={styles.header}>
        <h2 style={styles.title}>Insights</h2>
        <span style={styles.subtitle}>
          {anomalies.length} anomalies detected in the selected period
        </span>
      </div>

      {topAnomalies.length === 0 ? (
        <NoAnomalies />
      ) : (
        <div style={styles.cards}>
          {topAnomalies.map((anomaly, i) => (
            <InsightCard
              key={anomaly.date}
              anomaly={anomaly}
              rank={i + 1}
              avgDailyKwh={summary.avgDailyKwh}
            />
          ))}
        </div>
      )}

      <ForecastInsight
        forecast={forecast}
        avgDailyKwh={summary.avgDailyKwh}
      />

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    marginBottom: 40,
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    marginBottom:   16,
  },
  title: {
    fontSize:   16,
    fontWeight: 600,
    color:      '#111827',
    margin:     0,
  },
  subtitle: {
    fontSize: 13,
    color:    '#6b7280',
  },
  cards: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    marginBottom:  16,
  },
  card: {
    background:   '#ffffff',
    border:       '1px solid #e5e7eb',
    borderRadius: 12,
    padding:      '20px 24px',
    display:      'flex',
    flexDirection:'column',
    gap:          16,
  },
  cardHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  cardHeaderLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
  },
  rankLabel: {
    fontSize:   13,
    fontWeight: 600,
    color:      '#374151',
  },
  dateLabel: {
    fontSize: 13,
    color:    '#6b7280',
  },
  metricsRow: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap:                 12,
    padding:             '12px 0',
    borderTop:           '1px solid #f3f4f6',
    borderBottom:        '1px solid #f3f4f6',
  },
  metric: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },
  metricLabel: {
    fontSize: 11,
    color:    '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  metricValue: {
    fontSize: 15,
  },
  insightBox: {
    display:     'flex',
    gap:         12,
    background:  '#f9fafb',
    borderRadius: 8,
    padding:     '12px 16px',
  },
  insightIcon: {
    fontSize:   18,
    flexShrink: 0,
    marginTop:  1,
  },
  insightText: {
    fontSize:   14,
    color:      '#374151',
    lineHeight: 1.65,
    margin:     0,
  },
  tag: {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
    fontSize:   12,
    color:      '#f97316',
    fontWeight: 500,
  },
  tagDot: {
    width:        6,
    height:       6,
    borderRadius: '50%',
    background:   '#f97316',
  },
  forecastDays: {
    display: 'flex',
    gap:     24,
  },
  forecastDay: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },
  forecastDate: {
    fontSize: 12,
    color:    '#9ca3af',
  },
  forecastKwh: {
    fontSize:   15,
    fontWeight: 600,
    color:      '#8b5cf6',
  },
  empty: {
    background:   '#f9fafb',
    border:       '1px solid #e5e7eb',
    borderRadius: 12,
    padding:      '40px 24px',
    textAlign:    'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
    display:  'block',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize:   16,
    fontWeight: 600,
    color:      '#111827',
    margin:     '0 0 8px',
  },
  emptyText: {
    fontSize: 14,
    color:    '#6b7280',
    margin:   0,
  },
}
