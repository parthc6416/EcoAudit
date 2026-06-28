import { WasteLog } from "@/lib/types";
import {
  grandTotal,
  totalsByCategory,
  formatKg,
} from "@/lib/aggregations";

// "Live Totaling" dashboard: grand total + a featured E-Waste metric +
// a per-category breakdown. All computed from the fetched logs.
export default function StatsSummary({ logs }: { logs: WasteLog[] }) {
  const totals = totalsByCategory(logs);
  const total = grandTotal(logs);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Waste Logged"
          value={formatKg(total)}
          accent="bg-eco-600"
        />
        <StatCard
          label="Total E-Waste Logged"
          value={formatKg(totals["E-Waste"])}
          accent="bg-amber-500"
        />
        <StatCard
          label="Entries Recorded"
          value={`${logs.length}`}
          accent="bg-slate-700"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          By Category
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(totals).map(([category, kg]) => (
            <div
              key={category}
              className="rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-700">{category}</span>
              <span className="ml-2 text-slate-500">{formatKg(kg)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 ${accent}`} />
      <div className="p-4">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
