import { useLiveQuery } from 'dexie-react-hooks'
import { useRef } from 'react'
import { CompanyProfileForm } from '../components/company/CompanyProfileForm'
import { VatRateManager } from '../components/company/VatRateManager'
import { Button } from '../components/ui/Button'
import { saveCompany } from '../db/companyRepo'
import { db } from '../db/db'
import { exportAllData, importAllData } from '../db/backup'
import { createVatRate, deleteVatRate, upsertVatRate } from '../db/vatRateRepo'

export function SettingsPage() {
  const company = useLiveQuery(() => db.company.get('self'))
  const vatRates = useLiveQuery(() => db.vatRates.toArray(), [], [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evm-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!confirm('Az importálás felülírja a jelenlegi összes adatot (ügyfelek, árajánlatok, beállítások). Folytatod?')) {
      event.target.value = ''
      return
    }
    const text = await file.text()
    const data = JSON.parse(text)
    await importAllData(data)
    event.target.value = ''
    alert('Import sikeres.')
  }

  if (!company || !vatRates) {
    return <div className="text-slate-500">Betöltés...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Cégadatok</h1>
        <CompanyProfileForm company={company} vatRates={vatRates} onSave={saveCompany} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">ÁFA kulcsok</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <VatRateManager
            vatRates={vatRates}
            onCreate={(label, rate) => createVatRate(label, rate)}
            onUpdate={upsertVatRate}
            onDelete={deleteVatRate}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Adatmentés / visszaállítás</h2>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5">
          <Button onClick={handleExport}>Adatok exportálása (JSON)</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Adatok importálása
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Mivel az adatok csak a böngésződben tárolódnak, érdemes időnként exportálni egy biztonsági mentést.
        </p>
      </div>
    </div>
  )
}
