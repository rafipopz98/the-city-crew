import mongoose, { Schema } from "mongoose";

const BlogLikeSchema = new Schema(
  {
    blog_id: {
      type: Schema.Types.ObjectId,

      ref: "blogs",

      required: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// one like per user per blog
BlogLikeSchema.index(
  {
    blog_id: 1,

    user_id: 1,
  },
  {
    unique: true,
  },
);

export const BlogLikeModel =
  mongoose.models.blog_likes || mongoose.model("blog_likes", BlogLikeSchema);
