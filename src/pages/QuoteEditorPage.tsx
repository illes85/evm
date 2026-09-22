import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ClientPicker } from '../components/client/ClientPicker'
import { ItemsTable } from '../components/quote/ItemsTable'
import { TotalsSummary } from '../components/quote/TotalsSummary'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { db } from '../db/db'
import { getQuote, saveQuote } from '../db/quoteRepo'
import { useQuoteTotals } from '../hooks/useQuoteTotals'
import { QUOTE_STATUS_LABELS, type Client, type Quote, type QuoteItem, type QuoteStatus } from '../types'

export function QuoteEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const vatRates = useLiveQuery(() => db.vatRates.toArray(), [], [])
  const [quote, setQuote] = useState<Quote | undefined>(undefined)
  const totals = useQuoteTotals(quote, vatRates ?? [])

  useEffect(() => {
    if (!id) return
    getQuote(id).then(setQuote)
  }, [id])

  function persist(next: Quote) {
    setQuote(next)
    saveQuote(next)
  }

  if (!quote) {
    return <div className="text-slate-500">Betöltés...</div>
  }

  function updateField<K extends keyof Quote>(key: K, value: Quote[K]) {
    persist({ ...quote!, [key]: value })
  }

  function handleClientSelect(client: Client) {
    persist({ ...quote!, clientId: client.id, clientSnapshot: client })
  }

  function handleItemsChange(items: QuoteItem[]) {
    persist({ ...quote!, items })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            ← Vissza az árajánlatokhoz
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{quote.quoteNumber}</h1>
        </div>
        <Button variant="primary" onClick={() => navigate(`/quotes/${quote.id}/preview`)}>
          Előnézet / PDF export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-2">
        <ClientPicker selectedClientId={quote.clientId} onSelect={handleClientSelect} />

        <Select
          label="Státusz"
          value={quote.status}
          onChange={(e) => updateField('status', e.target.value as QuoteStatus)}
        >
          {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Input
          label="Sorszám"
          value={quote.quoteNumber}
          onChange={(e) => updateField('quoteNumber', e.target.value)}
        />

        <Input
          label="Kiállítás dátuma"
          type="date"
          value={quote.issueDate}
          onChange={(e) => updateField('issueDate', e.target.value)}
        />

        <Input
          label="Érvényesség dátuma"
          type="date"
          value={quote.validUntilDate ?? ''}
          onChange={(e) => updateField('validUntilDate', e.target.value)}
        />
      </div>

      <ItemsTable
        items={quote.items}
        vatRates={vatRates ?? []}
        quoteDefaultVatRateId={quote.defaultVatRateId}
        onChange={handleItemsChange}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Jegyzet / feltételek</span>
          <textarea
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={4}
            value={quote.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Fizetési feltételek, megjegyzések..."
          />
        </label>

        {totals && <TotalsSummary totals={totals} />}
      </div>
    </div>
  )
}
