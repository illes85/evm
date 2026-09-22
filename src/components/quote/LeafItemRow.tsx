import type { QuoteLeafItem, VatRate } from '../../types'
import { calculateLeafItemTotal } from '../../utils/quoteCalculations'
import { formatCurrency } from '../../utils/money'
import { VatRateSelect } from './VatRateSelect'

interface LeafItemRowProps {
  item: QuoteLeafItem
  vatRates: VatRate[]
  quoteDefaultVatRateId: string
  onUpdate: (patch: Partial<QuoteLeafItem>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function LeafItemRow({
  item,
  vatRates,
  quoteDefaultVatRateId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: LeafItemRowProps) {
  const total = calculateLeafItemTotal(item)

  return (
    <tr className="border-t border-slate-200">
      <td className="py-2 pl-2 pr-2">
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="text-xs leading-none text-slate-400 hover:text-slate-700 disabled:opacity-20"
              aria-label="Feljebb"
            >
              ▲
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="text-xs leading-none text-slate-400 hover:text-slate-700 disabled:opacity-20"
              aria-label="Lejjebb"
            >
              ▼
            </button>
          </div>
          <input
            className="w-full rounded border border-slate-200 px-2 py-1 text-sm font-medium"
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Tétel neve"
          />
        </div>
      </td>
      <td className="w-20 px-1 py-2">
        <input
          type="number"
          className="w-full rounded border border-slate-200 px-1.5 py-1 text-right text-sm"
          value={item.quantity}
          onChange={(e) => onUpdate({ quantity: Number(e.target.value) })}
        />
      </td>
      <td className="w-20 px-1 py-2">
        <input
          className="w-full rounded border border-slate-200 px-1.5 py-1 text-sm"
          value={item.unit}
          onChange={(e) => onUpdate({ unit: e.target.value })}
          list="unit-presets"
        />
      </td>
      <td className="w-28 px-1 py-2">
        <input
          type="number"
          className="w-full rounded border border-slate-200 px-1.5 py-1 text-right text-sm"
          value={item.unitPrice}
          onChange={(e) => onUpdate({ unitPrice: Number(e.target.value) })}
        />
      </td>
      <td className="w-28 px-1 py-2">
        <VatRateSelect
          value={item.vatRateId}
          vatRates={vatRates}
          quoteDefaultVatRateId={quoteDefaultVatRateId}
          onChange={(vatRateId) => onUpdate({ vatRateId })}
        />
      </td>
      <td className="w-28 px-2 py-2 text-right text-sm font-medium text-slate-800">{formatCurrency(total)}</td>
      <td className="w-8 px-2 py-2 text-right">
        <button onClick={onDelete} className="text-slate-400 hover:text-red-600" aria-label="Tétel törlése">
          ✕
        </button>
      </td>
    </tr>
  )
}
