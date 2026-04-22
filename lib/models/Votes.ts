import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    poll_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Polls",
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    option_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔒 prevents multiple votes by same user
VoteSchema.index({ poll_id: 1, user_id: 1 }, { unique: true });

export const VoteModel =
  mongoose.models.Vote || mongoose.model("Vote", VoteSchema);
