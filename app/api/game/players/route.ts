import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { POSITION_GROUPS } from "@/lib/game/utils/positionMapping";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const rarity = searchParams.get("rarity");
    const position = searchParams.get("position");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "overall";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, any> = {};

    if (rarity && rarity !== "all") {
      filter.rarity = rarity;
    }

    if (position) {
      const specificPositions = POSITION_GROUPS[position];
      if (specificPositions) {
        filter.positions = { $in: specificPositions };
      }
    }

    if (search) {
      filter.$or = [
        { short_name: { $regex: search, $options: "i" } },
        { long_name: { $regex: search, $options: "i" } },
        { nationality: { $regex: search, $options: "i" } },
      ];
    }

    const total = await GamePlayerModel.countDocuments(filter);
    const players = await GamePlayerModel.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      players,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    await logError("/api/game/players", "GET", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
