import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { PageTitleProvider } from "./lib/usePageTitle";
import { useThemeEffect } from "./theme/useThemeEffect";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectFormPage from "./pages/ProjectFormPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ClientFormPage from "./pages/ClientFormPage";
import QuotesPage from "./pages/QuotesPage";
import QuoteDetailPage from "./pages/QuoteDetailPage";
import QuoteFormPage from "./pages/QuoteFormPage";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoiceFormPage from "./pages/InvoiceFormPage";
import LeadsPage from "./pages/LeadsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

const MapPage = lazy(() => import("./pages/MapPage"));

function ThemedRoutes() {
  useThemeEffect();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectFormPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<ProjectFormPage />} />

        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<ClientFormPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/clients/:id/edit" element={<ClientFormPage />} />

        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/new" element={<QuoteFormPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        <Route path="/quotes/:id/edit" element={<QuoteFormPage />} />

        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/new" element={<InvoiceFormPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />

        <Route path="/leads" element={<LeadsPage />} />
        <Route
          path="/map"
          element={
            <Suspense fallback={<div className="p-6 text-sm text-text-muted">Térkép betöltése…</div>}>
              <MapPage />
            </Suspense>
          }
        />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <PageTitleProvider>
      <ThemedRoutes />
    </PageTitleProvider>
  );
}
