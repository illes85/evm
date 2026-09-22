const dateFormatter = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return ''
  return dateFormatter.format(new Date(isoDate))
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(isoDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
