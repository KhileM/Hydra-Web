// src/utils/constants.js

export const SEVERITY_COLORS = {
  high:   { bg: '#fee2e2', text: '#991b1b', label: 'High severity' },
  medium: { bg: '#ffedd5', text: '#9a3412', label: 'Medium severity' },
  low:    { bg: '#fef9c3', text: '#854d0e', label: 'Low severity' },
}

export const CHART_COLORS = {
  energy:     '#1d4ed8',
  anomaly:    '#dc2626',
  movingAvg:  '#0891b2',
  temperature:'#f97316',
  forecast:   '#8b5cf6',
  precipitation: '#6366f1',
}

export const TEMP_THRESHOLDS = {
  extreme: 35,
  veryHot: 28,
  warm:    22,
  mild:    15,
  cool:    8,
}
