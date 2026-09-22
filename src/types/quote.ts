import type { Client } from './client'
import type { Company } from './company'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface QuoteSubItem {
  id: string
  name: string
  description?: string
  quantity: number
  unit: string
  unitPrice: number
  vatRateId?: string
}

export interface QuoteLeafItem {
  id: string
  kind: 'leaf'
  name: string
  description?: string
  quantity: number
  unit: string
  unitPrice: number
  vatRateId?: string
  order: number
}

export interface QuoteGroupItem {
  id: string
  kind: 'group'
  name: string
  description?: string
  subItems: QuoteSubItem[]
  order: number
}

export type QuoteItem = QuoteLeafItem | QuoteGroupItem

export interface Quote {
  id: string
  quoteNumber: string
  clientId: string
  companySnapshot: Company
  clientSnapshot: Client
  items: QuoteItem[]
  defaultVatRateId: string
  notes?: string
  issueDate: string
  validUntilDate?: string
  status: QuoteStatus
  createdAt: string
  updatedAt: string
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Piszkozat',
  sent: 'Kiküldve',
  accepted: 'Elfogadva',
  rejected: 'Elutasítva',
  expired: 'Lejárt',
}
