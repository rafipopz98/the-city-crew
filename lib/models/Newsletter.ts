import mongoose from "mongoose";

const NewsLetterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const NewsLetterModel =
  mongoose.models.NewsLetter || mongoose.model("NewsLetter", NewsLetterSchema);

export default NewsLetterModel;
