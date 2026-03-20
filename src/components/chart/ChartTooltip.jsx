// src/components/chart/ChartTooltip.jsx
import { CHART_COLORS } from '../../utils/constants'

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload || {}

  return (
    <div style={styles.wrapper}>
      <p style={styles.date}>{label}</p>
      <div style={styles.divider} />

      {data.isForecast ? (
        <Row
          color={CHART_COLORS.forecast}
          label="Forecast"
          value={`${data.forecastKwh?.toLocaleString()} kWh`}
        />
      ) : (
        <>
          {data.kwh != null && (
            <Row
              color={data.isAnomaly ? CHART_COLORS.anomaly : CHART_COLORS.energy}
              label={data.isAnomaly ? `Usage ⚠ ${data.anomalySeverity}` : 'Usage'}
              value={`${data.kwh?.toLocaleString()} kWh`}
            />
          )}
          {data.movingAvg != null && (
            <Row
              color={CHART_COLORS.movingAvg}
              label="7-day avg"
              value={`${data.movingAvg?.toLocaleString()} kWh`}
            />
          )}
          {data.tempAvg != null && (
            <Row
              color={CHART_COLORS.temperature}
              label="Avg temp"
              value={`${data.tempAvg}°C`}
            />
          )}
          {data.precipitation != null && (
            <Row
              color={CHART_COLORS.precipitation}
              label="Precipitation"
              value={`${data.precipitation} mm`}
            />
          )}
          {data.zScore != null && data.isAnomaly && (
            <Row
              color="#9ca3af"
              label="Z-score"
              value={data.zScore}
            />
          )}
        </>
      )}
    </div>
  )
}

function Row({ color, label, value }) {
  return (
    <div style={styles.row}>
      <span style={{ ...styles.dot, background: color }} />
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  )
}

const styles = {
  wrapper: {
    background:   '#ffffff',
    border:       '1px solid #e5e7eb',
    borderRadius: 10,
    padding:      '10px 14px',
    fontSize:     13,
    boxShadow:    '0 4px 12px rgba(0,0,0,0.08)',
    minWidth:     200,
  },
  date: {
    fontWeight:   600,
    color:        '#111827',
    margin:       '0 0 6px',
    fontSize:     13,
  },
  divider: {
    height:       1,
    background:   '#f3f4f6',
    margin:       '6px 0',
  },
  row: {
    display:        'flex',
    alignItems:     'center',
    gap:            8,
    padding:        '3px 0',
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    flexShrink:   0,
  },
  rowLabel: {
    color:    '#6b7280',
    flex:     1,
  },
  rowValue: {
    color:      '#111827',
    fontWeight: 500,
  },
}
