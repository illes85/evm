import { Plus, Trash2 } from "lucide-react";
import { newId } from "../../lib/id";
import { docTotal, formatCurrency, lineItemTotal } from "../../lib/format";
import type { DocLineItem } from "../../types/domain";
import { Button } from "../ui/Button";

export function LineItemsEditor({
  items,
  onChange,
}: {
  items: DocLineItem[];
  onChange: (items: DocLineItem[]) => void;
}) {
  function update(id: string, patch: Partial<DocLineItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function add() {
    onChange([...items, { id: newId(), description: "", quantity: 1, unit: "db", unitPrice: 0 }]);
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border p-3">
          <input
            value={item.description}
            onChange={(e) => update(item.id, { description: e.target.value })}
            placeholder="Tétel megnevezése"
            className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <div className="mt-2 grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2">
            <input
              value={item.quantity}
              onChange={(e) => update(item.id, { quantity: Number(e.target.value) || 0 })}
              type="number"
              min={0}
              step="any"
              placeholder="Menny."
              className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={item.unit}
              onChange={(e) => update(item.id, { unit: e.target.value })}
              placeholder="Egység"
              className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={item.unitPrice}
              onChange={(e) => update(item.id, { unitPrice: Number(e.target.value) || 0 })}
              type="number"
              min={0}
              placeholder="Egységár"
              className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label="Tétel törlése"
              className="flex size-9 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <p className="mt-1.5 text-right text-xs text-text-muted">
            {formatCurrency(lineItemTotal(item.quantity, item.unitPrice))}
          </p>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={add} icon={<Plus size={14} />}>
        Tétel hozzáadása
      </Button>

      <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
        <span className="text-sm font-medium text-text-muted">Végösszeg</span>
        <span className="text-lg font-bold text-primary">{formatCurrency(docTotal(items))}</span>
      </div>
    </div>
  );
}
