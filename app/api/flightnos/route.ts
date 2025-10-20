import { NextRequest, NextResponse } from "next/server";

// Proxy to external API with Basic Auth and return list of flight numbers
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const station = searchParams.get("station") || "CGK";
  const startDate = searchParams.get("start_date");
  const toDate = searchParams.get("to_date");
  const source = searchParams.get("source") || "ALL";

  // Default date: today in YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  const sd = startDate || defaultDate;
  const td = toDate || defaultDate;

  const url = `https://nexus.ptjas.co.id/restapinexusgen?type=arrival&station=${encodeURIComponent(
    station
  )}&start_date=${encodeURIComponent(sd)}&to_date=${encodeURIComponent(
    td
  )}&source=${encodeURIComponent(source)}`;

  const username = "nexus";
  const password = "Nexus@2025";
  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
      },
      // Disable cache to keep data fresh
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Upstream error", status: resp.status, body: text },
        { status: 502 }
      );
    }

    const data = await resp.json();

    // Normalize response: try to collect distinct flight numbers (robust)
    type FlightItem = { [key: string]: unknown };
    const extractFromArray = (arr: unknown[]): string[] => {
      const out: string[] = [];
      for (const item of arr) {
        if (typeof item === "string") {
          out.push(item);
          continue;
        }
        if (item && typeof item === "object") {
          const obj = item as FlightItem;
          // Try common keys
          const candidates = [
            obj["flight_no"],
            obj["flightNo"],
            obj["flight"],
            obj["FLIGHT_NO"],
            obj["FLIGHT"],
          ].filter(Boolean);
          if (candidates.length) {
            out.push(String(candidates[0]));
            continue;
          }
          // Fallback: search any key containing "flight"
          for (const [k, v] of Object.entries(obj)) {
            if (/flight/i.test(k) && v) {
              out.push(String(v));
              break;
            }
          }
        }
      }
      return Array.from(new Set(out.filter(Boolean)));
    };

    let flightNos: string[] = [];
    if (Array.isArray(data)) {
      flightNos = extractFromArray(data);
    } else if (data && Array.isArray((data as { data?: unknown[] }).data)) {
      flightNos = extractFromArray((data as { data: unknown[] }).data);
    }

    return NextResponse.json({ flightNos });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}


