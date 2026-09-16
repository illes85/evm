import { FileText } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { usePageTitle } from "../lib/usePageTitle";
import { FinancesTabs } from "../components/documents/FinancesTabs";
import { QuoteRow } from "../components/documents/QuoteRow";
import { EmptyState } from "../components/ui/EmptyState";
import { Fab } from "../components/ui/Fab";

export default function QuotesPage() {
  usePageTitle("Ajánlatok");
  const quotes = useAppStore((s) => s.quotes);
  const sorted = [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="px-4 pt-4 md:px-6">
      <FinancesTabs />

      {sorted.length === 0 ? (
        <EmptyState icon={FileText} title="Még nincs ajánlatod" description="Készíts egyet a jobb alsó gombbal." />
      ) : (
        <div className="mt-4 space-y-3 pb-4">
          {sorted.map((quote) => (
            <QuoteRow key={quote.id} quote={quote} />
          ))}
        </div>
      )}

      <Fab to="/quotes/new" label="Új ajánlat" />
    </div>
  );
}
