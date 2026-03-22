// src/context/EnergyContext.jsx
import { useReducer } from 'react'
import { subDays, format } from 'date-fns'
import { ACTIONS } from './energyActions'
import { EnergyContext } from './useEnergy'

// ─── Initial State ────────────────────────────────────────────────────────────

const today = new Date()

const initialState = {
  // Controls
  selectedSite: {
    id: '38394d4c-cb8e-ef11-a81c-6045bd88aa3b',
    sensorId: '470b1334-0000-0001-0000-000000000000',
    name: 'Site WC-04',
  },
  dateRange: {
    from: format(subDays(today, 30), 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
  },

  // Raw API data
  rawEnergyData: [],
  rawWeatherData: [],

  // Processed analytics
  processedData: [],     // [{date, kwh, movingAvg, isAnomaly, temp}]
  forecast: [],          // [{date, kwh, isForecast: true}]
  summary: {
    totalKwh: 0,
    avgDailyKwh: 0,
    anomalyCount: 0,
    peakDay: null,
  },

  // UI state
  loading: false,
  error: null,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function energyReducer(state, action) {
  switch (action.type) {

    case ACTIONS.SET_SITE:
      return {
        ...state,
        selectedSite: action.payload,
        // Clear old data when site changes
        rawEnergyData: [],
        processedData: [],
        forecast: [],
        summary: initialState.summary,
      }

    case ACTIONS.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload,
      }

    case ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case ACTIONS.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case ACTIONS.SET_ENERGY_DATA:
      return {
        ...state,
        rawEnergyData: action.payload,
        loading: false,
      }

    case ACTIONS.SET_WEATHER_DATA:
      return {
        ...state,
        rawWeatherData: action.payload,
      }

    case ACTIONS.SET_PROCESSED_DATA:
      return {
        ...state,
        processedData: action.payload.processedData,
        forecast: action.payload.forecast,
        summary: action.payload.summary,
      }

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// ─── Context + Provider ───────────────────────────────────────────────────────

export function EnergyProvider({ children }) {
  const [state, dispatch] = useReducer(energyReducer, initialState)

  return (
    <EnergyContext.Provider value={{ state, dispatch }}>
      {children}
    </EnergyContext.Provider>
  )
}
