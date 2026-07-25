import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import "@/lib/game/models/GamePlayer"; // Side-effect import to register schema
import { GameSquadModel } from "@/lib/game/models/GameSquad";
import { UserModel } from "@/lib/models/User";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// GET /api/game/user - Get current game user data
export async function GET() {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let gameUser = await GameUserModel.findOne({ userId: payload.userId });

    // Auto-create game user if doesn't exist
    if (!gameUser) {
      const appUser = await UserModel.findById(payload.userId);
      if (!appUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      gameUser = await GameUserModel.create({
        userId: payload.userId,
        username:
          appUser.first_name?.toLowerCase().replace(/\s+/g, "_") ||
          `user_${payload.userId.toString().slice(-4)}`,
      });
    }

    // Get owned players count
    const ownedCount = await GameOwnedPlayerModel.countDocuments({
      userId: payload.userId,
    });

    // Get active squad
    const activeSquad = await GameSquadModel.findOne({
      userId: payload.userId,
      is_active: true,
    }).populate("players.playerId");

    return NextResponse.json({
      gameUser: {
        ...gameUser.toObject(),
        _id: gameUser._id.toString(),
        userId: gameUser.userId.toString(),
        ownedCount,
        hasSquad: !!activeSquad,
        squadId: activeSquad?._id?.toString() || null,
      },
    });
  } catch (error) {
    await logError("/api/game/user", "GET", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// PUT /api/game/user - Update game user (username, etc.)
export async function PUT(request: Request) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { username } = await request.json();

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { message: "Username must be 3-20 characters" },
        { status: 400 },
      );
    }

    // Check uniqueness
    const existing = await GameUserModel.findOne({
      username,
      userId: { $ne: payload.userId },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 },
      );
    }

    const gameUser = await GameUserModel.findOneAndUpdate(
      { userId: payload.userId },
      { $set: { username } },
      { returnDocument: "after" },
    );

    if (!gameUser) {
      return NextResponse.json(
        { message: "Game user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ gameUser });
  } catch (error) {
    await logError("/api/game/user", "PUT", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
