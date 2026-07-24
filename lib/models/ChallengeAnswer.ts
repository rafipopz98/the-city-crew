import mongoose from "mongoose";

const ChallengeAnswerSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChallengeAttempt",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

ChallengeAnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const ChallengeAnswerModel =
  mongoose.models.ChallengeAnswer ||
  mongoose.model("ChallengeAnswer", ChallengeAnswerSchema);
