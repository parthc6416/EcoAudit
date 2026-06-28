import { WasteLog } from "@/lib/types";
import { formatKg } from "@/lib/aggregations";
import CategoryBadge from "./CategoryBadge";

// A single waste log rendered as a card, including the captured coordinates.
export default function LogCard({ log }: { log: WasteLog }) {
  const when = new Date(log.created_at).toLocaleString();
  const coords = `${log.latitude.toFixed(5)}, ${log.longitude.toFixed(5)}`;
  const mapsUrl = `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <CategoryBadge category={log.category} />
        <span className="text-lg font-bold text-slate-800">
          {formatKg(Number(log.weight_kg))}
        </span>
      </div>

      <dl className="mt-3 space-y-1 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <span aria-hidden>📍</span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-600 underline-offset-2 hover:text-eco-700 hover:underline"
            title="Open in Google Maps"
          >
            {coords}
          </a>
        </div>
        <div className="flex items-center gap-1">
          <span aria-hidden>🕒</span>
          <span>{when}</span>
        </div>
      </dl>
    </div>
  );
}
