import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Receipt, Trash2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { QUOTE_STATUS_CONFIG } from "../lib/documentStatus";
import { docTotal, formatCurrency, formatDate } from "../lib/format";
import { generateQuoteEmailDraft } from "../lib/aiEmail";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AiEmailDraft } from "../components/documents/AiEmailDraft";
import { cx } from "../lib/cx";
import type { QuoteStatus } from "../types/domain";

const STATUS_OPTIONS: QuoteStatus[] = ["draft", "sent", "accepted", "rejected"];

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quote = useAppStore((s) => s.quotes.find((q) => q.id === id));
  const client = useAppStore((s) => s.clients.find((c) => c.id === quote?.clientId));
  const profile = useAppStore((s) => s.settings.profile);
  const updateQuote = useAppStore((s) => s.updateQuote);
  const deleteQuote = useAppStore((s) => s.deleteQuote);

  usePageTitle(quote?.number ?? "Ajánlat");

  if (!quote) return <Navigate to="/quotes" replace />;

  const status = QUOTE_STATUS_CONFIG[quote.status];

  function handleDelete() {
    if (!quote) return;
    if (window.confirm(`Biztosan törlöd a(z) ${quote.number} ajánlatot?`)) {
      deleteQuote(quote.id);
      navigate("/quotes");
    }
  }

  const email = generateQuoteEmailDraft(quote, client, profile);

  return (
    <div className="animate-slide-up px-4 pb-8 pt-3 md:px-6">
      <Link to="/quotes" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Vissza az ajánlatokhoz
      </Link>

      <Card className="mt-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{quote.number}</h2>
            <p className="text-sm text-text-muted">{client?.name ?? "Nincs ügyfél megadva"}</p>
          </div>
          <Badge className={status.badge}>{status.label}</Badge>
        </div>

        {quote.validUntil && (
          <p className="mt-2 text-xs text-text-muted">Érvényes: {formatDate(quote.validUntil)}-ig</p>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => updateQuote(quote.id, { status: s })}
              className={cx(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                s === quote.status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-text-muted",
              )}
            >
              {QUOTE_STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 divide-y divide-border p-0">
        {quote.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 p-3.5 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{item.description || "—"}</p>
              <p className="text-xs text-text-muted">
                {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <p className="shrink-0 font-medium">{formatCurrency(item.quantity * item.unitPrice)}</p>
          </div>
        ))}
        <div className="flex items-center justify-between p-3.5">
          <span className="font-semibold text-text-muted">Végösszeg</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(docTotal(quote.items))}</span>
        </div>
      </Card>

      {quote.note && (
        <Card className="mt-4 p-4">
          <p className="text-sm text-text-muted">{quote.note}</p>
        </Card>
      )}

      <div className="mt-4">
        <AiEmailDraft subject={email.subject} body={email.body} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/quotes/${quote.id}/edit`}>
          <Button size="sm" variant="secondary" icon={<Pencil size={14} />}>
            Szerkesztés
          </Button>
        </Link>
        <Link to={`/invoices/new?quoteId=${quote.id}`}>
          <Button size="sm" variant="secondary" icon={<Receipt size={14} />}>
            Számla készítése ebből
          </Button>
        </Link>
        <Button size="sm" variant="danger" onClick={handleDelete} icon={<Trash2 size={14} />}>
          Törlés
        </Button>
      </div>
    </div>
  );
}
