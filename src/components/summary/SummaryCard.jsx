// src/components/summary/SummaryCard.jsx
import { useEnergy } from '../../context/EnergyContext'

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, sub, accent }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${accent}` }}>
      <span style={styles.cardLabel}>{label}</span>
      <div style={styles.cardValueRow}>
        <span style={{ ...styles.cardValue, color: accent }}>{value}</span>
        {unit && <span style={styles.cardUnit}>{unit}</span>}
      </div>
      {sub && <span style={styles.cardSub}>{sub}</span>}
    </div>
  )
}

// ─── Anomaly Breakdown ────────────────────────────────────────────────────────

function AnomalyBreakdown({ data }) {
  const high   = data.filter(d => d.anomalySeverity === 'high').length
  const medium = data.filter(d => d.anomalySeverity === 'medium').length
  const low    = data.filter(d => d.anomalySeverity === 'low').length

  if (!high && !medium && !low) return null

  return (
    <div style={styles.breakdown}>
      {high > 0 && (
        <span style={{ ...styles.pill, background: '#fee2e2', color: '#991b1b' }}>
          {high} high
        </span>
      )}
      {medium > 0 && (
        <span style={{ ...styles.pill, background: '#ffedd5', color: '#9a3412' }}>
          {medium} medium
        </span>
      )}
      {low > 0 && (
        <span style={{ ...styles.pill, background: '#fef9c3', color: '#854d0e' }}>
          {low} low
        </span>
      )}
    </div>
  )
}

// ─── Peak Day Card ────────────────────────────────────────────────────────────

function PeakDayCard({ peakDay }) {
  if (!peakDay) return null

  const date = new Date(peakDay.date)
  const formatted = date.toLocaleDateString('en-ZA', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })

  return (
    <div style={{ ...styles.card, borderTop: '3px solid #8b5cf6' }}>
      <span style={styles.cardLabel}>Peak day</span>
      <div style={styles.cardValueRow}>
        <span style={{ ...styles.cardValue, color: '#8b5cf6' }}>
          {peakDay.kwh.toLocaleString()}
        </span>
        <span style={styles.cardUnit}>kWh</span>
      </div>
      <span style={styles.cardSub}>{formatted}</span>
      {peakDay.tempAvg && (
        <span style={styles.cardSub}>
          {peakDay.tempAvg}°C avg temp
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SummaryCard() {
  const { state } = useEnergy()
  const { summary, processedData, dateRange, loading } = state

  if (loading) return <SummaryCardSkeleton />

  if (!processedData.length) return null

  // Date range display
  const fromFormatted = new Date(dateRange.from).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const toFormatted = new Date(dateRange.to).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  // Trend vs previous period (compare first half to second half of dataset)
  const mid        = Math.floor(processedData.length / 2)
  const firstHalf  = processedData.slice(0, mid)
  const secondHalf = processedData.slice(mid)
  const firstAvg   = firstHalf.reduce((s, d)  => s + d.kwh, 0) / firstHalf.length
  const secondAvg  = secondHalf.reduce((s, d) => s + d.kwh, 0) / secondHalf.length
  const trendPct   = firstAvg > 0
    ? parseFloat(((secondAvg - firstAvg) / firstAvg * 100).toFixed(1))
    : 0
  const trendLabel = trendPct > 0
    ? `↑ ${trendPct}% vs earlier period`
    : trendPct < 0
    ? `↓ ${Math.abs(trendPct)}% vs earlier period`
    : 'Stable vs earlier period'
  const trendColor = trendPct > 0 ? '#dc2626' : trendPct < 0 ? '#16a34a' : '#6b7280'

  return (
    <div style={styles.wrapper}>

      {/* Period label */}
      <div style={styles.periodRow}>
        <span style={styles.periodLabel}>
          {fromFormatted} — {toFormatted}
        </span>
        <span style={{ ...styles.trendBadge, color: trendColor }}>
          {trendLabel}
        </span>
      </div>

      {/* Stat cards row */}
      <div style={styles.grid}>

        <StatCard
          label="Total consumption"
          value={summary.totalKwh.toLocaleString()}
          unit="kWh"
          sub={`across ${processedData.length} days`}
          accent="#1d4ed8"
        />

        <StatCard
          label="Daily average"
          value={summary.avgDailyKwh.toLocaleString()}
          unit="kWh/day"
          sub="mean daily consumption"
          accent="#0891b2"
        />

        <div style={{ ...styles.card, borderTop: '3px solid #dc2626' }}>
          <span style={styles.cardLabel}>Anomalies detected</span>
          <div style={styles.cardValueRow}>
            <span style={{ ...styles.cardValue, color: '#dc2626' }}>
              {summary.anomalyCount}
            </span>
            <span style={styles.cardUnit}>
              days above average
            </span>
          </div>
          <AnomalyBreakdown data={processedData} />
        </div>

        <PeakDayCard peakDay={summary.peakDay} />

      </div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.grid}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={styles.card}>
            <div style={{ ...styles.skeletonLine, width: '60%', height: 12 }} />
            <div style={{ ...styles.skeletonLine, width: '80%', height: 32, margin: '8px 0' }} />
            <div style={{ ...styles.skeletonLine, width: '50%', height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    marginBottom: 24,
  },
  periodRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  periodLabel: {
    fontSize:   13,
    color:      '#6b7280',
    fontWeight: 500,
  },
  trendBadge: {
    fontSize:   13,
    fontWeight: 500,
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap:                 16,
  },
  card: {
    background:   '#ffffff',
    border:       '1px solid #e5e7eb',
    borderRadius: 12,
    padding:      '16px 20px',
    display:      'flex',
    flexDirection:'column',
    gap:          4,
  },
  cardLabel: {
    fontSize:      12,
    fontWeight:    500,
    color:         '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardValueRow: {
    display:    'flex',
    alignItems: 'baseline',
    gap:        6,
    margin:     '4px 0',
  },
  cardValue: {
    fontSize:   28,
    fontWeight: 700,
    lineHeight: 1,
  },
  cardUnit: {
    fontSize: 13,
    color:    '#9ca3af',
  },
  cardSub: {
    fontSize: 12,
    color:    '#9ca3af',
  },
  breakdown: {
    display:   'flex',
    flexWrap:  'wrap',
    gap:       6,
    marginTop: 4,
  },
  pill: {
    padding:      '2px 8px',
    borderRadius: 999,
    fontSize:     11,
    fontWeight:   500,
  },
  skeletonLine: {
    background:   '#f3f4f6',
    borderRadius: 4,
    animation:    'pulse 1.5s ease-in-out infinite',
  },
}
