import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { VisitorGeoModel } from "@/lib/models/VisitorGeo";

const GEO_JS_URL = "https://get.geojs.io/v1/ip/geo.json";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get the visitor's IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "";

    // Fetch geo data from geojs.io
    // If we have the IP, pass it; otherwise geojs.io returns the requestor's IP
    const url = ip ? `${GEO_JS_URL}?ip=${ip}` : GEO_JS_URL;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch geo data" },
        { status: 502 },
      );
    }

    const data = await res.json();

    // ─── Persist in DB (upsert by IP) ────────────────────────────────
    const geoRecord = await VisitorGeoModel.findOneAndUpdate(
      { ip: data.ip || ip },
      {
        $set: {
          country: data.country || null,
          country_code: data.country_code || null,
          country_code3: data.country_code3 || null,
          region: data.region || null,
          city: data.city || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          timezone: data.timezone || null,
          organization: data.organization || null,
          organization_name: data.organization_name || null,
          asn: data.asn || null,
          accuracy: data.accuracy || null,
          area_code: data.area_code || null,
          continent_code: data.continent_code || null,
          last_seen_at: new Date(),
        },
        $inc: { count: 1 },
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Return the geo data in a consistent format
    return NextResponse.json({
      ip: data.ip || ip,
      country: data.country || null,
      country_code: data.country_code || null,
      country_code3: data.country_code3 || null,
      region: data.region || null,
      city: data.city || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone: data.timezone || null,
      organization: data.organization || null,
      organization_name: data.organization_name || null,
      asn: data.asn || null,
      accuracy: data.accuracy || null,
      area_code: data.area_code || null,
      continent_code: data.continent_code || null,
      total_visits: geoRecord?.count || 1,
    });
  } catch (error) {
    console.error("GEO_API_ERROR:", error);
    return NextResponse.json(
      { error: "Geo-location service unavailable" },
      { status: 503 },
    );
  }
}
