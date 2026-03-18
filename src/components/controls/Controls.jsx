// src/components/controls/Controls.jsx
import DateRangePicker from './DateRangePicker'
import SiteSelector    from './SiteSelector'
import { useEnergy }   from '../../context/EnergyContext'
import { useEnergyData } from '../../hooks/useEnergyData'

export default function Controls() {
  const { state }  = useEnergy()
  const { load }   = useEnergyData()

  return (
    <div style={styles.bar}>
      <SiteSelector />

      <div style={styles.divider} />

      <DateRangePicker />

      <button
        onClick={load}
        disabled={state.loading}
        style={{
          ...styles.refreshBtn,
          ...(state.loading ? styles.refreshBtnDisabled : {}),
        }}
      >
        {state.loading ? 'Loading...' : 'Refresh'}
      </button>
    </div>
  )
}

const styles = {
  bar: {
    display:      'flex',
    alignItems:   'flex-end',
    flexWrap:     'wrap',
    gap:          20,
    padding:      '16px 24px',
    background:   '#ffffff',
    borderRadius: 12,
    border:       '1px solid #e5e7eb',
    marginBottom: 24,
  },
  divider: {
    width:      1,
    height:     48,
    background: '#e5e7eb',
  },
  refreshBtn: {
    padding:      '8px 20px',
    fontSize:     14,
    fontWeight:   500,
    borderRadius: 8,
    border:       'none',
    background:   '#1d4ed8',
    color:        '#ffffff',
    cursor:       'pointer',
    marginLeft:   'auto',
    transition:   'opacity 0.15s',
  },
  refreshBtnDisabled: {
    opacity: 0.5,
    cursor:  'not-allowed',
  },
}
