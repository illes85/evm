import { Link } from "react-router-dom";
import type { Invoice } from "../../types/domain";
import { useAppStore } from "../../store/useAppStore";
import { docTotal, formatCurrency, formatDate } from "../../lib/format";
import { INVOICE_STATUS_CONFIG } from "../../lib/documentStatus";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const client = useAppStore((s) => s.clients.find((c) => c.id === invoice.clientId));
  const status = INVOICE_STATUS_CONFIG[invoice.status];

  return (
    <Link to={`/invoices/${invoice.id}`}>
      <Card className="flex items-center gap-3 p-4 hover:shadow-md active:scale-[0.99]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{invoice.number}</p>
            <Badge className={status.badge}>{status.label}</Badge>
          </div>
          <p className="truncate text-sm text-text-muted">{client?.name ?? "Nincs ügyfél megadva"}</p>
          <p className="text-xs text-text-muted">Fizetési határidő: {formatDate(invoice.dueDate)}</p>
        </div>
        <p className="shrink-0 font-semibold text-primary">{formatCurrency(docTotal(invoice.items))}</p>
      </Card>
    </Link>
  );
}
