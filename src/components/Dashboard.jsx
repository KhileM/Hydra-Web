// src/components/Dashboard.jsx
import Controls    from './controls/Controls'
import SummaryCard from './summary/SummaryCard'
import EnergyChart from './chart/EnergyChart'
import InsightPanel from './insights/InsightPanel'
import ErrorBanner from './ui/ErrorBanner'
import { useEnergyData } from '../hooks/useEnergyData'

export default function Dashboard() {
  // Hook auto-fetches on mount and when site/dateRange changes
  useEnergyData()

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>⚡ HYDRA Energy Intelligence</h1>
        <p style={styles.subtitle}>Site energy monitoring and insight generation</p>
      </header>

      <ErrorBanner />
      <Controls />
      <SummaryCard />
      <EnergyChart />
      <InsightPanel />
    </div>
  )
}

const styles = {
  page: {
    maxWidth:  1200,
    margin:    '0 auto',
    padding:   '32px 24px',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize:   28,
    fontWeight: 700,
    color:      '#111827',
    margin:     0,
  },
  subtitle: {
    fontSize: 15,
    color:    '#6b7280',
    margin:   '4px 0 0',
  },
}
