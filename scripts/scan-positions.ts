/**
 * One-time script to scan all unique positions from the GamePlayer collection.
 *
 * Run: npx tsx scripts/scan-positions.ts
 *
 * This connects to MongoDB, queries all game_players, extracts every unique
 * position from their `positions` array, and logs the results. Use the output
 * to verify that POSITION_GROUPS in lib/game/utils/positionMapping.ts covers
 * all positions that actually exist in the database.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tcc";

async function scanPositions() {
  await mongoose.connect(MONGODB_URI);
  console.log(`\n🔗 Connected to MongoDB: ${MONGODB_URI}\n`);

  const db = mongoose.connection.db!;
  const collection = db.collection("game_players");

  // Get all unique positions across all players
  const result = await collection
    .aggregate([
      { $unwind: "$positions" },
      { $group: { _id: "$positions", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  const totalPlayers = await collection.countDocuments();

  console.log(`📊 Total players in DB: ${totalPlayers}`);
  console.log(`🏷️  Unique positions found: ${result.length}\n`);

  console.log("Position  |  Count  |  % of players");
  console.log("──────────────────────────────────");
  for (const row of result) {
    const pct = ((row.count / totalPlayers) * 100).toFixed(1);
    console.log(`${(row._id as string).padEnd(9)} | ${String(row.count).padStart(6)} | ${pct}%`);
  }

  // Also show which positions are NOT covered by POSITION_GROUPS
  const { POSITION_GROUPS } = await import(
    "../lib/game/utils/positionMapping"
  );
  const allMapped = new Set(Object.values(POSITION_GROUPS).flat());
  const unmapped = result.filter((r: any) => !allMapped.has(r._id));

  if (unmapped.length > 0) {
    console.log("\n⚠️  UNMAPPED positions (not in POSITION_GROUPS):");
    for (const row of unmapped) {
      console.log(`   • ${row._id} (${row.count} players)`);
    }
  } else {
    console.log("\n✅ All positions in DB are covered by POSITION_GROUPS!");
  }

  console.log("\n📝 POSITION_GROUPS for reference:");
  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    console.log(`   ${group}: [${positions.join(", ")}]`);
  }

  await mongoose.disconnect();
  console.log("\n👋 Done.\n");
}

scanPositions().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
