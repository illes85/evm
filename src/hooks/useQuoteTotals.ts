import { useMemo } from 'react'
import type { Quote, VatRate } from '../types'
import { calculateQuoteTotals } from '../utils/quoteCalculations'

export function useQuoteTotals(quote: Quote | undefined, vatRates: VatRate[]) {
  return useMemo(() => {
    if (!quote) return undefined
    return calculateQuoteTotals(quote, vatRates)
  }, [quote, vatRates])
}
