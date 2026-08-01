import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
      default: null,
    },
    last_name: {
      type: String,
      trim: true,
      default: null,
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

    /**
     * True when the account was auto-created from the login flow because
     * the email didn't exist yet ("sign in = sign up"). Used to prompt
     * the user to complete their name/username later.
     */
    signedUpFromLogin: {
      type: Boolean,
      default: false,
    },
    profile_completed: {
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
