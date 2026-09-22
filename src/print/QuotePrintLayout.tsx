import { Fragment, useEffect, useMemo } from 'react'
import type { Quote, VatRate } from '../types'
import { QUOTE_STATUS_LABELS } from '../types'
import { calculateQuoteTotals, calculateSubItemTotal, calculateLeafItemTotal } from '../utils/quoteCalculations'
import { formatCurrency, formatPercent } from '../utils/money'
import { formatDate } from '../utils/date'

interface QuotePrintLayoutProps {
  quote: Quote
  vatRates: VatRate[]
}

function useLogoUrl(logoBlob: Blob | undefined) {
  const url = useMemo(() => (logoBlob ? URL.createObjectURL(logoBlob) : undefined), [logoBlob])
  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}

export function QuotePrintLayout({ quote, vatRates }: QuotePrintLayoutProps) {
  const totals = calculateQuoteTotals(quote, vatRates)
  const company = quote.companySnapshot
  const client = quote.clientSnapshot
  const logoUrl = useLogoUrl(company.logoBlob)
  const orderedItems = [...quote.items].sort((a, b) => a.order - b.order)

  function vatRateLabel(vatRateId: string | undefined) {
    const rate = vatRates.find((r) => r.id === (vatRateId ?? quote.defaultVatRateId))
    return rate ? formatPercent(rate.rate) : '-'
  }

  return (
    <div className="mx-auto max-w-3xl bg-white p-10 text-sm text-slate-900 print:p-0">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-4">
          {logoUrl && <img src={logoUrl} alt="Logó" className="h-16 w-16 object-contain" />}
          <div>
            <div className="text-base font-semibold">{company.name}</div>
            <div className="whitespace-pre-line text-slate-600">{company.address}</div>
            {company.taxNumber && <div className="text-slate-600">Adószám: {company.taxNumber}</div>}
            {company.email && <div className="text-slate-600">{company.email}</div>}
            {company.phone && <div className="text-slate-600">{company.phone}</div>}
            {company.bankAccountNumber && <div className="text-slate-600">Bankszámla: {company.bankAccountNumber}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">Árajánlat</div>
          <div className="mt-1 text-slate-600">{quote.quoteNumber}</div>
          <div className="mt-2 text-slate-600">Kiállítva: {formatDate(quote.issueDate)}</div>
          {quote.validUntilDate && <div className="text-slate-600">Érvényes: {formatDate(quote.validUntilDate)}</div>}
          <div className="mt-1 text-slate-600">Státusz: {QUOTE_STATUS_LABELS[quote.status]}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs font-semibold uppercase text-slate-500">Ügyfél</div>
        <div className="font-medium">{client.name}</div>
        <div className="whitespace-pre-line text-slate-600">{client.address}</div>
        {client.taxNumber && <div className="text-slate-600">Adószám: {client.taxNumber}</div>}
        {client.email && <div className="text-slate-600">{client.email}</div>}
        {client.phone && <div className="text-slate-600">{client.phone}</div>}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-slate-800 text-left text-xs uppercase text-slate-600">
            <th className="py-1.5 pr-2">Tétel</th>
            <th className="px-2 py-1.5 text-right">Menny.</th>
            <th className="px-2 py-1.5">Egység</th>
            <th className="px-2 py-1.5 text-right">Egységár</th>
            <th className="px-2 py-1.5 text-right">ÁFA</th>
            <th className="py-1.5 pl-2 text-right">Nettó összeg</th>
          </tr>
        </thead>
        <tbody>
          {orderedItems.map((item) =>
            item.kind === 'leaf' ? (
              <tr key={item.id} className="border-b border-slate-200 print:break-inside-avoid">
                <td className="py-1.5 pr-2">{item.name}</td>
                <td className="px-2 py-1.5 text-right">{item.quantity}</td>
                <td className="px-2 py-1.5">{item.unit}</td>
                <td className="px-2 py-1.5 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-2 py-1.5 text-right">{vatRateLabel(item.vatRateId)}</td>
                <td className="py-1.5 pl-2 text-right">{formatCurrency(calculateLeafItemTotal(item))}</td>
              </tr>
            ) : (
              <Fragment key={item.id}>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold print:break-inside-avoid">
                  <td className="py-1.5 pr-2" colSpan={5}>
                    {item.name}
                  </td>
                  <td className="py-1.5 pl-2 text-right">
                    {formatCurrency(item.subItems.reduce((sum, s) => sum + calculateSubItemTotal(s), 0))}
                  </td>
                </tr>
                {item.subItems.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-100 text-slate-700 print:break-inside-avoid">
                    <td className="py-1 pr-2 pl-4">{sub.name}</td>
                    <td className="px-2 py-1 text-right">{sub.quantity}</td>
                    <td className="px-2 py-1">{sub.unit}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(sub.unitPrice)}</td>
                    <td className="px-2 py-1 text-right">{vatRateLabel(sub.vatRateId)}</td>
                    <td className="py-1 pl-2 text-right">{formatCurrency(calculateSubItemTotal(sub))}</td>
                  </tr>
                ))}
              </Fragment>
            ),
          )}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-72 space-y-1">
          {totals.vatBreakdown.length > 1 && (
            <table className="mb-2 w-full text-xs text-slate-600">
              <tbody>
                {totals.vatBreakdown.map((row) => (
                  <tr key={row.vatRateId}>
                    <td className="py-0.5">{row.label}</td>
                    <td className="py-0.5 text-right">{formatCurrency(row.vatAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Nettó összesen</span>
            <span>{formatCurrency(totals.netTotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>ÁFA összesen</span>
            <span>{formatCurrency(totals.vatAmount)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-slate-800 pt-1 text-base font-bold">
            <span>Bruttó végösszeg</span>
            <span>{formatCurrency(totals.grossTotal)}</span>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="mt-8 border-t border-slate-200 pt-4 text-slate-600">
          <div className="text-xs font-semibold uppercase text-slate-500">Megjegyzés</div>
          <div className="whitespace-pre-line">{quote.notes}</div>
        </div>
      )}
    </div>
  )
}
