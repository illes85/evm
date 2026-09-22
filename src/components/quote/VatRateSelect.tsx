import type { VatRate } from '../../types'
import { formatPercent } from '../../utils/money'

interface VatRateSelectProps {
  value: string | undefined
  vatRates: VatRate[]
  quoteDefaultVatRateId: string
  onChange: (vatRateId: string | undefined) => void
}

export function VatRateSelect({ value, vatRates, quoteDefaultVatRateId, onChange }: VatRateSelectProps) {
  const defaultRate = vatRates.find((r) => r.id === quoteDefaultVatRateId)
  return (
    <select
      className="w-28 rounded border border-slate-200 px-1.5 py-1 text-xs"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">Alap ({defaultRate ? formatPercent(defaultRate.rate) : '-'})</option>
      {vatRates.map((rate) => (
        <option key={rate.id} value={rate.id}>
          {formatPercent(rate.rate)}
        </option>
      ))}
    </select>
  )
}
