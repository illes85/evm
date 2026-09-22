const currencyFormatter = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('hu-HU', {
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 1000) / 10}%`
}
