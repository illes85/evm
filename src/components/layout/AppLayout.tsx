import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-slate-900">Árajánlat készítő</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Árajánlatok
            </NavLink>
            <NavLink to="/clients" className={navLinkClass}>
              Ügyfelek
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Beállítások
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
