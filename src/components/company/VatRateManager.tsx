import { useState } from 'react'
import type { VatRate } from '../../types'
import { formatPercent } from '../../utils/money'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface VatRateManagerProps {
  vatRates: VatRate[]
  onCreate: (label: string, rate: number) => void
  onUpdate: (vatRate: VatRate) => void
  onDelete: (id: string) => void
}

export function VatRateManager({ vatRates, onCreate, onUpdate, onDelete }: VatRateManagerProps) {
  const [newLabel, setNewLabel] = useState('')
  const [newRate, setNewRate] = useState('')

  function handleAdd() {
    const rateValue = Number(newRate)
    if (!newLabel.trim() || Number.isNaN(rateValue)) return
    onCreate(newLabel.trim(), rateValue / 100)
    setNewLabel('')
    setNewRate('')
  }

  return (
    <div className="space-y-2">
      {vatRates.map((vatRate) => (
        <div key={vatRate.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
          <input
            className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
            value={vatRate.label}
            onChange={(e) => onUpdate({ ...vatRate, label: e.target.value })}
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="w-20 rounded border border-slate-200 px-2 py-1 text-right text-sm"
              value={Math.round(vatRate.rate * 1000) / 10}
              onChange={(e) => onUpdate({ ...vatRate, rate: Number(e.target.value) / 100 })}
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
          <Button variant="ghost" onClick={() => onDelete(vatRate.id)}>
            Törlés
          </Button>
        </div>
      ))}

      <div className="flex items-end gap-2 pt-2">
        <div className="flex-1">
          <Input label="Új ÁFA kulcs neve" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="pl. 5% ÁFA" />
        </div>
        <div className="w-24">
          <Input label="Kulcs (%)" type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="27" />
        </div>
        <Button onClick={handleAdd}>Hozzáadás</Button>
      </div>
      <p className="text-xs text-slate-400">
        Aktuális: {vatRates.map((r) => `${r.label} (${formatPercent(r.rate)})`).join(', ')}
      </p>
    </div>
  )
}
