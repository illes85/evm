/** Fields every synced record carries. `updatedAt` decides which side wins
 * when the same record changed in two places, and `deletedAt` keeps a
 * tombstone around so a delete made offline still reaches the server (a
 * removed row would simply look like a row the other side never had). */
export interface SyncMeta {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** Bármely szinkronizált rekord közös alakja. */
export interface SyncRecord extends SyncMeta {
  id: string;
}

export type ProjectStatus = "lead" | "quoting" | "scheduled" | "in_progress" | "done" | "invoiced";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Client extends SyncMeta {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: GeoPoint;
  notes?: string;
}

export interface ProjectNote {
  id: string;
  text: string;
  createdAt: string;
  source: "manual" | "voice";
}

export interface Project extends SyncMeta {
  id: string;
  title: string;
  clientId?: string;
  status: ProjectStatus;
  address?: string;
  location?: GeoPoint;
  estimatedValue?: number;
  scheduledDate?: string;
  dueDate?: string;
  description?: string;
  notes: ProjectNote[];
}

export interface DocLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export interface Quote extends SyncMeta {
  id: string;
  number: string;
  projectId?: string;
  clientId?: string;
  status: QuoteStatus;
  items: DocLineItem[];
  validUntil?: string;
  note?: string;
}

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue";

export interface Invoice extends SyncMeta {
  id: string;
  number: string;
  projectId?: string;
  clientId?: string;
  quoteId?: string;
  status: InvoiceStatus;
  items: DocLineItem[];
  issueDate: string;
  dueDate: string;
  paidAt?: string;
}

export type LeadSource = "manual" | "google_sheets" | "google_business";

export interface Lead extends SyncMeta {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  source: LeadSource;
  note?: string;
  convertedProjectId?: string;
}

export type PlanTier = "basic" | "premium";
export type PaletteId = "ocean" | "sunset" | "forest" | "midnight" | "lavender" | "rose";
export type ThemeMode = "light" | "dark" | "system";

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: GeoPoint;
  iban?: string;
  currency: string;
  distanceRatePerKm: number;
}

export interface Settings {
  plan: PlanTier;
  palette: PaletteId;
  mode: ThemeMode;
  profile: BusinessProfile;
}
