import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useParams } from 'react-router-dom'
import { db } from '../db/db'
import { QuotePrintLayout } from '../print/QuotePrintLayout'

export function QuotePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const quote = useLiveQuery(() => (id ? db.quotes.get(id) : undefined), [id])
  const vatRates = useLiveQuery(() => db.vatRates.toArray(), [], [])

  if (!quote || !vatRates) {
    return <div className="p-6 text-slate-500">Betöltés...</div>
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <style>{'@page { size: A4; margin: 14mm; }'}</style>
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <Link to={`/quotes/${quote.id}`} className="text-sm text-blue-600 hover:underline">
          ← Vissza a szerkesztéshez
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nyomtatás / Mentés PDF-ként
        </button>
      </div>
      <div className="py-8">
        <QuotePrintLayout quote={quote} vatRates={vatRates} />
      </div>
    </div>
  )
}
