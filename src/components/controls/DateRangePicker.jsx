// src/components/controls/DateRangePicker.jsx
import { useEnergy } from '../../context/useEnergy'
import { ACTIONS } from '../../context/energyActions'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

// ─── Preset Ranges ────────────────────────────────────────────────────────────

const today = new Date()

const PRESETS = [
  {
    label: 'Last 7 days',
    from:  format(subDays(today, 7), 'yyyy-MM-dd'),
    to:    format(today, 'yyyy-MM-dd'),
  },
  {
    label: 'Last 30 days',
    from:  format(subDays(today, 30), 'yyyy-MM-dd'),
    to:    format(today, 'yyyy-MM-dd'),
  },
  {
    label: 'This month',
    from:  format(startOfMonth(today), 'yyyy-MM-dd'),
    to:    format(today, 'yyyy-MM-dd'),
  },
  {
    label: 'Last month',
    from:  format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd'),
    to:    format(endOfMonth(subMonths(today, 1)),   'yyyy-MM-dd'),
  },
  {
    label: 'Last 90 days',
    from:  format(subDays(today, 90), 'yyyy-MM-dd'),
    to:    format(today, 'yyyy-MM-dd'),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function DateRangePicker() {
  const { state, dispatch } = useEnergy()
  const { dateRange, loading } = state

  function handlePreset(preset) {
    dispatch({
      type:    ACTIONS.SET_DATE_RANGE,
      payload: { from: preset.from, to: preset.to },
    })
  }

  function handleFromChange(e) {
    dispatch({
      type:    ACTIONS.SET_DATE_RANGE,
      payload: { ...dateRange, from: e.target.value },
    })
  }

  function handleToChange(e) {
    dispatch({
      type:    ACTIONS.SET_DATE_RANGE,
      payload: { ...dateRange, to: e.target.value },
    })
  }

  // Determine if a preset matches the current date range
  function isActivePreset(preset) {
    return preset.from === dateRange.from && preset.to === dateRange.to
  }

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>Date range</span>

      {/* Preset buttons */}
      <div style={styles.presets}>
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            disabled={loading}
            style={{
              ...styles.presetBtn,
              ...(isActivePreset(preset) ? styles.presetBtnActive : {}),
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Manual date inputs */}
      <div style={styles.inputs}>
        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>From</label>
          <input
            type="date"
            value={dateRange.from}
            max={dateRange.to}
            onChange={handleFromChange}
            disabled={loading}
            style={styles.input}
          />
        </div>

        <span style={styles.separator}>→</span>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>To</label>
          <input
            type="date"
            value={dateRange.to}
            min={dateRange.from}
            max={format(today, 'yyyy-MM-dd')}
            onChange={handleToChange}
            disabled={loading}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
  },
  label: {
    fontSize:   12,
    fontWeight: 500,
    color:      '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  presets: {
    display:  'flex',
    flexWrap: 'wrap',
    gap:      6,
  },
  presetBtn: {
    padding:      '4px 10px',
    fontSize:     13,
    borderRadius: 6,
    borderWidth:  1,
    borderStyle:  'solid',
    borderColor:  '#e5e7eb',
    background:   '#f9fafb',
    color:        '#374151',
    cursor:       'pointer',
    transition:   'all 0.15s',
  },
  presetBtnActive: {
    background:  '#1d4ed8',
    borderColor: '#1d4ed8',
    color:       '#ffffff',
  },
  inputs: {
    display:    'flex',
    alignItems: 'flex-end',
    gap:        12,
  },
  inputGroup: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },
  inputLabel: {
    fontSize: 12,
    color:    '#6b7280',
  },
  input: {
    padding:      '6px 10px',
    fontSize:     14,
    borderRadius: 6,
    border:       '1px solid #e5e7eb',
    background:   '#ffffff',
    color:        '#111827',
    cursor:       'pointer',
  },
  separator: {
    fontSize:    18,
    color:       '#9ca3af',
    paddingBottom: 6,
  },
}
