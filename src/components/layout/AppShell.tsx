import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { useCurrentTitle } from "../../lib/usePageTitle";

export function AppShell() {
  const title = useCurrentTitle();

  return (
    <div className="flex min-h-dvh bg-bg text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
