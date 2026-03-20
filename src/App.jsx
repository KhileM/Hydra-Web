// src/App.jsx
import ErrorBoundary from './components/ui/ErrorBoundary'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  )
}
