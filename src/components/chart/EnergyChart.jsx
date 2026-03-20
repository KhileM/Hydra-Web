// src/components/chart/EnergyChart.jsx
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { useEnergy }   from '../../context/EnergyContext'
import { CHART_COLORS } from '../../utils/constants'
import ChartTooltip    from './ChartTooltip'
import ChartLegend     from './ChartLegend'

// ─── Anomaly Dot ──────────────────────────────────────────────────────────────
// Custom shape rendered for each anomaly scatter point

function AnomalyDot(props) {
  const { cx, cy, payload } = props
  if (!payload.isAnomaly) return null

  const radius = payload.anomalySeverity === 'high'
    ? 7
    : payload.anomalySeverity === 'medium'
    ? 5
    : 4

  const color = payload.anomalySeverity === 'high'
    ? CHART_COLORS.anomaly
    : payload.anomalySeverity === 'medium'
    ? CHART_COLORS.temperature
    : '#fbbf24'

  return (
    <g>
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius + 3}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.4}
      />
      {/* Inner fill */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
    </g>
  )
}

// ─── Forecast Reference Line Label ───────────────────────────────────────────

function ForecastLabel({ viewBox }) {
  const { x, y } = viewBox
  return (
    <text
      x={x + 6}
      y={y - 6}
      fill="#8b5cf6"
      fontSize={11}
      fontWeight={500}
    >
      Forecast →
    </text>
  )
}

// ─── X Axis Tick ──────────────────────────────────────────────────────────────

function XAxisTick({ x, y, payload }) {
  const date  = new Date(payload.value)
  const day   = date.getDate()
  const month = date.toLocaleDateString('en-ZA', { month: 'short' })

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={12}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize={11}
      >
        {day}
      </text>
      {/* Only show month label on the 1st or first tick */}
      {day === 1 && (
        <text
          x={0} y={0} dy={24}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={10}
        >
          {month}
        </text>
      )}
    </g>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EnergyChart() {
  const { state } = useEnergy()
  const { processedData, forecast, loading, summary } = state

  if (loading) return <ChartSkeleton />
  if (!processedData.length) return null

  // Merge historical + forecast into one array for the chart
  // Forecast entries have kwh: null so bars don't render for them
  const chartData = [...processedData, ...forecast]

  // The date where forecast starts — used for the reference line
  const forecastStartDate = forecast[0]?.date

  // Build scatter data: only anomaly days, positioned at their kwh value
  const anomalyData = processedData
    .filter(d => d.isAnomaly)
    .map(d => ({ ...d, anomalyY: d.kwh }))

  // Y axis domain — add 15% headroom above the max value
  const maxKwh    = Math.max(...chartData.map(d => d.kwh ?? d.forecastKwh ?? 0))
  const yDomainKwh = [0, Math.ceil(maxKwh * 1.15)]

  // Second Y axis for temperature
  const temps     = processedData.filter(d => d.tempAvg != null).map(d => d.tempAvg)
  const yDomainTemp = temps.length
    ? [Math.floor(Math.min(...temps) - 5), Math.ceil(Math.max(...temps) + 5)]
    : [0, 50]

  return (
    <div style={styles.wrapper}>

      <div style={styles.header}>
        <h2 style={styles.title}>Energy consumption</h2>
        {summary.peakDay && (
          <span style={styles.peakBadge}>
            Peak: {summary.peakDay.kwh.toLocaleString()} kWh on {summary.peakDay.date}
          </span>
        )}
      </div>

      <ChartLegend />

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart
          data={chartData}
          margin={{ top: 16, right: 40, bottom: 24, left: 16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={<XAxisTick />}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            height={36}
          />

          {/* Left Y axis — kWh */}
          <YAxis
            yAxisId="kwh"
            orientation="left"
            domain={yDomainKwh}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />

          {/* Right Y axis — temperature */}
          <YAxis
            yAxisId="temp"
            orientation="right"
            domain={yDomainTemp}
            tickFormatter={v => `${v}°`}
            tick={{ fill: CHART_COLORS.temperature, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />

          <Tooltip content={<ChartTooltip />} />

          {/* Forecast start reference line */}
          {forecastStartDate && (
            <ReferenceLine
              x={forecastStartDate}
              yAxisId="kwh"
              stroke={CHART_COLORS.forecast}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={<ForecastLabel />}
            />
          )}

          {/* Average reference line */}
          {summary.avgDailyKwh > 0 && (
            <ReferenceLine
              y={summary.avgDailyKwh}
              yAxisId="kwh"
              stroke={CHART_COLORS.energy}
              strokeDasharray="2 4"
              strokeWidth={1}
              strokeOpacity={0.4}
            />
          )}

          {/* Energy bars — historical */}
          <Bar
            yAxisId="kwh"
            dataKey="kwh"
            fill={CHART_COLORS.energy}
            opacity={0.85}
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
            label={false}
          />

          {/* Forecast area */}
          <Area
            yAxisId="kwh"
            dataKey="forecastKwh"
            fill={CHART_COLORS.forecast}
            fillOpacity={0.15}
            stroke={CHART_COLORS.forecast}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
          />

          {/* 7-day moving average line */}
          <Line
            yAxisId="kwh"
            dataKey="movingAvg"
            stroke={CHART_COLORS.movingAvg}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS.movingAvg }}
            connectNulls
          />

          {/* Temperature overlay */}
          <Line
            yAxisId="temp"
            dataKey="tempAvg"
            stroke={CHART_COLORS.temperature}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: CHART_COLORS.temperature }}
            strokeDasharray="4 2"
            connectNulls
          />

          {/* Anomaly scatter dots */}
          <Scatter
            yAxisId="kwh"
            data={anomalyData}
            dataKey="anomalyY"
            shape={<AnomalyDot />}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div style={{ ...styles.wrapper, height: 480 }}>
      <div style={{ ...styles.skeletonTitle, width: 160 }} />
      <div style={styles.skeletonChart}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.skeletonBar,
              height: `${30 + Math.random() * 50}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    background:   '#ffffff',
    border:       '1px solid #e5e7eb',
    borderRadius: 12,
    padding:      '20px 24px',
    marginBottom: 24,
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   4,
  },
  title: {
    fontSize:   16,
    fontWeight: 600,
    color:      '#111827',
    margin:     0,
  },
  peakBadge: {
    fontSize:     12,
    color:        '#7c3aed',
    background:   '#f5f3ff',
    padding:      '3px 10px',
    borderRadius: 999,
    fontWeight:   500,
  },
  skeletonTitle: {
    height:       20,
    background:   '#f3f4f6',
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonChart: {
    display:     'flex',
    alignItems:  'flex-end',
    gap:         4,
    height:      360,
    padding:     '0 16px',
  },
  skeletonBar: {
    flex:         1,
    background:   '#f3f4f6',
    borderRadius: '2px 2px 0 0',
    animation:    'pulse 1.5s ease-in-out infinite',
  },
}
