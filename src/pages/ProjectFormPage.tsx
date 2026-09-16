import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { PROJECT_STATUSES } from "../lib/projectStatus";
import { inputClass, textareaClass } from "../lib/formStyles";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { ProjectStatus } from "../types/domain";

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const existing = useAppStore((s) => s.projects.find((p) => p.id === id));
  const clients = useAppStore((s) => s.clients);
  const addProject = useAppStore((s) => s.addProject);
  const updateProject = useAppStore((s) => s.updateProject);

  usePageTitle(isEdit ? "Projekt szerkesztése" : "Új projekt");

  const [title, setTitle] = useState(existing?.title ?? "");
  const [clientId, setClientId] = useState(existing?.clientId ?? searchParams.get("clientId") ?? "");
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? "lead");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [lat, setLat] = useState(existing?.location?.lat?.toString() ?? "");
  const [lng, setLng] = useState(existing?.location?.lng?.toString() ?? "");
  const [estimatedValue, setEstimatedValue] = useState(existing?.estimatedValue?.toString() ?? "");
  const [scheduledDate, setScheduledDate] = useState(existing?.scheduledDate?.slice(0, 10) ?? "");
  const [dueDate, setDueDate] = useState(existing?.dueDate?.slice(0, 10) ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");

  if (isEdit && !existing) {
    return <Navigate to="/" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
    const payload = {
      title: title.trim(),
      clientId: clientId || undefined,
      status,
      address: address.trim() || undefined,
      location,
      estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      description: description.trim() || undefined,
    };

    if (existing) {
      updateProject(existing.id, payload);
      navigate(`/projects/${existing.id}`);
    } else {
      const created = addProject(payload);
      navigate(`/projects/${created.id}`);
    }
  }

  return (
    <div className="px-4 pb-10 pt-3 md:px-6">
      <Link
        to={isEdit && id ? `/projects/${id}` : "/"}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} />
        Vissza
      </Link>

      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <Card className="space-y-4 p-4">
          <Field label="Projekt neve *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="pl. Fürdőszoba felújítás"
            />
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

          <Field label="Állapot">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={inputClass}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cím / helyszín">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="pl. 1111 Budapest, Példa utca 1."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Szélesség (lat)">
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder="47.4979"
              />
            </Field>
            <Field label="Hosszúság (lng)">
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder="19.0402"
              />
            </Field>
          </div>
          <p className="-mt-2 text-xs text-text-muted">
            A koordináták a térkép nézethez és a kiszállási költség számításához kellenek. Később
            térkép- vagy címkereső API-val automatikusan kitölthető.
          </p>

          <Field label="Becsült érték (Ft)">
            <input
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              inputMode="numeric"
              className={inputClass}
              placeholder="350000"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ütemezett dátum">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Határidő">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Leírás">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaClass}
              rows={4}
              placeholder="Munka részletei…"
            />
          </Field>
        </Card>

        <Button type="submit" fullWidth size="lg">
          {isEdit ? "Mentés" : "Projekt létrehozása"}
        </Button>
      </form>
    </div>
  );
}
