import mongoose from "mongoose";

const GameUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9_]{3,20}$/,
    },
    xp: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
      default: 1000, // Starting coins
    },
    has_completed_onboarding: {
      type: Boolean,
      default: false,
    },
    starter_pack_claimed: {
      type: Boolean,
      default: false,
    },

    // Match stats
    total_matches: { type: Number, default: 0 },
    total_wins: { type: Number, default: 0 },
    total_losses: { type: Number, default: 0 },
    total_draws: { type: Number, default: 0 },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    goals_scored: { type: Number, default: 0 },
    goals_conceded: { type: Number, default: 0 },

    // Active squad reference
    active_squad_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameSquad",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "game_users",
  },
);

GameUserSchema.index({ xp: -1 });
GameUserSchema.index({ total_wins: -1 });

export const GameUserModel =
  mongoose.models.GameUser || mongoose.model("GameUser", GameUserSchema);
