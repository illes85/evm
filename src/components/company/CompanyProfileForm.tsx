import { useState } from 'react'
import type { Company, VatRate } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { LogoUpload } from './LogoUpload'

interface CompanyProfileFormProps {
  company: Company
  vatRates: VatRate[]
  onSave: (company: Company) => void
}

export function CompanyProfileForm({ company, vatRates, onSave }: CompanyProfileFormProps) {
  const [form, setForm] = useState(company)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof Company>(key: K, value: Company[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSave(form)
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <LogoUpload logoBlob={form.logoBlob} onChange={(blob) => update('logoBlob', blob)} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Cégnév / Saját név" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <Input label="Adószám" value={form.taxNumber} onChange={(e) => update('taxNumber', e.target.value)} placeholder="12345678-1-23" />
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <Input label="Telefon" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input
          label="Bankszámlaszám"
          value={form.bankAccountNumber ?? ''}
          onChange={(e) => update('bankAccountNumber', e.target.value)}
        />
        <Select
          label="Alapértelmezett ÁFA kulcs"
          value={form.defaultVatRateId}
          onChange={(e) => update('defaultVatRateId', e.target.value)}
        >
          {vatRates.map((rate) => (
            <option key={rate.id} value={rate.id}>
              {rate.label}
            </option>
          ))}
        </Select>
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Árajánlat sorszám prefix"
          value={form.quoteNumberPrefix}
          onChange={(e) => update('quoteNumberPrefix', e.target.value)}
        />
        <Input
          label="Következő sorszám"
          type="number"
          min={1}
          value={form.nextQuoteSequence}
          onChange={(e) => update('nextQuoteSequence', Number(e.target.value))}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Mentés
        </Button>
        {saved && <span className="text-sm text-green-600">Elmentve</span>}
      </div>
    </form>
  )
}
