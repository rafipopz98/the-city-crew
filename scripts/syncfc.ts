// import fs from "fs";
// import csv from "csv-parser";
// import mongoose from "mongoose";
// import path from "node:path";
// import { fileURLToPath } from "node:url";

// import { GamePlayerModel } from "../lib/game/models/GamePlayer.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const FC26_FILE = path.join(__dirname, "fc_26.csv");

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.error("❌ Missing MONGODB_URI");
//   process.exit(1);
// }

// function num(value: any): number {
//   return Number(value) || 0;
// }

// function parsePositions(value: string) {
//   if (!value) return [];

//   return value
//     .split(",")
//     .map((x) => x.trim())
//     .filter(Boolean);
// }

// function parseTraits(value: string) {
//   if (!value) return [];

//   return value
//     .split(",")
//     .map((x) => x.trim())
//     .filter(Boolean);
// }

// function slug(name: string) {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-|-$/g, "");
// }

// const players: any[] = [];

// fs.createReadStream(FC26_FILE)
//   .pipe(csv())
//   .on("data", (row) => {
//     if (row.club_name === "Manchester City") {
//       players.push(row);
//     }
//   })
//   .on("end", async () => {
//     await mongoose.connect(MONGODB_URI!, {
//       dbName: "tcc",
//     });

//     console.log("✅ Connected");

//     const dbPlayers = await GamePlayerModel.find().lean();

//     const playerMap = new Map<number, any>();

//     dbPlayers.forEach((player) => {
//       playerMap.set(player.player_id, player);
//     });

//     let updated = 0;
//     let added = 0;

//     console.log("\n====================================");
//     console.log(" FC26 PLAYER SYNC");
//     console.log("====================================\n");

//     for (const row of players) {
//       const playerId = num(row.player_id);

//       const existing = playerMap.get(playerId);

//       const updateData = {
//         age: num(row.age),

//         nationality: row.nationality_name,

//         positions: parsePositions(row.player_positions),

//         overall: num(row.overall),

//         pace: num(row.pace),
//         shooting: num(row.shooting),
//         passing: num(row.passing),
//         dribbling: num(row.dribbling),
//         defending: num(row.defending),
//         physic: num(row.physic),

//         attacking_finishing: num(row.attacking_finishing),

//         attacking_short_passing: num(row.attacking_short_passing),

//         skill_ball_control: num(row.skill_ball_control),

//         movement_acceleration: num(row.movement_acceleration),

//         movement_sprint_speed: num(row.movement_sprint_speed),

//         movement_reactions: num(row.movement_reactions),

//         power_shot_power: num(row.power_shot_power),

//         power_stamina: num(row.power_stamina),

//         power_strength: num(row.power_strength),

//         mentality_positioning: num(row.mentality_positioning),

//         mentality_vision: num(row.mentality_vision),

//         mentality_composure: num(row.mentality_composure),

//         defending_marking_awareness: num(row.defending_marking_awareness),

//         defending_standing_tackle: num(row.defending_standing_tackle),

//         defending_sliding_tackle: num(row.defending_sliding_tackle),

//         goalkeeping_diving: num(row.goalkeeping_diving),

//         goalkeeping_handling: num(row.goalkeeping_handling),

//         goalkeeping_kicking: num(row.goalkeeping_kicking),

//         goalkeeping_positioning: num(row.goalkeeping_positioning),

//         goalkeeping_reflexes: num(row.goalkeeping_reflexes),

//         goalkeeping_speed: num(row.goalkeeping_speed),

//         preferred_foot: row.preferred_foot,

//         weak_foot: num(row.weak_foot),

//         skill_moves: num(row.skill_moves),

//         player_traits: parseTraits(row.player_traits),
//       };
//       if (existing) {
//         await GamePlayerModel.updateOne(
//           {
//             player_id: playerId,
//           },
//           {
//             $set: updateData,
//           },
//         );

//         console.log(
//           `✓ Updated ${existing.short_name} (${existing.overall} → ${row.overall})`,
//         );

//         updated++;
//       } else {
//         const overall = num(row.overall);

//         let rarity = "Basic";
//         let requiredXP = 50;
//         let price = 1000;

//         if (overall >= 90) {
//           rarity = "Legendary";
//           requiredXP = 500;
//           price = 29000;
//         } else if (overall >= 87) {
//           rarity = "Epic";
//           requiredXP = 400;
//           price = 20000;
//         } else if (overall >= 84) {
//           rarity = "Rare";
//           requiredXP = 300;
//           price = 14000;
//         } else if (overall >= 80) {
//           rarity = "Uncommon";
//           requiredXP = 200;
//           price = 8000;
//         } else if (overall >= 76) {
//           rarity = "Common";
//           requiredXP = 100;
//           price = 4000;
//         }

//         await GamePlayerModel.create({
//           player_id: playerId,

//           short_name: row.short_name,
//           long_name: row.long_name,

//           ...updateData,

//           image_url: "",

//           rarity,
//           required_xp: requiredXP,
//           price,

//           is_added_fc_26: true,
//         });

//         console.log("\n🆕 NEW PLAYER");
//         console.log(`Name : ${row.short_name}`);
//         console.log(`OVR  : ${row.overall}`);
//         console.log(`Image: ./game/${slug(row.short_name)}.png`);

//         added++;
//       }
//     }

//     console.log("\n====================================");
//     console.log("FC26 SYNC COMPLETE");
//     console.log("====================================");
//     console.log(`Updated : ${updated}`);
//     console.log(`Added   : ${added}`);
//     console.log("====================================");

//     if (added > 0) {
//       console.log("\nNew Players Added:");
//       console.log("------------------------------------");

//       const newPlayers = await GamePlayerModel.find({
//         is_added_fc_26: true,
//       }).sort({
//         overall: -1,
//       });

//       newPlayers.forEach((player) => {
//         console.log(`${player.short_name} (${player.overall})`);
//       });
//     }

//     await mongoose.disconnect();

//     console.log("\n👋 Done!");

//     process.exit(0);
//   })
//   .on("error", async (err) => {
//     console.error(err);

//     try {
//       await mongoose.disconnect();
//     } catch {}

//     process.exit(1);
//   });
