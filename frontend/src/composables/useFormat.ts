const currency = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const currencyPrecise = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' })
const dayLabel = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function formatMoney(value: number, precise = false): string {
  return precise ? currencyPrecise.format(value) : currency.format(value)
}

export function formatSignedMoney(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${currency.format(Math.abs(value))}`
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toFixed(1)}%`
}

export function formatMonth(iso: string): string {
  return monthLabel.format(new Date(`${iso}T00:00:00Z`))
}

export function formatDate(iso: string): string {
  return dayLabel.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
}

export function trendClass(value: number): string {
  return value > 0 ? 'up' : value < 0 ? 'down' : 'dim'
}
