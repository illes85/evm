import type { VatBreakdownRow } from '../../utils/quoteCalculations'
import { formatCurrency } from '../../utils/money'

export function VatBreakdownTable({ rows }: { rows: VatBreakdownRow[] }) {
  if (rows.length <= 1) return null
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="py-1">ÁFA kulcs</th>
          <th className="py-1 text-right">Nettó</th>
          <th className="py-1 text-right">ÁFA</th>
          <th className="py-1 text-right">Bruttó</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.vatRateId} className="border-t border-slate-100">
            <td className="py-1">{row.label}</td>
            <td className="py-1 text-right">{formatCurrency(row.netTotal)}</td>
            <td className="py-1 text-right">{formatCurrency(row.vatAmount)}</td>
            <td className="py-1 text-right">{formatCurrency(row.grossTotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
