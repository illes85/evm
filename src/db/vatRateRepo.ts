import { nanoid } from 'nanoid'
import type { VatRate } from '../types'
import { db } from './db'

export const DEFAULT_VAT_RATES: Omit<VatRate, 'id'>[] = [
  { label: '27% ÁFA', rate: 0.27, isDefaultSeed: true },
  { label: '18% ÁFA', rate: 0.18, isDefaultSeed: true },
  { label: '5% ÁFA', rate: 0.05, isDefaultSeed: true },
  { label: '0% (AAM)', rate: 0, isDefaultSeed: true },
]

export async function listVatRates(): Promise<VatRate[]> {
  return db.vatRates.toArray()
}

export async function upsertVatRate(vatRate: VatRate): Promise<void> {
  await db.vatRates.put(vatRate)
}

export async function deleteVatRate(id: string): Promise<void> {
  await db.vatRates.delete(id)
}

export async function createVatRate(label: string, rate: number): Promise<VatRate> {
  const vatRate: VatRate = { id: nanoid(), label, rate, isDefaultSeed: false }
  await db.vatRates.put(vatRate)
  return vatRate
}
