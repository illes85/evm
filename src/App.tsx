import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { seedDatabase } from './db/seed'
import { ClientFormPage } from './pages/ClientFormPage'
import { ClientsPage } from './pages/ClientsPage'
import { DashboardPage } from './pages/DashboardPage'
import { QuoteEditorPage } from './pages/QuoteEditorPage'
import { QuotePreviewPage } from './pages/QuotePreviewPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedDatabase().then(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Betöltés...</div>
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/quotes/:id/preview" element={<QuotePreviewPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/quotes/:id" element={<QuoteEditorPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientFormPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
