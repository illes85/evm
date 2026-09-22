import { COMPANY_SINGLETON_ID, createEmptyCompany, type Company } from '../types'
import { db } from './db'

export async function getCompany(): Promise<Company | undefined> {
  return db.company.get(COMPANY_SINGLETON_ID)
}

export async function saveCompany(company: Company): Promise<void> {
  await db.company.put(company)
}

export async function ensureCompany(defaultVatRateId: string): Promise<Company> {
  const existing = await getCompany()
  if (existing) return existing
  const created = createEmptyCompany(defaultVatRateId)
  await db.company.put(created)
  return created
}

export async function getNextQuoteNumber(company: Company): Promise<string> {
  const sequence = company.nextQuoteSequence
  const number = `${company.quoteNumberPrefix}${String(sequence).padStart(3, '0')}`
  await db.company.update(company.id, { nextQuoteSequence: sequence + 1 })
  return number
}
