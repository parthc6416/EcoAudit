import { WasteLog, WasteCategory, WASTE_CATEGORIES } from "./types";

// Pure helpers for the "Live Totaling" dashboard metrics.
// Kept free of React/DB so they are easy to read and test.

export type CategoryTotals = Record<WasteCategory, number>;

/** Total weight (kg) logged per category. Categories with no logs report 0. */
export function totalsByCategory(logs: WasteLog[]): CategoryTotals {
  const totals = Object.fromEntries(
    WASTE_CATEGORIES.map((c) => [c, 0])
  ) as CategoryTotals;

  for (const log of logs) {
    totals[log.category] += Number(log.weight_kg);
  }
  return totals;
}

/** Grand total weight (kg) across every log. */
export function grandTotal(logs: WasteLog[]): number {
  return logs.reduce((sum, log) => sum + Number(log.weight_kg), 0);
}

/** Round to one decimal place for display. */
export function formatKg(value: number): string {
  return `${Math.round(value * 10) / 10} kg`;
}
