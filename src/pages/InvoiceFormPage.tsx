import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { inputClass } from "../lib/formStyles";
import { nextDocumentNumber } from "../lib/documentStatus";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LineItemsEditor } from "../components/documents/LineItemsEditor";
import type { DocLineItem, InvoiceStatus } from "../types/domain";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const existing = useAppStore((s) => s.invoices.find((i) => i.id === id));
  const projects = useAppStore((s) => s.projects);
  const clients = useAppStore((s) => s.clients);
  const quotes = useAppStore((s) => s.quotes);
  const invoices = useAppStore((s) => s.invoices);
  const addInvoice = useAppStore((s) => s.addInvoice);
  const updateInvoice = useAppStore((s) => s.updateInvoice);

  usePageTitle(isEdit ? "Számla szerkesztése" : "Új számla");

  const sourceQuote = quotes.find((q) => q.id === searchParams.get("quoteId"));
  const initialProjectId = existing?.projectId ?? sourceQuote?.projectId ?? searchParams.get("projectId") ?? "";

  const [projectId, setProjectId] = useState(initialProjectId);
  const [clientId, setClientId] = useState(
    existing?.clientId ?? sourceQuote?.clientId ?? projects.find((p) => p.id === initialProjectId)?.clientId ?? "",
  );
  const [status, setStatus] = useState<InvoiceStatus>(existing?.status ?? "draft");
  const [items, setItems] = useState<DocLineItem[]>(existing?.items ?? sourceQuote?.items ?? []);
  const today = new Date().toISOString();
  const [issueDate, setIssueDate] = useState(existing?.issueDate?.slice(0, 10) ?? today.slice(0, 10));
  const [dueDate, setDueDate] = useState(existing?.dueDate?.slice(0, 10) ?? addDays(today, 8).slice(0, 10));

  if (isEdit && !existing) {
    return <Navigate to="/invoices" replace />;
  }

  function handleProjectChange(newProjectId: string) {
    setProjectId(newProjectId);
    const project = projects.find((p) => p.id === newProjectId);
    if (project?.clientId) setClientId(project.clientId);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      number: existing?.number ?? nextDocumentNumber(invoices, "SZ"),
      projectId: projectId || undefined,
      clientId: clientId || undefined,
      quoteId: existing?.quoteId ?? sourceQuote?.id,
      status,
      items,
      issueDate: new Date(issueDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      paidAt: existing?.paidAt,
    };

    if (existing) {
      updateInvoice(existing.id, payload);
      navigate(`/invoices/${existing.id}`);
    } else {
      const created = addInvoice(payload);
      navigate(`/invoices/${created.id}`);
    }
  }

  return (
    <div className="px-4 pb-10 pt-3 md:px-6">
      <Link
        to={isEdit && id ? `/invoices/${id}` : "/invoices"}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} />
        Vissza
      </Link>

      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <Card className="space-y-4 p-4">
          <Field label="Projekt">
            <select value={projectId} onChange={(e) => handleProjectChange(e.target.value)} className={inputClass}>
              <option value="">— nincs kiválasztva —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ügyfél">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
              <option value="">— nincs kiválasztva —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Állapot">
              <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)} className={inputClass}>
                <option value="draft">Piszkozat</option>
                <option value="issued">Kiállítva</option>
                <option value="paid">Kifizetve</option>
                <option value="overdue">Lejárt</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Kiállítás dátuma">
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Fizetési határidő">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-muted">Tételek</h3>
          <LineItemsEditor items={items} onChange={setItems} />
        </Card>

        <Button type="submit" fullWidth size="lg">
          {isEdit ? "Mentés" : "Számla létrehozása"}
        </Button>
      </form>
    </div>
  );
}
