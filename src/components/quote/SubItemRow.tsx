import type { QuoteSubItem, VatRate } from '../../types'
import { calculateSubItemTotal } from '../../utils/quoteCalculations'
import { formatCurrency } from '../../utils/money'
import { VatRateSelect } from './VatRateSelect'

interface SubItemRowProps {
  subItem: QuoteSubItem
  vatRates: VatRate[]
  quoteDefaultVatRateId: string
  onUpdate: (patch: Partial<QuoteSubItem>) => void
  onDelete: () => void
}

export function SubItemRow({ subItem, vatRates, quoteDefaultVatRateId, onUpdate, onDelete }: SubItemRowProps) {
  const total = calculateSubItemTotal(subItem)

  return (
    <tr className="border-t border-slate-100 bg-slate-50/50">
      <td className="min-w-[140px] py-1.5 pl-8 pr-2">
        <input
          className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
          value={subItem.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Altétel neve"
        />
      </td>
      <td className="w-20 px-1 py-1.5">
        <input
          type="number"
          className="w-full rounded border border-slate-200 px-1.5 py-1 text-right text-sm"
          value={subItem.quantity}
          onChange={(e) => onUpdate({ quantity: Number(e.target.value) })}
        />
      </td>
      <td className="w-20 px-1 py-1.5">
        <input
          className="w-full rounded border border-slate-200 px-1.5 py-1 text-sm"
          value={subItem.unit}
          onChange={(e) => onUpdate({ unit: e.target.value })}
          list="unit-presets"
        />
      </td>
      <td className="w-28 px-1 py-1.5">
        <input
          type="number"
          className="w-full rounded border border-slate-200 px-1.5 py-1 text-right text-sm"
          value={subItem.unitPrice}
          onChange={(e) => onUpdate({ unitPrice: Number(e.target.value) })}
        />
      </td>
      <td className="w-28 px-1 py-1.5">
        <VatRateSelect
          value={subItem.vatRateId}
          vatRates={vatRates}
          quoteDefaultVatRateId={quoteDefaultVatRateId}
          onChange={(vatRateId) => onUpdate({ vatRateId })}
        />
      </td>
      <td className="w-28 px-2 py-1.5 text-right text-sm text-slate-700">{formatCurrency(total)}</td>
      <td className="w-8 px-2 py-1.5 text-right">
        <button onClick={onDelete} className="text-slate-400 hover:text-red-600" aria-label="Altétel törlése">
          ✕
        </button>
      </td>
    </tr>
  )
}
