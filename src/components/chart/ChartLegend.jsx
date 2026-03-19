// src/components/chart/ChartLegend.jsx

const LEGEND_ITEMS = [
  { color: '#1d4ed8', label: 'Daily usage (kWh)',    type: 'bar'    },
  { color: '#dc2626', label: 'Anomaly day',          type: 'dot'    },
  { color: '#0891b2', label: '7-day moving average', type: 'line'   },
  { color: '#f97316', label: 'Avg temperature (°C)', type: 'line'   },
  { color: '#8b5cf6', label: '3-day forecast',       type: 'area'   },
]

export default function ChartLegend() {
  return (
    <div style={styles.wrapper}>
      {LEGEND_ITEMS.map(item => (
        <div key={item.label} style={styles.item}>
          <LegendIcon type={item.type} color={item.color} />
          <span style={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function LegendIcon({ type, color }) {
  if (type === 'bar') {
    return <span style={{ ...styles.barIcon, background: color }} />
  }
  if (type === 'dot') {
    return <span style={{ ...styles.dotIcon, background: color }} />
  }
  if (type === 'area') {
    return (
      <span style={styles.areaIcon}>
        <span style={{ ...styles.areaFill, background: color }} />
        <span style={{ ...styles.areaLine, borderColor: color }} />
      </span>
    )
  }
  // line
  return (
    <span style={styles.lineIcon}>
      <span style={{ ...styles.lineStroke, background: color }} />
    </span>
  )
}

const styles = {
  wrapper: {
    display:        'flex',
    flexWrap:       'wrap',
    gap:            '8px 20px',
    padding:        '12px 0 4px',
    justifyContent: 'center',
  },
  item: {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
  },
  label: {
    fontSize: 12,
    color:    '#6b7280',
  },
  barIcon: {
    display:      'inline-block',
    width:        10,
    height:       14,
    borderRadius: 2,
  },
  dotIcon: {
    display:      'inline-block',
    width:        10,
    height:       10,
    borderRadius: '50%',
  },
  lineIcon: {
    display:    'inline-flex',
    alignItems: 'center',
    width:      16,
  },
  lineStroke: {
    display: 'block',
    width:   16,
    height:  2,
  },
  areaIcon: {
    display:  'inline-block',
    position: 'relative',
    width:    16,
    height:   14,
  },
  areaFill: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   8,
    opacity:  0.3,
  },
  areaLine: {
    position:    'absolute',
    top:         4,
    left:        0,
    right:       0,
    borderTop:   '2px solid',
  },
}
