import { nanoid } from 'nanoid'
import type { QuoteGroupItem, QuoteItem, QuoteLeafItem, VatRate } from '../../types'
import { UNIT_PRESETS } from '../../utils/units'
import { Button } from '../ui/Button'
import { GroupItemRow } from './GroupItemRow'
import { LeafItemRow } from './LeafItemRow'

interface ItemsTableProps {
  items: QuoteItem[]
  vatRates: VatRate[]
  quoteDefaultVatRateId: string
  onChange: (items: QuoteItem[]) => void
}

function emptyLeafItem(order: number): QuoteLeafItem {
  return { id: nanoid(), kind: 'leaf', name: '', quantity: 1, unit: 'db', unitPrice: 0, order }
}

function emptyGroupItem(order: number): QuoteGroupItem {
  return { id: nanoid(), kind: 'group', name: '', subItems: [], order }
}

export function ItemsTable({ items, vatRates, quoteDefaultVatRateId, onChange }: ItemsTableProps) {
  const ordered = [...items].sort((a, b) => a.order - b.order)

  function updateItem(id: string, patch: Partial<QuoteItem>) {
    onChange(items.map((item) => (item.id === id ? ({ ...item, ...patch } as QuoteItem) : item)))
  }

  function deleteItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function moveItem(id: string, direction: -1 | 1) {
    const index = ordered.findIndex((item) => item.id === id)
    const swapIndex = index + direction
    if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return
    const a = ordered[index]
    const b = ordered[swapIndex]
    onChange(items.map((item) => {
      if (item.id === a.id) return { ...item, order: b.order }
      if (item.id === b.id) return { ...item, order: a.order }
      return item
    }))
  }

  function addLeafItem() {
    const nextOrder = ordered.length ? Math.max(...ordered.map((i) => i.order)) + 1 : 0
    onChange([...items, emptyLeafItem(nextOrder)])
  }

  function addGroupItem() {
    const nextOrder = ordered.length ? Math.max(...ordered.map((i) => i.order)) + 1 : 0
    onChange([...items, emptyGroupItem(nextOrder)])
  }

  return (
    <div>
      <datalist id="unit-presets">
        {UNIT_PRESETS.map((unit) => (
          <option key={unit} value={unit} />
        ))}
      </datalist>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 pl-2">Tétel</th>
              <th className="px-1 py-2">Menny.</th>
              <th className="px-1 py-2">Egység</th>
              <th className="px-1 py-2">Egységár</th>
              <th className="px-1 py-2">ÁFA</th>
              <th className="px-2 py-2 text-right">Nettó összeg</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {ordered.map((item, index) =>
              item.kind === 'leaf' ? (
                <LeafItemRow
                  key={item.id}
                  item={item}
                  vatRates={vatRates}
                  quoteDefaultVatRateId={quoteDefaultVatRateId}
                  onUpdate={(patch) => updateItem(item.id, patch)}
                  onDelete={() => deleteItem(item.id)}
                  onMoveUp={() => moveItem(item.id, -1)}
                  onMoveDown={() => moveItem(item.id, 1)}
                  canMoveUp={index > 0}
                  canMoveDown={index < ordered.length - 1}
                />
              ) : (
                <GroupItemRow
                  key={item.id}
                  item={item}
                  vatRates={vatRates}
                  quoteDefaultVatRateId={quoteDefaultVatRateId}
                  onUpdate={(patch) => updateItem(item.id, patch)}
                  onDelete={() => deleteItem(item.id)}
                  onMoveUp={() => moveItem(item.id, -1)}
                  onMoveDown={() => moveItem(item.id, 1)}
                  canMoveUp={index > 0}
                  canMoveDown={index < ordered.length - 1}
                />
              ),
            )}
            {ordered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Még nincs tétel felvéve.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={addLeafItem}>+ Tétel</Button>
        <Button onClick={addGroupItem}>+ Csoport (altételekkel)</Button>
      </div>
    </div>
  )
}
