import mongoose from "mongoose";

const PlayerRatingSchema = new mongoose.Schema(
  {
    match_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matches",
      required: true,
    },

    player_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PlayerRatingSchema.index({ match: 1, player: 1, user: 1 }, { unique: true });

export default mongoose.models.PlayerRating ||
  mongoose.model("PlayerRating", PlayerRatingSchema);
