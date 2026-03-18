// src/App.jsx — temporary auth smoke test, remove before submitting
import { useEffect } from 'react'
import { fetchEnergyData } from './services/hydraService'

export default function App() {
  useEffect(() => {
    const site = {
      id:       import.meta.env.HYDRA_DEVICE_ID,
      sensorId: import.meta.env.HYDRA_SENSOR_ID,
    }
    const dateRange = { from: '2025-03-01', to: '2025-03-07' }

    fetchEnergyData(site, dateRange)
      .then(data => console.log('Auth + fetch success:', data))
      .catch(err => console.error('Failed:', err.message))
  }, [])

  return <div>Testing auth...</div>
}
