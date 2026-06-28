import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { WASTE_CATEGORIES, WasteCategory } from "@/lib/types";

// Always run fresh so the dashboard reflects the latest data.
export const dynamic = "force-dynamic";

// GET /api/logs -> all logs, newest first.
export async function GET() {
  const { data, error } = await supabase
    .from("waste_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data });
}

// POST /api/logs -> validate then insert a new log.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { category, weight_kg, latitude, longitude } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // --- Validation (anti-fraud / data integrity) ---
  if (!WASTE_CATEGORIES.includes(category as WasteCategory)) {
    return NextResponse.json(
      { error: `category must be one of: ${WASTE_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const weight = Number(weight_kg);
  if (!Number.isFinite(weight) || weight <= 0) {
    return NextResponse.json(
      { error: "weight_kg must be a number greater than 0." },
      { status: 400 }
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return NextResponse.json(
      { error: "latitude is required and must be between -90 and 90." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "longitude is required and must be between -180 and 180." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("waste_logs")
    .insert({
      category,
      weight_kg: weight,
      latitude: lat,
      longitude: lng,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data }, { status: 201 });
}
