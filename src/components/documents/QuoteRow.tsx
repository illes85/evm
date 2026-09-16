import { Link } from "react-router-dom";
import type { Quote } from "../../types/domain";
import { useAppStore } from "../../store/useAppStore";
import { docTotal, formatCurrency, formatDate } from "../../lib/format";
import { QUOTE_STATUS_CONFIG } from "../../lib/documentStatus";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function QuoteRow({ quote }: { quote: Quote }) {
  const client = useAppStore((s) => s.clients.find((c) => c.id === quote.clientId));
  const status = QUOTE_STATUS_CONFIG[quote.status];

  return (
    <Link to={`/quotes/${quote.id}`}>
      <Card className="flex items-center gap-3 p-4 hover:shadow-md active:scale-[0.99]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{quote.number}</p>
            <Badge className={status.badge}>{status.label}</Badge>
          </div>
          <p className="truncate text-sm text-text-muted">{client?.name ?? "Nincs ügyfél megadva"}</p>
          {quote.validUntil && (
            <p className="text-xs text-text-muted">Érvényes: {formatDate(quote.validUntil)}</p>
          )}
        </div>
        <p className="shrink-0 font-semibold text-primary">{formatCurrency(docTotal(quote.items))}</p>
      </Card>
    </Link>
  );
}
