import { LayoutGrid, MapPin, Receipt, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  premium?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Projektek", icon: LayoutGrid },
  { to: "/clients", label: "Ügyfelek", icon: Users },
  { to: "/quotes", label: "Pénzügyek", icon: Receipt },
  { to: "/map", label: "Térkép", icon: MapPin, premium: true },
];
