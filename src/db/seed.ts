import { nanoid } from 'nanoid'
import type { VatRate } from '../types'
import { ensureCompany } from './companyRepo'
import { db } from './db'
import { DEFAULT_VAT_RATES } from './vatRateRepo'

export async function seedDatabase(): Promise<void> {
  const defaultRateId = await db.transaction('rw', db.vatRates, async () => {
    const existingRates = await db.vatRates.toArray()
    if (existingRates.length > 0) return existingRates[0].id

    const seeded: VatRate[] = DEFAULT_VAT_RATES.map((rate) => ({ ...rate, id: nanoid() }))
    await db.vatRates.bulkPut(seeded)
    return seeded[0].id
  })

  await ensureCompany(defaultRateId)
}
