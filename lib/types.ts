// Shared types used across the form, API routes, list, and aggregations.

export const WASTE_CATEGORIES = [
  "Plastic",
  "E-Waste",
  "Organic",
  "Paper",
  "Glass",
  "Metal",
] as const;

export type WasteCategory = (typeof WASTE_CATEGORIES)[number];

export interface WasteLog {
  id: string;
  category: WasteCategory;
  weight_kg: number;
  latitude: number;
  longitude: number;
  created_at: string; // ISO timestamp
}

// Shape the client sends to POST /api/logs.
export interface NewWasteLog {
  category: WasteCategory;
  weight_kg: number;
  latitude: number;
  longitude: number;
}
