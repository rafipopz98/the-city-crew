import mongoose from "mongoose";

const DailyChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    challengeDate: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
      index: true,
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const DailyChallengeModel =
  mongoose.models.DailyChallenge ||
  mongoose.model("DailyChallenge", DailyChallengeSchema);
