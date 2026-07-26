import mongoose from "mongoose";

const GameOwnedPlayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GamePlayer",
      required: true,
    },
    acquired_at: {
      type: Date,
      default: Date.now,
    },
    // Whether player is currently in active squad
    in_squad: {
      type: Boolean,
      default: false,
    },
    // Assigned squad position (GK, DEF, MID, FWD)
    squad_position: {
      type: String,
      enum: ["GK", "DEF", "MID", "FWD", null],
      default: null,
    },
    // Slot number in squad (0-4)
    squad_slot: {
      type: Number,
      default: null,
    },

    // ── Player Upgrades ─────────────────────────────────────────────────
    // Tracks how many times each stat has been upgraded beyond the base value.
    // Effective stat = base stat + upgrade_level (capped at 99).
    upgrades: {
      type: {
        pace: { type: Number, default: 0 },
        shooting: { type: Number, default: 0 },
        passing: { type: Number, default: 0 },
        dribbling: { type: Number, default: 0 },
        defending: { type: Number, default: 0 },
        physic: { type: Number, default: 0 },
      },
      default: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physic: 0 },
    },
    // Total coins spent on upgrades for this player
    total_upgrade_cost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "game_owned_players",
  },
);

// A player can only be in a squad once per user
GameOwnedPlayerSchema.index(
  { userId: 1, playerId: 1 },
  { unique: true },
);

export const GameOwnedPlayerModel =
  mongoose.models.GameOwnedPlayer ||
  mongoose.model("GameOwnedPlayer", GameOwnedPlayerSchema);
