import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { VisitorGeoModel } from "@/lib/models/VisitorGeo";

const GEO_URL = "https://get.geojs.io/v1/ip/geo.json";

export async function GET() {
  try {
    await connectDB();

    const response = await fetch(GEO_URL, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch geo data" },
        { status: 502 },
      );
    }

    const geo = await response.json();

    const record = await VisitorGeoModel.findOneAndUpdate(
      { ip: geo.ip },
      {
        $set: {
          ...geo,
          last_seen_at: new Date(),
        },
        $inc: {
          count: 1,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      ...geo,
      total_visits: record.count,
    });
  } catch (error) {
    console.error("GEO_API_ERROR:", error);

    return NextResponse.json(
      { error: "Geo-location service unavailable" },
      { status: 503 },
    );
  }
}
