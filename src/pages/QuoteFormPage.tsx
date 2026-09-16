import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { inputClass, textareaClass } from "../lib/formStyles";
import { nextDocumentNumber } from "../lib/documentStatus";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LineItemsEditor } from "../components/documents/LineItemsEditor";
import { AiQuoteAssistant } from "../components/documents/AiQuoteAssistant";
import type { DocLineItem, QuoteStatus } from "../types/domain";

export default function QuoteFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const existing = useAppStore((s) => s.quotes.find((q) => q.id === id));
  const projects = useAppStore((s) => s.projects);
  const clients = useAppStore((s) => s.clients);
  const quotes = useAppStore((s) => s.quotes);
  const addQuote = useAppStore((s) => s.addQuote);
  const updateQuote = useAppStore((s) => s.updateQuote);

  usePageTitle(isEdit ? "Ajánlat szerkesztése" : "Új ajánlat");

  const initialProjectId = existing?.projectId ?? searchParams.get("projectId") ?? "";
  const [projectId, setProjectId] = useState(initialProjectId);
  const [clientId, setClientId] = useState(
    existing?.clientId ?? projects.find((p) => p.id === initialProjectId)?.clientId ?? "",
  );
  const [status, setStatus] = useState<QuoteStatus>(existing?.status ?? "draft");
  const [items, setItems] = useState<DocLineItem[]>(existing?.items ?? []);
  const [validUntil, setValidUntil] = useState(existing?.validUntil?.slice(0, 10) ?? "");
  const [note, setNote] = useState(existing?.note ?? "");

  if (isEdit && !existing) {
    return <Navigate to="/quotes" replace />;
  }

  function handleProjectChange(newProjectId: string) {
    setProjectId(newProjectId);
    const project = projects.find((p) => p.id === newProjectId);
    if (project?.clientId) setClientId(project.clientId);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      number: existing?.number ?? nextDocumentNumber(quotes, "AJ"),
      projectId: projectId || undefined,
      clientId: clientId || undefined,
      status,
      items,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      note: note.trim() || undefined,
    };

    if (existing) {
      updateQuote(existing.id, payload);
      navigate(`/quotes/${existing.id}`);
    } else {
      const created = addQuote(payload);
      navigate(`/quotes/${created.id}`);
    }
  }

  return (
    <div className="px-4 pb-10 pt-3 md:px-6">
      <Link
        to={isEdit && id ? `/quotes/${id}` : "/quotes"}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} />
        Vissza
      </Link>

      <div className="mt-3">
        <AiQuoteAssistant onGenerate={(generated) => setItems([...items, ...generated])} />
      </div>

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
              <select value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)} className={inputClass}>
                <option value="draft">Piszkozat</option>
                <option value="sent">Elküldve</option>
                <option value="accepted">Elfogadva</option>
                <option value="rejected">Elutasítva</option>
              </select>
            </Field>
            <Field label="Érvényesség">
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-muted">Tételek</h3>
          <LineItemsEditor items={items} onChange={setItems} />
        </Card>

        <Card className="p-4">
          <Field label="Megjegyzés">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className={textareaClass} rows={3} />
          </Field>
        </Card>

        <Button type="submit" fullWidth size="lg">
          {isEdit ? "Mentés" : "Ajánlat létrehozása"}
        </Button>
      </form>
    </div>
  );
}
