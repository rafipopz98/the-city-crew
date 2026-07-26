import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { GameSquadModel } from "@/lib/game/models/GameSquad";
import { UserModel } from "@/lib/models/User";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";

const POSITIONS: ("GK" | "DEF" | "MID" | "FWD")[] = ["GK", "DEF", "MID", "MID", "FWD"];

// GET /api/game/user/onboarding - Check if user has a username set
export async function GET() {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const appUser = await UserModel.findById(auth.userId).select("username");
    const hasUsername = !!(appUser?.username);

    return NextResponse.json({ hasUsername, username: appUser?.username || null });
  } catch (error) {
    await logError("/api/game/user/onboarding", "GET", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/game/user/onboarding - Complete onboarding
export async function POST(request: Request) {
  try {
    const auth = await getUserIdFromAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { username } = await request.json();

    // Get username: from body or from User model
    let finalUsername = username?.trim();

    if (!finalUsername || finalUsername.length < 3) {
      // Get from User model or auto-generate from first_name + last_name
      const appUser = await UserModel.findById(auth.userId).select("username first_name last_name");
      finalUsername = appUser?.username;

      if ((!finalUsername || finalUsername.length < 3) && appUser?.first_name) {
        const base = (appUser.first_name + (appUser.last_name ? `_${appUser.last_name}` : ''))
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20);
        finalUsername = base.length >= 3 ? base : base + Math.random().toString(36).slice(2, 6);
      } else if (!finalUsername || finalUsername.length < 3) {
        return NextResponse.json(
          { message: "Username is required (min 3 characters)" },
          { status: 400 },
        );
      }
    }

    const existingUsername = await GameUserModel.findOne({ username: finalUsername });
    if (existingUsername && existingUsername.userId.toString() !== auth.userId) {
      return NextResponse.json({ message: "Username already taken" }, { status: 409 });
    }

    let gameUser = await GameUserModel.findOne({ userId: auth.userId });

    // If GameUser doesn't exist yet (first time), create it
    if (!gameUser) {
      gameUser = await GameUserModel.create({
        userId: auth.userId,
        username: finalUsername,
        coins: 0,
        has_completed_onboarding: false,
        starter_pack_claimed: false,
      });
    }

    // If GameUser exists but onboarding already done, return early
    if (gameUser.starter_pack_claimed) {
      return NextResponse.json({ message: "Onboarding already completed", gameUser });
    }

    // Get 5 random starter players in a single aggregation
    let starterPlayers = await GamePlayerModel.aggregate([
      { $match: { rarity: { $in: ["Basic", "Common", "Uncommon"] }, overall: { $lte: 82 } } },
      { $sample: { size: 5 } },
    ]);

    if (starterPlayers.length < 5) {
      const extra = await GamePlayerModel.aggregate([{ $sample: { size: 5 - starterPlayers.length } }]);
      starterPlayers.push(...extra);
    }

    // Bulk create owned players
    const ownedDocs = starterPlayers.map((sp, i) => ({
      userId: auth.userId,
      playerId: sp._id,
      in_squad: true,
      squad_position: POSITIONS[i],
      squad_slot: i,
    }));

    const createdOwned = await GameOwnedPlayerModel.insertMany(ownedDocs);

    // Create squad
    const squad = await GameSquadModel.create({
      userId: auth.userId,
      name: "My First Squad",
      formation: "1-1-2-1",
      players: createdOwned.map((op, i) => ({
        ownedPlayerId: op._id,
        playerId: starterPlayers[i]._id,
        position: POSITIONS[i],
        slot: i,
      })),
      is_active: true,
    });

    // Update game user in a single operation
    gameUser.starter_pack_claimed = true;
    gameUser.has_completed_onboarding = true;
    gameUser.active_squad_id = squad._id;
    gameUser.coins = 500;
    await gameUser.save();

    return NextResponse.json({
      message: "Onboarding complete!",
      gameUser: {
        ...gameUser.toObject(),
        _id: gameUser._id.toString(),
        userId: gameUser.userId.toString(),
      },
      squad: squad.toObject(),
      starterPlayers: starterPlayers.map((sp, i) => ({
        ...sp,
        position: POSITIONS[i],
      })),
    });
  } catch (error) {
    await logError("/api/game/user/onboarding", "POST", error);
    console.error("Onboarding error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
