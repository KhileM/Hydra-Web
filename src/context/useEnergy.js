// src/context/useEnergy.js
import { createContext, useContext } from 'react'

export const EnergyContext = createContext(null)

export function useEnergy() {
  const context = useContext(EnergyContext)
  if (!context) {
    throw new Error('useEnergy must be used inside an EnergyProvider')
  }
  return context
}
