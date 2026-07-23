import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },

    utm_params: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    first_landing_page: {
      type: String,
      default: null,
    },

    conversion_page: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
