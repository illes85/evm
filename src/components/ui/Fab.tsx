import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Fab({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform md:bottom-8 md:right-8"
    >
      <Plus size={26} />
    </Link>
  );
}
