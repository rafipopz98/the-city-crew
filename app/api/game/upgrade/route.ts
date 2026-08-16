import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { GameUserModel } from "@/lib/game/models/GameUser";
import { GameOwnedPlayerModel } from "@/lib/game/models/GameOwnedPlayer";
import { calculateEffectiveOverall } from "@/lib/game/utils/positionMapping";
import { logError } from "@/lib/errorLogger";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// ─── Cost Calculation ──────────────────────────────────────────────────────
// The higher the NEW stat value, the more coins it costs.
function getCoinCost(newValue: number): number {
  if (newValue >= 95) return 1000;
  if (newValue >= 90) return 500;
  if (newValue >= 85) return 200;
  if (newValue >= 80) return 100;
  return 50;
}

// XP gate: minimum XP required to upgrade TO a certain stat value.
// XP is NOT consumed — it's a requirement check.
function getRequiredXp(newValue: number): number {
  if (newValue >= 95) return 20000;
  if (newValue >= 90) return 10000;
  if (newValue >= 85) return 5000;
  if (newValue >= 80) return 2000;
  return 500;
}

const VALID_STATS = ["pace", "shooting", "passing", "dribbling", "defending", "physic"] as const;
type StatName = (typeof VALID_STATS)[number];

// POST /api/game/upgrade - Upgrade a stat on an owned player
export async function POST(request: Request) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ownedPlayerId, stat } = await request.json();

    if (!ownedPlayerId || !stat) {
      return NextResponse.json(
        { message: "ownedPlayerId and stat are required" },
        { status: 400 },
      );
    }

    if (!VALID_STATS.includes(stat as StatName)) {
      return NextResponse.json(
        { message: `Invalid stat. Must be one of: ${VALID_STATS.join(", ")}` },
        { status: 400 },
      );
    }

    await connectDB();

    // Load user + owned player in parallel
    // Note: ownedPlayerId is the GamePlayer catalog ID (sent from the player detail page)
    // We look up by playerId (the catalog reference) to find the user's copy.
    const [gameUser, ownedPlayer] = await Promise.all([
      GameUserModel.findOne({ userId: payload.userId }),
      GameOwnedPlayerModel.findOne({
        playerId: ownedPlayerId,
        userId: payload.userId,
      }).populate<{ playerId: any }>("playerId"),
    ]);

    if (!gameUser) {
      return NextResponse.json({ message: "Game user not found" }, { status: 404 });
    }

    if (!ownedPlayer) {
      return NextResponse.json(
        { message: "Player not found or not owned by you" },
        { status: 404 },
      );
    }

    const player = ownedPlayer.playerId as any;
    const baseStat = player[stat] || 0;
    const upgradeLevel = (ownedPlayer.upgrades as any)?.[stat] || 0;
    const effectiveStat = baseStat + upgradeLevel;
    const newValue = effectiveStat + 1;
    const coinCost = getCoinCost(newValue);
    const requiredXp = getRequiredXp(newValue);

    // ── Check XP gate (not consumed, just required to have) ──────────────
    if (gameUser.xp < requiredXp) {
      return NextResponse.json(
        {
          message: `Need ${requiredXp} total XP to upgrade ${stat} to ${newValue}. You have ${gameUser.xp} XP.`,
          requiredXp,
          userXp: gameUser.xp,
        },
        { status: 400 },
      );
    }

    // ── Check coins (consumed) ───────────────────────────────────────────
    if (gameUser.coins < coinCost) {
      return NextResponse.json(
        {
          message: `Need ${coinCost} coins to upgrade ${stat}. You have ${gameUser.coins} coins.`,
          coinCost,
          userCoins: gameUser.coins,
        },
        { status: 400 },
      );
    }

    // ── Deduct coins FIRST, guarded by balance — only apply the stat
    // increment if the deduction actually succeeded. Running these as an
    // unguarded Promise.all previously let the upgrade apply even when the
    // coin deduction lost a race and failed the balance check (free upgrade).
    const updatedUser = await GameUserModel.findOneAndUpdate(
      { userId: payload.userId, coins: { $gte: coinCost } },
      { $inc: { coins: -coinCost } },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "Insufficient coins" }, { status: 400 });
    }

    const upgradeKey = `upgrades.${stat}`;
    const updatedOwnedPlayer = await GameOwnedPlayerModel.findOneAndUpdate(
      { playerId: ownedPlayerId, userId: payload.userId },
      { $inc: { [upgradeKey]: 1, total_upgrade_cost: coinCost } },
      { returnDocument: "after" },
    );

    if (!updatedOwnedPlayer) {
      // Extremely unlikely (the player existed moments ago), but if it
      // happens, refund the coins already taken rather than keeping them
      // for an upgrade that was never applied.
      await GameUserModel.updateOne(
        { userId: payload.userId },
        { $inc: { coins: coinCost } },
      );
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `${player.short_name}'s ${stat} upgraded to ${newValue}! 🎯`,
      stat,
      newValue,
      effectiveOverall: calculateEffectiveOverall(
        player,
        updatedOwnedPlayer.upgrades as any,
        player.positions,
      ),
      coins: updatedUser.coins,
      xp: updatedUser.xp,
      upgradeLevel: upgradeLevel + 1,
    });
  } catch (error) {
    await logError("/api/game/upgrade", "POST", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}


