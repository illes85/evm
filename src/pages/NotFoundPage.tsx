import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import { usePageTitle } from "../lib/usePageTitle";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

export default function NotFoundPage() {
  usePageTitle("Nem található");
  return (
    <div className="px-4 pt-16">
      <EmptyState
        icon={CompassIcon}
        title="A keresett oldal nem található"
        action={
          <Link to="/">
            <Button size="sm">Vissza a kezdőlapra</Button>
          </Link>
        }
      />
    </div>
  );
}
