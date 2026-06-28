"use client";

import { useCallback, useEffect, useState } from "react";
import { WasteLog } from "@/lib/types";
import WasteLogForm from "@/components/WasteLogForm";
import StatsSummary from "@/components/StatsSummary";
import LogList from "@/components/LogList";

export default function DashboardPage() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all logs from the API. Re-runnable so a new entry refreshes the feed.
  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load logs.");
      setLogs(data.logs ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          ♻️ EcoAudit
        </h1>
        <p className="mt-1 text-slate-500">
          Community Waste Logger — every entry is geo-verified to keep the data
          honest.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: the logging form */}
        <div className="lg:col-span-1">
          <WasteLogForm onLogged={loadLogs} />
        </div>

        {/* Right: live stats + audit feed */}
        <div className="space-y-8 lg:col-span-2">
          <StatsSummary logs={logs} />

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Audit Feed
            </h2>
            {loading ? (
              <p className="text-slate-500">Loading logs…</p>
            ) : (
              <LogList logs={logs} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
