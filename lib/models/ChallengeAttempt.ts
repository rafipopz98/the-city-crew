import mongoose from "mongoose";

const ChallengeAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyChallenge",
      required: true,
      index: true,
    },
    assignedQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    completionTimeMs: {
      type: Number,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
  },
  {
    timestamps: true,
  },
);

// One attempt per user per challenge
ChallengeAttemptSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
ChallengeAttemptSchema.index({ challengeId: 1, status: 1 });
ChallengeAttemptSchema.index({ challengeId: 1, score: -1, completionTimeMs: 1 });

export const ChallengeAttemptModel =
  mongoose.models.ChallengeAttempt ||
  mongoose.model("ChallengeAttempt", ChallengeAttemptSchema);
