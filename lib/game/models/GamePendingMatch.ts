import mongoose from "mongoose";

// Holds a bot match's halftime state between the two requests
// (POST /api/game/match/start starts it, POST /api/game/match/continue
// finishes it) — needed because Vercel serverless functions don't reliably
// share in-memory state across separate invocations. Auto-expires 10
// minutes after creation via the TTL index so an abandoned halftime never
// lingers.
const GamePendingMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    state: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // seconds
    },
  },
  {
    collection: "game_pending_matches",
  },
);

export const GamePendingMatchModel =
  mongoose.models.GamePendingMatch ||
  mongoose.model("GamePendingMatch", GamePendingMatchSchema);
