import mongoose from "mongoose";

const SeasonSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const SeasonModel =
  mongoose.models.Seasons || mongoose.model("Seasons", SeasonSchema);
