import { WasteCategory } from "@/lib/types";

// Color mapping so each waste category is visually distinct.
const STYLES: Record<WasteCategory, string> = {
  Plastic: "bg-blue-100 text-blue-700",
  "E-Waste": "bg-amber-100 text-amber-700",
  Organic: "bg-green-100 text-green-700",
  Paper: "bg-orange-100 text-orange-700",
  Glass: "bg-cyan-100 text-cyan-700",
  Metal: "bg-slate-200 text-slate-700",
};

export default function CategoryBadge({
  category,
}: {
  category: WasteCategory;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[category]}`}
    >
      {category}
    </span>
  );
}
