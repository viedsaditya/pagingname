import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API Key untuk keamanan
const API_KEY = "rahasia";

// Function untuk validasi API key
function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  return apiKey === API_KEY;
}

// GET - Mengambil semua data station
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stations = await prisma.tb_station.findMany({
      select: {
        id_sts: true,
        code_station: true,
        name_station: true,
      },
      where: {
        is_active: 1, // Only get active stations
      },
      orderBy: {
        code_station: "asc",
      },
    });
    return NextResponse.json(stations);
  } catch (error: unknown) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}
