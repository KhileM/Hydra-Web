// src/components/ui/ErrorBoundary.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={styles.wrapper}>
        <h2 style={styles.title}>Something went wrong</h2>
        <p style={styles.message}>{this.state.error.message}</p>
        <button
          style={styles.button}
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    )
  }
}

const styles = {
  wrapper: {
    maxWidth:     480,
    margin:       '80px auto',
    padding:      '32px 24px',
    textAlign:    'center',
    background:   '#fef2f2',
    border:       '1px solid #fecaca',
    borderRadius: 12,
  },
  title: {
    fontSize:   18,
    fontWeight: 600,
    color:      '#991b1b',
    margin:     '0 0 8px',
  },
  message: {
    fontSize: 14,
    color:    '#374151',
    margin:   '0 0 20px',
  },
  button: {
    padding:      '8px 20px',
    fontSize:     14,
    fontWeight:   500,
    color:        '#ffffff',
    background:   '#dc2626',
    border:       'none',
    borderRadius: 8,
    cursor:       'pointer',
  },
}
