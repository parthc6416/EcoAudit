import { WasteLog } from "@/lib/types";
import LogCard from "./LogCard";

// Responsive grid of log cards (the audit feed).
export default function LogList({ logs }: { logs: WasteLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-10 text-center text-slate-500">
        No waste logged yet. Be the first to add an entry above! ♻️
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {logs.map((log) => (
        <LogCard key={log.id} log={log} />
      ))}
    </div>
  );
}
