import { nanoid } from 'nanoid'
import type { QuoteGroupItem, QuoteSubItem, VatRate } from '../../types'
import { calculateItemNetTotal } from '../../utils/quoteCalculations'
import { formatCurrency } from '../../utils/money'
import { SubItemRow } from './SubItemRow'

interface GroupItemRowProps {
  item: QuoteGroupItem
  vatRates: VatRate[]
  quoteDefaultVatRateId: string
  onUpdate: (patch: Partial<QuoteGroupItem>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function emptySubItem(): QuoteSubItem {
  return { id: nanoid(), name: '', quantity: 1, unit: 'db', unitPrice: 0 }
}

export function GroupItemRow({
  item,
  vatRates,
  quoteDefaultVatRateId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: GroupItemRowProps) {
  const total = calculateItemNetTotal(item)

  function updateSubItem(subId: string, patch: Partial<QuoteSubItem>) {
    onUpdate({ subItems: item.subItems.map((s) => (s.id === subId ? { ...s, ...patch } : s)) })
  }

  function deleteSubItem(subId: string) {
    onUpdate({ subItems: item.subItems.filter((s) => s.id !== subId) })
  }

  function addSubItem() {
    onUpdate({ subItems: [...item.subItems, emptySubItem()] })
  }

  return (
    <>
      <tr className="border-t border-slate-200 bg-blue-50/50">
        <td className="py-2 pl-2 pr-2" colSpan={4}>
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
              className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm font-semibold"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Csoport neve (pl. Fürdőszoba felújítás)"
            />
          </div>
        </td>
        <td className="w-28 px-2 py-2 text-right text-sm font-semibold text-slate-800">{formatCurrency(total)}</td>
        <td className="w-8 px-2 py-2 text-right">
          <button onClick={onDelete} className="text-slate-400 hover:text-red-600" aria-label="Csoport törlése">
            ✕
          </button>
        </td>
      </tr>
      {item.subItems.map((sub) => (
        <SubItemRow
          key={sub.id}
          subItem={sub}
          vatRates={vatRates}
          quoteDefaultVatRateId={quoteDefaultVatRateId}
          onUpdate={(patch) => updateSubItem(sub.id, patch)}
          onDelete={() => deleteSubItem(sub.id)}
        />
      ))}
      <tr className="border-t border-slate-100 bg-slate-50/50">
        <td colSpan={7} className="py-1 pl-8">
          <button onClick={addSubItem} className="text-xs font-medium text-blue-600 hover:underline">
            + Altétel hozzáadása
          </button>
        </td>
      </tr>
    </>
  )
}
