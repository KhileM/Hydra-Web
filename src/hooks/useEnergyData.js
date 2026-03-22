// src/hooks/useEnergyData.js
import { useEffect, useCallback, useRef } from 'react'
import { useEnergy } from '../context/useEnergy'
import { ACTIONS } from '../context/energyActions'
import { fetchEnergyData } from '../services/hydraService'
import { fetchWeatherData } from '../services/weatherService'
import { processEnergyData } from '../utils/analyticsUtils'

export function useEnergyData() {
  const { state, dispatch } = useEnergy()
  const { selectedSite, dateRange } = state
  const abortRef = useRef(null)

  const load = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    dispatch({ type: ACTIONS.FETCH_START })

    try {
      const [energyRaw, weatherRaw] = await Promise.all([
        fetchEnergyData(selectedSite, dateRange, { signal: controller.signal }),
        fetchWeatherData(dateRange, { signal: controller.signal }),
      ])

      // If aborted between fetch and dispatch, bail out
      if (controller.signal.aborted) return

      dispatch({ type: ACTIONS.SET_ENERGY_DATA,  payload: energyRaw })
      dispatch({ type: ACTIONS.SET_WEATHER_DATA, payload: weatherRaw })

      const merged = energyRaw.map(day => {
        const weather = weatherRaw.find(w => w.date === day.date) || {}
        return { ...day, ...weather }
      })

      const { processedData, forecast, summary } = processEnergyData(merged)

      dispatch({
        type: ACTIONS.SET_PROCESSED_DATA,
        payload: { processedData, forecast, summary },
      })

    } catch (err) {
      if (err.name === 'AbortError') return

      const message = err.message.includes('Auth failed')
        ? 'Could not authenticate with HYDRA. Check your credentials in .env'
        : err.message.includes('Data fetch failed')
        ? 'Authenticated but failed to fetch energy data. Check site ID and date range.'
        : err.message

      dispatch({ type: ACTIONS.FETCH_ERROR, payload: message })
    }
  }, [selectedSite, dateRange, dispatch])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  return { load }
}
