// src/components/ui/ErrorBanner.jsx
import { useEnergy, ACTIONS } from '../../context/EnergyContext'

export default function ErrorBanner() {
  const { state, dispatch } = useEnergy()

  if (!state.error) return null

  return (
    <div style={{
      background: '#fee2e2',
      border: '1px solid #fca5a5',
      borderRadius: 8,
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    }}>
      <span style={{ color: '#991b1b', fontSize: 14 }}>
        {state.error}
      </span>
      <button
        onClick={() => dispatch({ type: ACTIONS.CLEAR_ERROR })}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
      >
        ✕
      </button>
    </div>
  )
}
