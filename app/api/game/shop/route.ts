import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";

// GET /api/game/shop - Get shop players available for purchase
export async function GET() {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [gameUser, ownedPlayerDocs] = await Promise.all([
      GameUserModel.findOne({ userId: auth.userId }).lean(),
      GameOwnedPlayerModel.find({ userId: auth.userId }).select("playerId").lean(),
    ]);

    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    const ownedSet = new Set(ownedPlayerDocs.map((op) => op.playerId.toString()));
    const userXp = gameUser.xp || 0;
    const userCoins = gameUser.coins || 0;

    // Single aggregation pipeline — faster than loading all and filtering in JS
    const shopItems = await GamePlayerModel.aggregate([
      {
        $addFields: {
          is_owned: { $in: [{ $toString: "$_id" }, [...ownedSet].map((id) => id)] },
          can_afford: { $gte: [userCoins, { $ifNull: ["$price", 999999] }] },
          xp_met: { $gte: [userXp, { $ifNull: ["$required_xp", 0] }] },
        },
      },
      {
        $addFields: {
          locked: { $not: "$xp_met" },
          sort_order: {
            $cond: [{ $not: "$xp_met" }, 0, { $cond: ["$is_owned", 2, 1] }],
          },
        },
      },
      { $sort: { sort_order: 1, overall: -1 } },
      {
        $project: {
          _id: 1, player_id: 1, short_name: 1, long_name: 1,
          nationality: 1, positions: 1, overall: 1,
          pace: 1, shooting: 1, passing: 1, dribbling: 1,
          defending: 1, physic: 1, image_url: 1, rarity: 1,
          required_xp: 1, price: 1,
          is_owned: 1, can_afford: 1, xp_met: 1, locked: 1,
        },
      },
    ]);

    return NextResponse.json({ shopItems, userXp, userCoins });
  } catch (error) {
    await logError("/api/game/shop", "GET", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/game/shop - Buy a player
export async function POST(request: Request) {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { playerId } = await request.json();
    if (!playerId) {
      return NextResponse.json({ message: "Player ID is required" }, { status: 400 });
    }

    const gameUser = await GameUserModel.findOne({ userId: auth.userId });
    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    const player = await GamePlayerModel.findById(playerId).lean();
    if (!player) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }

    // Atomic check-and-buy using a single findOneAndUpdate for the user
    const alreadyOwned = await GameOwnedPlayerModel.findOne({
      userId: auth.userId,
      playerId,
    });
    if (alreadyOwned) {
      return NextResponse.json({ message: "Player already owned" }, { status: 400 });
    }

    if (gameUser.xp < (player.required_xp || 0)) {
      return NextResponse.json(
        { message: `Need ${player.required_xp} XP to unlock this player` },
        { status: 400 },
      );
    }

    const price = player.price ?? 0;
    if (gameUser.coins < price) {
      return NextResponse.json(
        { message: `Need ${price} coins. You have ${gameUser.coins}` },
        { status: 400 },
      );
    }

    // Deduct + grant in parallel
    const [updatedUser] = await Promise.all([
      GameUserModel.findOneAndUpdate(
        { userId: auth.userId, coins: { $gte: price } },
        { $inc: { coins: -price } },
        { returnDocument: "after" },
      ),
      GameOwnedPlayerModel.create({ userId: auth.userId, playerId }),
    ]);

    if (!updatedUser) {
      return NextResponse.json({ message: "Insufficient coins" }, { status: 400 });
    }

    return NextResponse.json({
      message: `${player.short_name} purchased!`,
      coins: updatedUser.coins,
    });
  } catch (error) {
    await logError("/api/game/shop", "POST", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
