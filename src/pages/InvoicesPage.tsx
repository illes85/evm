import { Receipt } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { FinancesTabs } from "../components/documents/FinancesTabs";
import { InvoiceRow } from "../components/documents/InvoiceRow";
import { EmptyState } from "../components/ui/EmptyState";
import { Fab } from "../components/ui/Fab";

export default function InvoicesPage() {
  usePageTitle("Számlák");
  const invoices = useAppStore((s) => s.invoices);
  const sorted = [...invoices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="px-4 pt-4 md:px-6">
      <FinancesTabs />

      {sorted.length === 0 ? (
        <EmptyState icon={Receipt} title="Még nincs számlád" description="Készíts egyet a jobb alsó gombbal." />
      ) : (
        <div className="mt-4 space-y-3 pb-4">
          {sorted.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}

      <Fab to="/invoices/new" label="Új számla" />
    </div>
  );
}
