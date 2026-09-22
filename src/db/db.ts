import Dexie, { type EntityTable } from 'dexie'
import type { Client, Company, Quote, VatRate } from '../types'

export class AppDatabase extends Dexie {
  company!: EntityTable<Company, 'id'>
  clients!: EntityTable<Client, 'id'>
  quotes!: EntityTable<Quote, 'id'>
  vatRates!: EntityTable<VatRate, 'id'>

  constructor() {
    super('evm')
    this.version(1).stores({
      company: 'id',
      clients: 'id, name',
      quotes: 'id, quoteNumber, clientId, status, createdAt',
      vatRates: 'id',
    })
  }
}

export const db = new AppDatabase()
