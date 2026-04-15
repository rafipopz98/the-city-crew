import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token_hash: {
      type: String,
      required: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);
SessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export const SessionModel =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
