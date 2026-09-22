import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClientPicker } from '../components/client/ClientPicker'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { db } from '../db/db'
import { createQuote, deleteQuote, duplicateQuote, listQuotes } from '../db/quoteRepo'
import type { Client, QuoteStatus } from '../types'
import { QUOTE_STATUS_LABELS } from '../types'
import { calculateQuoteTotals } from '../utils/quoteCalculations'
import { formatCurrency } from '../utils/money'
import { formatDate } from '../utils/date'

export function DashboardPage() {
  const navigate = useNavigate()
  const quotes = useLiveQuery(listQuotes, [], [])
  const company = useLiveQuery(() => db.company.get('self'))
  const vatRates = useLiveQuery(() => db.vatRates.toArray(), [], [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = (quotes ?? []).filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      quote.clientSnapshot.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleCreateQuote(client: Client) {
    if (!company) return
    const quote = await createQuote(company, client)
    setNewQuoteModalOpen(false)
    navigate(`/quotes/${quote.id}`)
  }

  async function handleDuplicate(id: string) {
    if (!company) return
    await duplicateQuote(id, company)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Árajánlatok</h1>
        <Button variant="primary" onClick={() => setNewQuoteModalOpen(true)}>
          + Új árajánlat
        </Button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          className="w-full max-w-sm rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          placeholder="Keresés sorszám vagy ügyfél alapján..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'all')}
        >
          <option value="all">Összes státusz</option>
          {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Sorszám</th>
              <th className="px-4 py-2">Ügyfél</th>
              <th className="px-4 py-2">Dátum</th>
              <th className="px-4 py-2">Státusz</th>
              <th className="px-4 py-2 text-right">Bruttó összeg</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((quote) => {
              const totals = vatRates ? calculateQuoteTotals(quote, vatRates) : undefined
              return (
                <tr key={quote.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">
                    <Link to={`/quotes/${quote.id}`} className="hover:underline">
                      {quote.quoteNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{quote.clientSnapshot.name}</td>
                  <td className="px-4 py-2 text-slate-500">{formatDate(quote.issueDate)}</td>
                  <td className="px-4 py-2 text-slate-500">{QUOTE_STATUS_LABELS[quote.status]}</td>
                  <td className="px-4 py-2 text-right text-slate-700">
                    {totals ? formatCurrency(totals.grossTotal) : '-'}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Link to={`/quotes/${quote.id}/preview`} className="mr-3 text-blue-600 hover:underline">
                      PDF
                    </Link>
                    <button className="mr-3 text-slate-500 hover:underline" onClick={() => handleDuplicate(quote.id)}>
                      Duplikálás
                    </button>
                    <button className="text-red-600 hover:underline" onClick={() => setDeleteId(quote.id)}>
                      Törlés
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Még nincs árajánlat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={newQuoteModalOpen} onClose={() => setNewQuoteModalOpen(false)} title="Új árajánlat ügyfele">
        <ClientPicker selectedClientId={undefined} onSelect={handleCreateQuote} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Árajánlat törlése"
        message="Biztosan törlöd ezt az árajánlatot? Ez nem vonható vissza."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteQuote(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
