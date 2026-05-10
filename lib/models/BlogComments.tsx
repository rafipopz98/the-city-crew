import mongoose, { Schema } from "mongoose";


const BlogCommentSchema = new Schema(
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

    // null = root comment
    parent_id: {
      type: Schema.Types.ObjectId,

      ref: "blog_comments",

      default: null,
    },

    text: {
      type: String,

      required: true,

      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const BlogCommentModel =
  mongoose.models.blog_comments ||
  mongoose.model("blog_comments", BlogCommentSchema);
