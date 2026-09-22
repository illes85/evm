import type { Client, Company, Quote, VatRate } from '../types'
import { db } from './db'

interface SerializedBlob {
  base64: string
  type: string
}

type SerializedCompany = Omit<Company, 'logoBlob'> & { logoBlob?: SerializedBlob }

interface BackupData {
  version: 1
  exportedAt: string
  company?: SerializedCompany
  clients: Client[]
  quotes: (Omit<Quote, 'companySnapshot'> & { companySnapshot: SerializedCompany })[]
  vatRates: VatRate[]
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

async function serializeCompany(company: Company): Promise<SerializedCompany> {
  const { logoBlob, ...rest } = company
  if (!logoBlob) return rest
  return { ...rest, logoBlob: { base64: await blobToBase64(logoBlob), type: logoBlob.type } }
}

function deserializeCompany(data: SerializedCompany | undefined): Company | undefined {
  if (!data) return undefined
  const { logoBlob, ...rest } = data
  if (!logoBlob) return rest as Company
  return { ...rest, logoBlob: base64ToBlob(logoBlob.base64, logoBlob.type) } as Company
}

export async function exportAllData(): Promise<BackupData> {
  const [company, clients, quotes, vatRates] = await Promise.all([
    db.company.get('self'),
    db.clients.toArray(),
    db.quotes.toArray(),
    db.vatRates.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    company: company ? await serializeCompany(company) : undefined,
    clients,
    quotes: await Promise.all(
      quotes.map(async (quote) => ({
        ...quote,
        companySnapshot: await serializeCompany(quote.companySnapshot),
      })),
    ),
    vatRates,
  }
}

export async function importAllData(backup: BackupData): Promise<void> {
  await db.transaction('rw', db.company, db.clients, db.quotes, db.vatRates, async () => {
    await db.clients.clear()
    await db.quotes.clear()
    await db.vatRates.clear()
    await db.company.clear()

    if (backup.company) {
      const company = deserializeCompany(backup.company)
      if (company) await db.company.put(company)
    }
    await db.clients.bulkPut(backup.clients)
    await db.vatRates.bulkPut(backup.vatRates)
    await db.quotes.bulkPut(
      backup.quotes.map((quote) => ({
        ...quote,
        companySnapshot: deserializeCompany(quote.companySnapshot) ?? (quote.companySnapshot as unknown as Company),
      })),
    )
  })
}
