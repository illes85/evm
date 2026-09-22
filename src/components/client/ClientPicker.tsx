import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { createClient, listClients } from '../../db/clientRepo'
import type { Client } from '../../types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { ClientForm, type ClientFormValues } from './ClientForm'

interface ClientPickerProps {
  selectedClientId: string | undefined
  onSelect: (client: Client) => void
}

export function ClientPicker({ selectedClientId, onSelect }: ClientPickerProps) {
  const clients = useLiveQuery(listClients, [], [])
  const [modalOpen, setModalOpen] = useState(false)

  async function handleCreate(values: ClientFormValues) {
    const client = await createClient(values)
    setModalOpen(false)
    onSelect(client)
  }

  return (
    <div className="flex items-end gap-2">
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Ügyfél</span>
        <select
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          value={selectedClientId ?? ''}
          onChange={(e) => {
            const client = clients?.find((c) => c.id === e.target.value)
            if (client) onSelect(client)
          }}
        >
          <option value="" disabled>
            Válassz ügyfelet...
          </option>
          {(clients ?? []).map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" onClick={() => setModalOpen(true)}>
        + Új ügyfél
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Új ügyfél">
        <ClientForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} submitLabel="Létrehozás" />
      </Modal>
    </div>
  )
}
