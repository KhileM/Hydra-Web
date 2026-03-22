// src/components/controls/SiteSelector.jsx
import { useEnergy } from '../../context/useEnergy'
import { ACTIONS } from '../../context/energyActions'

// ─── Available Sites ──────────────────────────────────────────────────────────
// The case study only provides one site — add more here as they become available

const SITES = [
  {
    id:       '38394d4c-cb8e-ef11-a81c-6045bd88aa3b',
    sensorId: '470b1334-0000-0001-0000-000000000000',
    name:     'Site WC-04',
    location: 'Western Cape',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function SiteSelector() {
  const { state, dispatch } = useEnergy()
  const { selectedSite, loading } = state

  function handleChange(e) {
    const site = SITES.find(s => s.id === e.target.value)
    if (!site) return

    dispatch({
      type:    ACTIONS.SET_SITE,
      payload: site,
    })
  }

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>Site</span>

      <div style={styles.selectWrapper}>
        <select
          value={selectedSite.id}
          onChange={handleChange}
          disabled={loading || SITES.length === 1}
          style={{
            ...styles.select,
            ...(loading ? styles.selectDisabled : {}),
          }}
        >
          {SITES.map(site => (
            <option key={site.id} value={site.id}>
              {site.name} — {site.location}
            </option>
          ))}
        </select>

        {/* Active site badge */}
        <span style={styles.badge}>
          {selectedSite.name}
        </span>
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
    fontSize:      12,
    fontWeight:    500,
    color:         '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  selectWrapper: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
  },
  select: {
    padding:      '8px 12px',
    fontSize:     14,
    borderRadius: 8,
    border:       '1px solid #e5e7eb',
    background:   '#ffffff',
    color:        '#111827',
    cursor:       'pointer',
    minWidth:     200,
  },
  selectDisabled: {
    opacity: 0.5,
    cursor:  'not-allowed',
  },
  badge: {
    padding:      '3px 8px',
    fontSize:     12,
    borderRadius: 999,
    background:   '#dcfce7',
    color:        '#166534',
    fontWeight:   500,
  },
}
