import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { verifyToken } from "@/lib/auth/jwt";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    // Admin auth check
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await UserModel.findById(payload.userId).select("role");
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    let query: any = {};

    if (search) {
      // Search by username directly
      query.username = { $regex: search, $options: "i" };
    }

    const totalUsers = await GameUserModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    const skip = (page - 1) * limit;

    const gameUsers = await GameUserModel.find(query)
      .populate("userId", "first_name last_name email")
      .sort({ xp: -1, coins: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      gameUsers,
      currentPage: page,
      totalPages,
      totalUsers,
    });
  } catch (error) {
    await logError("/api/admin/game-users", "GET", error);
    console.error("Error fetching game users:", error);
    return NextResponse.json(
      { error: "Failed to fetch game users" },
      { status: 500 },
    );
  }
}
