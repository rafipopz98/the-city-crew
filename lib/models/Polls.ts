import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const PollSchema = new mongoose.Schema(
  {
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    badge_text: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    options: {
      type: [OptionSchema],
      required: true,
      validate: {
        validator: (val: any[]) => val.length >= 2,
        message: "Minimum 2 options required",
      },
    },

    total_votes: {
      type: Number,
      default: 0,
    },

    expires_at: {
      type: Date,
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const PollModel =
  mongoose.models.Polls || mongoose.model("Polls", PollSchema);
