import { useState, type FormEvent } from "react";
import { ArrowRight, FileSpreadsheet, MapPinned, Plus, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { formatRelative } from "../lib/format";
import { inputClass } from "../lib/formStyles";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Field } from "../components/ui/Field";
import { EmptyState } from "../components/ui/EmptyState";
import type { LeadSource } from "../types/domain";

const SOURCE_LABEL: Record<LeadSource, { label: string; icon: typeof FileSpreadsheet }> = {
  manual: { label: "Kézi felvitel", icon: UserPlus },
  google_sheets: { label: "Google Sheets", icon: FileSpreadsheet },
  google_business: { label: "Google Cégem", icon: MapPinned },
};

export default function LeadsPage() {
  usePageTitle("Érdeklődők");
  const navigate = useNavigate();
  const leads = useAppStore((s) => s.leads);
  const addLead = useAppStore((s) => s.addLead);
  const deleteLead = useAppStore((s) => s.deleteLead);
  const convertLeadToProject = useAppStore((s) => s.convertLeadToProject);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addLead({ name: name.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined, source: "manual" });
    setName("");
    setPhone("");
    setNote("");
    setShowForm(false);
  }

  function handleConvert(id: string) {
    const project = convertLeadToProject(id);
    if (project) navigate(`/projects/${project.id}`);
  }

  return (
    <div className="space-y-4 px-4 pb-10 pt-4 md:px-6">
      <p className="text-sm text-text-muted">
        Ide futnak be az érdeklődők — kézzel rögzítve, vagy (Prémium csomagban) automatikusan Google
        Sheets táblázatból és a Google Cégem profilodról.
      </p>

      {showForm ? (
        <Card className="p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <Field label="Név *">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Telefon">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Megjegyzés">
              <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Mentés
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Mégse
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>
          Érdeklődő hozzáadása
        </Button>
      )}

      {leads.length === 0 ? (
        <EmptyState icon={UserPlus} title="Még nincs rögzített érdeklődő" />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const source = SOURCE_LABEL[lead.source];
            return (
              <Card key={lead.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-xs text-text-muted">{formatRelative(lead.createdAt)}</p>
                  </div>
                  <Badge className="bg-surface-2 text-text-muted">
                    <source.icon size={11} />
                    {source.label}
                  </Badge>
                </div>
                {lead.phone && <p className="mt-1.5 text-sm text-text-muted">{lead.phone}</p>}
                {lead.note && <p className="mt-1 text-sm text-text-muted">{lead.note}</p>}

                <div className="mt-3">
                  {lead.convertedProjectId ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/projects/${lead.convertedProjectId}`)}
                    >
                      Projekt megtekintése
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" icon={<ArrowRight size={13} />} onClick={() => handleConvert(lead.id)}>
                        Projektté alakítás
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => deleteLead(lead.id)}>
                        Törlés
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
