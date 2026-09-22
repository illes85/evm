import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { deleteClient, listClients } from '../db/clientRepo'

export function ClientsPage() {
  const clients = useLiveQuery(listClients, [], [])
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = (clients ?? []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Ügyfelek</h1>
        <Link to="/clients/new">
          <Button variant="primary">+ Új ügyfél</Button>
        </Link>
      </div>

      <input
        className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        placeholder="Keresés név alapján..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Név</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Telefon</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-800">{client.name}</td>
                <td className="px-4 py-2 text-slate-500">{client.email}</td>
                <td className="px-4 py-2 text-slate-500">{client.phone}</td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/clients/${client.id}`} className="mr-3 text-blue-600 hover:underline">
                    Szerkesztés
                  </Link>
                  <button className="text-red-600 hover:underline" onClick={() => setDeleteId(client.id)}>
                    Törlés
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Nincs még ügyfél.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Ügyfél törlése"
        message="Biztosan törlöd ezt az ügyfelet? A korábbi árajánlatok megőrzik a rögzített adatait."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteClient(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
