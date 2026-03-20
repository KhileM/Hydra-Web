// src/utils/formatters.js

export function formatDate(dateStr, opts = {}) {
  const defaults = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return new Date(dateStr).toLocaleDateString('en-ZA', { ...defaults, ...opts })
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatKwh(kwh) {
  return kwh.toLocaleString('en-ZA', { maximumFractionDigits: 1 })
}

export function pctAbove(kwh, avg) {
  return ((kwh - avg) / avg * 100).toFixed(1)
}
