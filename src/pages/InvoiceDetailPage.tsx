import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { INVOICE_STATUS_CONFIG } from "../lib/documentStatus";
import { docTotal, formatCurrency, formatDate } from "../lib/format";
import { generateInvoiceReminderEmail } from "../lib/aiEmail";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AiEmailDraft } from "../components/documents/AiEmailDraft";
import { cx } from "../lib/cx";
import type { InvoiceStatus } from "../types/domain";

const STATUS_OPTIONS: InvoiceStatus[] = ["draft", "issued", "paid", "overdue"];

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoice = useAppStore((s) => s.invoices.find((i) => i.id === id));
  const client = useAppStore((s) => s.clients.find((c) => c.id === invoice?.clientId));
  const profile = useAppStore((s) => s.settings.profile);
  const updateInvoice = useAppStore((s) => s.updateInvoice);
  const deleteInvoice = useAppStore((s) => s.deleteInvoice);

  usePageTitle(invoice?.number ?? "Számla");

  if (!invoice) return <Navigate to="/invoices" replace />;

  const status = INVOICE_STATUS_CONFIG[invoice.status];

  function handleDelete() {
    if (!invoice) return;
    if (window.confirm(`Biztosan törlöd a(z) ${invoice.number} számlát?`)) {
      deleteInvoice(invoice.id);
      navigate("/invoices");
    }
  }

  function handleStatusChange(next: InvoiceStatus) {
    if (!invoice) return;
    updateInvoice(invoice.id, {
      status: next,
      paidAt: next === "paid" ? new Date().toISOString() : undefined,
    });
  }

  const email = generateInvoiceReminderEmail(invoice, client, profile);

  return (
    <div className="animate-slide-up px-4 pb-8 pt-3 md:px-6">
      <Link to="/invoices" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Vissza a számlákhoz
      </Link>

      <Card className="mt-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{invoice.number}</h2>
            <p className="text-sm text-text-muted">{client?.name ?? "Nincs ügyfél megadva"}</p>
          </div>
          <Badge className={status.badge}>{status.label}</Badge>
        </div>

        <div className="mt-2 flex gap-4 text-xs text-text-muted">
          <span>Kiállítva: {formatDate(invoice.issueDate)}</span>
          <span>Fizetési határidő: {formatDate(invoice.dueDate)}</span>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={cx(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                s === invoice.status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-text-muted",
              )}
            >
              {INVOICE_STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {invoice.status !== "paid" && (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<CheckCircle2 size={14} />}
            onClick={() => handleStatusChange("paid")}
          >
            Megjelölés kifizetettként
          </Button>
        )}
      </Card>

      <Card className="mt-4 divide-y divide-border p-0">
        {invoice.items.map((item) => (
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
          <span className="text-lg font-bold text-primary">{formatCurrency(docTotal(invoice.items))}</span>
        </div>
      </Card>

      <div className="mt-4">
        <AiEmailDraft subject={email.subject} body={email.body} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/invoices/${invoice.id}/edit`}>
          <Button size="sm" variant="secondary" icon={<Pencil size={14} />}>
            Szerkesztés
          </Button>
        </Link>
        <Button size="sm" variant="danger" onClick={handleDelete} icon={<Trash2 size={14} />}>
          Törlés
        </Button>
      </div>
    </div>
  );
}
