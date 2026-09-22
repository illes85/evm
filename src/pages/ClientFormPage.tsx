import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { ClientForm, type ClientFormValues } from '../components/client/ClientForm'
import { createClient, updateClient } from '../db/clientRepo'
import { db } from '../db/db'

export function ClientFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const client = useLiveQuery(() => (isNew ? undefined : db.clients.get(id!)), [id])

  async function handleSubmit(values: ClientFormValues) {
    if (isNew) {
      await createClient(values)
    } else if (id) {
      await updateClient(id, values)
    }
    navigate('/clients')
  }

  if (!isNew && !client) {
    return <div className="text-slate-500">Betöltés...</div>
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isNew ? 'Új ügyfél' : 'Ügyfél szerkesztése'}</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <ClientForm client={client} onSubmit={handleSubmit} onCancel={() => navigate('/clients')} />
      </div>
    </div>
  )
}
