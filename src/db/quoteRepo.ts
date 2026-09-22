import { nanoid } from 'nanoid'
import type { Client, Company, Quote } from '../types'
import { getNextQuoteNumber } from './companyRepo'
import { db } from './db'

export async function listQuotes(): Promise<Quote[]> {
  const all = await db.quotes.toArray()
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getQuote(id: string): Promise<Quote | undefined> {
  return db.quotes.get(id)
}

export async function createQuote(company: Company, client: Client): Promise<Quote> {
  const now = new Date().toISOString()
  const quoteNumber = await getNextQuoteNumber(company)
  const quote: Quote = {
    id: nanoid(),
    quoteNumber,
    clientId: client.id,
    companySnapshot: company,
    clientSnapshot: client,
    items: [],
    defaultVatRateId: company.defaultVatRateId,
    issueDate: now.slice(0, 10),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
  await db.quotes.put(quote)
  return quote
}

export async function saveQuote(quote: Quote): Promise<void> {
  await db.quotes.put({ ...quote, updatedAt: new Date().toISOString() })
}

export async function deleteQuote(id: string): Promise<void> {
  await db.quotes.delete(id)
}

export async function duplicateQuote(id: string, company: Company): Promise<Quote | undefined> {
  const original = await getQuote(id)
  if (!original) return undefined
  const now = new Date().toISOString()
  const quoteNumber = await getNextQuoteNumber(company)
  const duplicate: Quote = {
    ...original,
    id: nanoid(),
    quoteNumber,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
  await db.quotes.put(duplicate)
  return duplicate
}
