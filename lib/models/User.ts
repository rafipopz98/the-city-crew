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

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: /^[a-z0-9_]{3,20}$/i,
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    challengesPlayed: {
      type: Number,
      default: 0,
    },
    bestTime: {
      type: Number,
      default: null,
    },
    lastChallengeDate: {
      type: String,
      default: null,
    },
    dailyWins: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
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

UserSchema.index({ streak: -1 });
UserSchema.index({ totalPoints: -1 });
UserSchema.index({ totalCorrect: -1 });

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
