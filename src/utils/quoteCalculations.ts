import type { Quote, QuoteItem, QuoteSubItem, VatRate } from '../types'

export interface ItemTotal {
  itemId: string
  netTotal: number
  vatAmount: number
  grossTotal: number
}

export interface VatBreakdownRow {
  vatRateId: string
  label: string
  rate: number
  netTotal: number
  vatAmount: number
  grossTotal: number
}

export interface QuoteTotals {
  itemTotals: ItemTotal[]
  netTotal: number
  vatAmount: number
  grossTotal: number
  vatBreakdown: VatBreakdownRow[]
}

export function calculateSubItemTotal(subItem: QuoteSubItem): number {
  return subItem.quantity * subItem.unitPrice
}

export function calculateLeafItemTotal(item: { quantity: number; unitPrice: number }): number {
  return item.quantity * item.unitPrice
}

export function calculateItemNetTotal(item: QuoteItem): number {
  if (item.kind === 'leaf') return calculateLeafItemTotal(item)
  return item.subItems.reduce((sum, sub) => sum + calculateSubItemTotal(sub), 0)
}

export function effectiveVatRateId(itemVatRateId: string | undefined, quoteDefaultVatRateId: string): string {
  return itemVatRateId ?? quoteDefaultVatRateId
}

function findVatRate(vatRates: VatRate[], id: string): VatRate | undefined {
  return vatRates.find((rate) => rate.id === id)
}

export function calculateQuoteTotals(quote: Quote, vatRates: VatRate[]): QuoteTotals {
  const breakdownMap = new Map<string, VatBreakdownRow>()
  const itemTotals: ItemTotal[] = []

  const addToBreakdown = (vatRateId: string, net: number): number => {
    const vatRate = findVatRate(vatRates, vatRateId)
    const rateValue = vatRate?.rate ?? 0
    const vatAmount = net * rateValue
    const existing = breakdownMap.get(vatRateId)
    if (existing) {
      existing.netTotal += net
      existing.vatAmount += vatAmount
      existing.grossTotal += net + vatAmount
    } else {
      breakdownMap.set(vatRateId, {
        vatRateId,
        label: vatRate?.label ?? 'Ismeretlen ÁFA',
        rate: rateValue,
        netTotal: net,
        vatAmount,
        grossTotal: net + vatAmount,
      })
    }
    return vatAmount
  }

  const orderedItems = [...quote.items].sort((a, b) => a.order - b.order)

  for (const item of orderedItems) {
    if (item.kind === 'leaf') {
      const net = calculateLeafItemTotal(item)
      const vatRateId = effectiveVatRateId(item.vatRateId, quote.defaultVatRateId)
      const vatAmount = addToBreakdown(vatRateId, net)
      itemTotals.push({ itemId: item.id, netTotal: net, vatAmount, grossTotal: net + vatAmount })
    } else {
      let groupNet = 0
      let groupVat = 0
      for (const sub of item.subItems) {
        const subNet = calculateSubItemTotal(sub)
        const vatRateId = effectiveVatRateId(sub.vatRateId, quote.defaultVatRateId)
        groupVat += addToBreakdown(vatRateId, subNet)
        groupNet += subNet
      }
      itemTotals.push({ itemId: item.id, netTotal: groupNet, vatAmount: groupVat, grossTotal: groupNet + groupVat })
    }
  }

  const netTotal = itemTotals.reduce((sum, t) => sum + t.netTotal, 0)
  const vatAmount = itemTotals.reduce((sum, t) => sum + t.vatAmount, 0)
  const grossTotal = netTotal + vatAmount
  const vatBreakdown = Array.from(breakdownMap.values()).sort((a, b) => b.rate - a.rate)

  return { itemTotals, netTotal, vatAmount, grossTotal, vatBreakdown }
}
