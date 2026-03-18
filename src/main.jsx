// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EnergyProvider } from './context/EnergyContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EnergyProvider>
      <App />
    </EnergyProvider>
  </StrictMode>
)
