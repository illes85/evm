import type { QuoteTotals } from '../../utils/quoteCalculations'
import { formatCurrency } from '../../utils/money'
import { VatBreakdownTable } from './VatBreakdownTable'

export function TotalsSummary({ totals }: { totals: QuoteTotals }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <VatBreakdownTable rows={totals.vatBreakdown} />
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Nettó összesen</span>
          <span>{formatCurrency(totals.netTotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>ÁFA összesen</span>
          <span>{formatCurrency(totals.vatAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
          <span>Bruttó végösszeg</span>
          <span>{formatCurrency(totals.grossTotal)}</span>
        </div>
      </div>
    </div>
  )
}
