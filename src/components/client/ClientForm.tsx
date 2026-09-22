import { useState } from 'react'
import type { Client } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export interface ClientFormValues {
  name: string
  address: string
  taxNumber: string
  email: string
  phone: string
  notes: string
}

function toFormValues(client?: Client): ClientFormValues {
  return {
    name: client?.name ?? '',
    address: client?.address ?? '',
    taxNumber: client?.taxNumber ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    notes: client?.notes ?? '',
  }
}

interface ClientFormProps {
  client?: Client
  onSubmit: (values: ClientFormValues) => void
  onCancel?: () => void
  submitLabel?: string
}

export function ClientForm({ client, onSubmit, onCancel, submitLabel = 'Mentés' }: ClientFormProps) {
  const [form, setForm] = useState<ClientFormValues>(toFormValues(client))

  function update<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Név" value={form.name} onChange={(e) => update('name', e.target.value)} required autoFocus />
      <Input label="Adószám (opcionális)" value={form.taxNumber} onChange={(e) => update('taxNumber', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <Input label="Telefon" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Cím</span>
        <textarea
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={2}
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Jegyzet</span>
        <textarea
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={2}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </label>
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Mégse
          </Button>
        )}
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
