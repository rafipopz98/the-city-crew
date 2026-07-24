import { connectDB } from "@/lib/db/mongoose";
import { SeasonModel } from "@/lib/models/Season";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const seasons = await SeasonModel.find().sort({ year: -1 }).lean();

    return NextResponse.json(seasons);
  } catch (error) {
    await logError("/api/admin/seasons", "GET", error);
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { error: "Failed to fetch seasons" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const season = await SeasonModel.create(body);

    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    await logError("/api/admin/seasons", "POST", error);
    console.error("Error creating season:", error);
    return NextResponse.json(
      { error: "Failed to create season" },
      { status: 500 },
    );
  }
}
