import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    vertical_image: {
      type: String,
      required: true,
    },
    round_image: {
      type: String,
      required: true,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seasons",
      required: true,
    },
    goals: {
      type: Number,
      default: 0,
    },
    assists: {
      type: Number,
      default: 0,
    },
    clean_sheets: {
      type: Number,
      default: 0,
    },
    yellow_cards: {
      type: Number,
      default: 0,
    },
    red_cards: {
      type: Number,
      default: 0,
    },
    penalty_goals: {
      type: Number,
      default: 0,
    },
    penalty_missed: {
      type: Number,
      default: 0,
    },
    penalty_saved: {
      type: Number,
      default: 0,
    },
    appearances: {
      type: Number,
      default: 0,
    },
    minutes_played: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    number: {
      type: Number,
    },
    age: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    total_ratings: {
      type: Number,
      default: 0,
    },
    is_captain: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const PlayersModels =
  mongoose.models.Players || mongoose.model("Players", PlayerSchema);
