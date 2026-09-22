export const COMPANY_SINGLETON_ID = 'self'

export interface Company {
  id: string
  name: string
  address: string
  taxNumber: string
  email: string
  phone: string
  logoBlob?: Blob
  bankAccountNumber?: string
  defaultVatRateId: string
  quoteNumberPrefix: string
  nextQuoteSequence: number
  currency: 'HUF'
}

export function createEmptyCompany(defaultVatRateId: string): Company {
  return {
    id: COMPANY_SINGLETON_ID,
    name: '',
    address: '',
    taxNumber: '',
    email: '',
    phone: '',
    defaultVatRateId,
    quoteNumberPrefix: `AJ-${new Date().getFullYear()}-`,
    nextQuoteSequence: 1,
    currency: 'HUF',
  }
}
