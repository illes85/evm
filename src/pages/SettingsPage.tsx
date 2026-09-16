import { useState, type FormEvent } from "react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { inputClass } from "../lib/formStyles";
import { Field } from "../components/ui/Field";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PlanCard } from "../components/settings/PlanCard";
import { ThemePicker } from "../components/settings/ThemePicker";
import { IntegrationsCard } from "../components/settings/IntegrationsCard";

export default function SettingsPage() {
  usePageTitle("Beállítások");
  const profile = useAppStore((s) => s.settings.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [saved, setSaved] = useState(false);

  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [taxId, setTaxId] = useState(profile.taxId ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [lat, setLat] = useState(profile.location?.lat?.toString() ?? "");
  const [lng, setLng] = useState(profile.location?.lng?.toString() ?? "");
  const [distanceRatePerKm, setDistanceRatePerKm] = useState(profile.distanceRatePerKm.toString());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      taxId: taxId.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      location: lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined,
      distanceRatePerKm: Number(distanceRatePerKm) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-5 px-4 pb-10 pt-4 md:px-6">
      <section>
        <h2 className="mb-2 px-0.5 text-sm font-semibold text-text-muted">Csomag</h2>
        <PlanCard />
      </section>

      <section>
        <h2 className="mb-2 px-0.5 text-sm font-semibold text-text-muted">Megjelenés</h2>
        <Card className="p-4">
          <ThemePicker />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 px-0.5 text-sm font-semibold text-text-muted">Vállalkozás adatai</h2>
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Vállalkozás neve">
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Tulajdonos neve">
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Adószám">
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Telefon">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Székhely címe">
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
            <Field label="Kiszállási díj (Ft/km)">
              <input
                value={distanceRatePerKm}
                onChange={(e) => setDistanceRatePerKm(e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </Field>
            <Button type="submit" fullWidth>
              {saved ? "Mentve ✓" : "Mentés"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 px-0.5 text-sm font-semibold text-text-muted">Integrációk és lead-ek</h2>
        <IntegrationsCard />
      </section>
    </div>
  );
}
