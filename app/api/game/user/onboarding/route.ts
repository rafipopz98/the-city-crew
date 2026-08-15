import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { GamePlayerModel } from "@/lib/game/models/GamePlayer";
import { GameSquadModel } from "@/lib/game/models/GameSquad";
import { UserModel } from "@/lib/models/User";
import { logError } from "@/lib/errorLogger";
import { getUserIdFromAuth } from "@/lib/game/utils/auth";
import { POSITION_GROUPS } from "@/lib/game/utils/positionMapping";

type SlotPosition = "GK" | "DEF" | "MID" | "FWD";

const SLOT_POSITIONS: SlotPosition[] = ["GK", "DEF", "MID", "MID", "FWD"];

// Starter squads are heavily weighted toward weak players so a strong one is
// a rare, exciting pull rather than the norm — see onboarding rarity design.
const STARTER_TIER_WEIGHTS: { rarity: "Basic" | "Common" | "Uncommon"; weight: number }[] = [
  { rarity: "Basic", weight: 70 },
  { rarity: "Common", weight: 22 },
  { rarity: "Uncommon", weight: 7 },
];
const JACKPOT_WEIGHT = 1; // ~1%: strongest eligible player for the slot instead of a rarity roll
const STARTER_OVERALL_CAP = 82;
const STARTER_RARITIES = STARTER_TIER_WEIGHTS.map((t) => t.rarity);

function rollStarterTier(): "Basic" | "Common" | "Uncommon" | "jackpot" {
  const totalWeight =
    STARTER_TIER_WEIGHTS.reduce((sum, t) => sum + t.weight, 0) + JACKPOT_WEIGHT;
  let roll = Math.random() * totalWeight;
  for (const tier of STARTER_TIER_WEIGHTS) {
    if (roll < tier.weight) return tier.rarity;
    roll -= tier.weight;
  }
  return "jackpot";
}

// Draws one starter player whose real `positions` field matches the given
// broad slot (so a right-back can never end up labeled GK), excluding
// players already drawn for an earlier slot in this squad.
async function pickStarterForSlot(position: SlotPosition, excludeIds: Set<string>) {
  const baseMatch = {
    positions: { $in: POSITION_GROUPS[position] },
    rarity: { $in: STARTER_RARITIES },
    overall: { $lte: STARTER_OVERALL_CAP },
    // Raw aggregate() pipelines skip Mongoose's usual string->ObjectId cast,
    // so $nin needs real ObjectId instances or it silently matches nothing.
    _id: { $nin: [...excludeIds].map((id) => new Types.ObjectId(id)) },
  };

  const tier = rollStarterTier();

  if (tier === "jackpot") {
    const top = await GamePlayerModel.aggregate([
      { $match: baseMatch },
      { $sort: { overall: -1 } },
      { $limit: 3 },
    ]);
    if (top.length > 0) return top[Math.floor(Math.random() * top.length)];
  } else {
    const [picked] = await GamePlayerModel.aggregate([
      { $match: { ...baseMatch, rarity: tier } },
      { $sample: { size: 1 } },
    ]);
    if (picked) return picked;
  }

  // Tier (or jackpot) pool was empty for this slot — fall back to the full
  // eligible pool for the position rather than failing onboarding.
  const [fallback] = await GamePlayerModel.aggregate([
    { $match: baseMatch },
    { $sample: { size: 1 } },
  ]);
  return fallback;
}

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

    // Draw one starter per formation slot, matched to that player's real
    // position (see pickStarterForSlot above) — sequential so each slot can
    // exclude players already drawn for an earlier slot in this squad.
    const starterPlayers: any[] = [];
    const drawnIds = new Set<string>();
    for (const position of SLOT_POSITIONS) {
      const player = await pickStarterForSlot(position, drawnIds);
      if (player) {
        starterPlayers.push(player);
        drawnIds.add(player._id.toString());
      }
    }

    if (starterPlayers.length < 5) {
      // Last resort so onboarding never hard-fails — shouldn't normally
      // trigger given the current player pool.
      const extra = await GamePlayerModel.aggregate([
        { $match: { _id: { $nin: [...drawnIds].map((id) => new Types.ObjectId(id)) } } },
        { $sample: { size: 5 - starterPlayers.length } },
      ]);
      starterPlayers.push(...extra);
    }

    // Bulk create owned players
    const ownedDocs = starterPlayers.map((sp, i) => ({
      userId: auth.userId,
      playerId: sp._id,
      in_squad: true,
      squad_position: SLOT_POSITIONS[i],
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
        position: SLOT_POSITIONS[i],
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
        position: SLOT_POSITIONS[i],
      })),
    });
  } catch (error) {
    await logError("/api/game/user/onboarding", "POST", error);
    console.error("Onboarding error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
