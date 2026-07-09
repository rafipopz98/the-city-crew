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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // ✅ Changed to 5 for star rating
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// ✅ Unique index to prevent duplicate ratings
PlayerRatingSchema.index(
  { match_id: 1, player_id: 1, user_id: 1 },
  { unique: true },
);

export default mongoose.models.PlayerRating ||
  mongoose.model("PlayerRating", PlayerRatingSchema);
