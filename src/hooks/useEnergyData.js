// src/hooks/useEnergyData.js
import { useEffect } from 'react'
import { useEnergy, ACTIONS } from '../context/EnergyContext'
import { fetchEnergyData } from '../services/hydraService'
import { fetchWeatherData } from '../services/weatherService'
import { processEnergyData } from '../utils/analyticsUtils'

export function useEnergyData() {
  const { state, dispatch } = useEnergy()
  const { selectedSite, dateRange } = state

  useEffect(() => {
    load()
  }, [selectedSite.id, dateRange.from, dateRange.to])

  async function load() {
    dispatch({ type: ACTIONS.FETCH_START })

    try {
      // Fetch both in parallel
      const [energyRaw, weatherRaw] = await Promise.all([
        fetchEnergyData(selectedSite, dateRange),
        fetchWeatherData(dateRange),
      ])

      dispatch({ type: ACTIONS.SET_ENERGY_DATA,  payload: energyRaw })
      dispatch({ type: ACTIONS.SET_WEATHER_DATA, payload: weatherRaw })

      // Merge weather into energy data by matching on date
      const merged = energyRaw.map(day => {
        const weather = weatherRaw.find(w => w.date === day.date) || {}
        return { ...day, ...weather }
      })

      // Run analytics on merged data
      const { processedData, forecast, summary } = processEnergyData(merged)

      dispatch({
        type: ACTIONS.SET_PROCESSED_DATA,
        payload: { processedData, forecast, summary },
      })

    } catch (err) {
      const message = err.message.includes('Auth failed')
        ? 'Could not authenticate with HYDRA. Check your credentials in .env'
        : err.message.includes('Data fetch failed')
        ? 'Authenticated but failed to fetch energy data. Check site ID and date range.'
        : err.message

      dispatch({ type: ACTIONS.FETCH_ERROR, payload: message })
    }
  }

  return { load }
}
