"use client";

import { useState } from "react";
import { WASTE_CATEGORIES, WasteCategory } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

// Promisified wrapper around the browser Geolocation API.
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

// Translate Geolocation API error codes into friendly messages.
function describeGeoError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as GeolocationPositionError).code;
    if (code === 1)
      return "Location permission denied. You must allow location access to log waste.";
    if (code === 2) return "Your location is currently unavailable. Try again.";
    if (code === 3) return "Getting your location timed out. Try again.";
  }
  return err instanceof Error ? err.message : "Could not get your location.";
}

export default function WasteLogForm({
  onLogged,
}: {
  onLogged: () => void;
}) {
  const [category, setCategory] = useState<WasteCategory>("Plastic");
  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy = status.kind === "locating" || status.kind === "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const weightNum = Number(weight);
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setStatus({ kind: "error", message: "Enter a weight greater than 0." });
      return;
    }

    try {
      // 1. Capture real coordinates via the browser. No manual input allowed.
      setStatus({ kind: "locating" });
      const pos = await getCurrentPosition();

      // 2. Submit to our API.
      setStatus({ kind: "submitting" });
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          weight_kg: weightNum,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save the log.");
      }

      // 3. Success: reset the form and refresh the dashboard.
      setStatus({ kind: "success" });
      setWeight("");
      onLogged();
      setTimeout(() => setStatus({ kind: "idle" }), 3000);
    } catch (err) {
      setStatus({ kind: "error", message: describeGeoError(err) });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-800">Log Waste</h2>

      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Waste Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as WasteCategory)}
          disabled={busy}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-eco-500 focus:outline-none focus:ring-2 focus:ring-eco-100"
        >
          {WASTE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="weight"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Weight (kg)
        </label>
        <input
          id="weight"
          type="number"
          min="0"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          disabled={busy}
          placeholder="e.g. 2.5"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-eco-500 focus:outline-none focus:ring-2 focus:ring-eco-100"
        />
      </div>

      <p className="text-xs text-slate-400">
        📍 Your location is captured automatically on submit to verify the entry.
        There is no manual location field.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-eco-600 px-4 py-2.5 font-semibold text-white transition hover:bg-eco-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "locating"
          ? "Getting location…"
          : status.kind === "submitting"
          ? "Submitting…"
          : "Log Waste Entry"}
      </button>

      {status.kind === "success" && (
        <p className="rounded-lg bg-eco-50 px-3 py-2 text-sm font-medium text-eco-700">
          Waste logged successfully ✅
        </p>
      )}
      {status.kind === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {status.message}
        </p>
      )}
    </form>
  );
}
