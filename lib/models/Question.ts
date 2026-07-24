import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyChallenge",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: "Each question must have exactly 4 options",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

QuestionSchema.index({ challengeId: 1, order: 1 });

export const QuestionModel =
  mongoose.models.Question || mongoose.model("Question", QuestionSchema);
