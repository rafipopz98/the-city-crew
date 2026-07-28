/**
 * Quick script to check what fields a GK player has in the game_players collection.
 * Run: npx tsx scripts/check-gk-stats.ts
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tcc";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;
  const col = db.collection("game_players");

  // Find one GK player
  const gk = await col.findOne({ positions: "GK" });
  if (gk) {
    console.log("\n🔍 GK Player found:", gk.short_name, `(ID: ${gk.player_id})`);
    console.log("\n--- All GK-relevant fields ---");
    const gkFields: Record<string, any> = {};
    for (const [key, val] of Object.entries(gk as any)) {
      if (key.includes("goalkeeping") || key.includes("gk") || key.includes("diving") || key.includes("handling") || key.includes("reflexes") || key.includes("positioning") || key.includes("kicking") || key.includes("overall") || key === "pace" || key === "shooting" || key === "passing" || key === "dribbling" || key === "defending" || key === "physic" || key === "positions" || key === "short_name" || key === "rarity") {
        gkFields[key] = val;
      }
    }
    console.log(JSON.stringify(gkFields, null, 2));
  } else {
    console.log("No GK player found");
  }

  // Also check a field player for comparison
  const fp = await col.findOne({ positions: { $in: ["ST", "CM", "CB"] } });
  if (fp) {
    console.log("\n🔍 Field Player found:", fp.short_name, `(ID: ${fp.player_id})`);
    const fpFields: Record<string, any> = {};
    for (const [key, val] of Object.entries(fp as any)) {
      if (key.includes("goalkeeping") || key.includes("overall") || key === "pace" || key === "shooting" || key === "passing" || key === "dribbling" || key === "defending" || key === "physic" || key === "positions") {
        fpFields[key] = val;
      }
    }
    console.log(JSON.stringify(fpFields, null, 2));
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

check().catch(console.error);
