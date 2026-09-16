import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { inputClass, textareaClass } from "../lib/formStyles";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const existing = useAppStore((s) => s.clients.find((c) => c.id === id));
  const addClient = useAppStore((s) => s.addClient);
  const updateClient = useAppStore((s) => s.updateClient);

  usePageTitle(isEdit ? "Ügyfél szerkesztése" : "Új ügyfél");

  const [name, setName] = useState(existing?.name ?? "");
  const [companyName, setCompanyName] = useState(existing?.companyName ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [lat, setLat] = useState(existing?.location?.lat?.toString() ?? "");
  const [lng, setLng] = useState(existing?.location?.lng?.toString() ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  if (isEdit && !existing) {
    return <Navigate to="/clients" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
    const payload = {
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      location,
      notes: notes.trim() || undefined,
    };

    if (existing) {
      updateClient(existing.id, payload);
      navigate(`/clients/${existing.id}`);
    } else {
      const created = addClient(payload);
      navigate(`/clients/${created.id}`);
    }
  }

  return (
    <div className="px-4 pb-10 pt-3 md:px-6">
      <Link
        to={isEdit && id ? `/clients/${id}` : "/clients"}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} />
        Vissza
      </Link>

      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <Card className="space-y-4 p-4">
          <Field label="Név *">
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Cégnév">
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefon">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Cím">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Szélesség (lat)">
              <input value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" className={inputClass} />
            </Field>
            <Field label="Hosszúság (lng)">
              <input value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" className={inputClass} />
            </Field>
          </div>
          <Field label="Megjegyzés">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={textareaClass} rows={3} />
          </Field>
        </Card>
        <Button type="submit" fullWidth size="lg">
          {isEdit ? "Mentés" : "Ügyfél létrehozása"}
        </Button>
      </form>
    </div>
  );
}
