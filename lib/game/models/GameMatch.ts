import mongoose from "mongoose";

const MatchEventSchema = new mongoose.Schema(
  {
    minute: { type: Number, required: true },
    type: {
      type: String,
      enum: ["attack", "chance", "goal", "save", "foul", "card", "substitution", "half_time", "full_time", "possession"],
      required: true,
    },
    description: { type: String, default: "" },
    playerName: { type: String, default: "" },
    isUserEvent: { type: Boolean, default: true },
  },
  { _id: false },
);

const GameMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    user_squad: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "GamePlayer" },
        shortName: { type: String },
        position: { type: String },
      },
    ],
    opponent_name: {
      type: String,
      default: "Opponent",
    },
    opponent_squad: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "GamePlayer" },
        shortName: { type: String },
        position: { type: String },
      },
    ],
    user_score: { type: Number, default: 0 },
    opponent_score: { type: Number, default: 0 },
    user_possession: { type: Number, default: 50 },
    opponent_possession: { type: Number, default: 50 },
    user_shots: { type: Number, default: 0 },
    opponent_shots: { type: Number, default: 0 },
    user_shots_on_target: { type: Number, default: 0 },
    opponent_shots_on_target: { type: Number, default: 0 },
    events: [MatchEventSchema],
    player_of_match: {
      playerId: { type: String, default: "" },
      shortName: { type: String },
    },
    result: {
      type: String,
      enum: ["win", "loss", "draw"],
      required: true,
    },
    xp_earned: { type: Number, default: 0 },
    coins_earned: { type: Number, default: 0 },
    duration_seconds: { type: Number, default: 0 },
    season: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    collection: "game_matches",
  },
);

GameMatchSchema.index({ userId: 1, createdAt: -1 });

// Ensure fresh schema is used during hot reload
if (mongoose.models.GameMatch) {
  delete mongoose.models.GameMatch;
}

export const GameMatchModel =
  mongoose.models.GameMatch || mongoose.model("GameMatch", GameMatchSchema);
