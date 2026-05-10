import mongoose, { Schema, model, models } from "mongoose";

const BlogContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },

    value: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      default: "",
    },

    content_blocks: [BlogContentBlockSchema],

    tags: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
    },

    is_featured: {
      type: Boolean,
      default: false,
    },

    published_at: {
      type: Date,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    views_count: {
      type: Number,
      default: 0,
    },

    likes_count: {
      type: Number,
      default: 0,
    },

    comments_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const BlogModel = models.blogs || model("blogs", BlogSchema);
