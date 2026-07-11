import mongoose from "mongoose";
import "./Season";
import "./Players";

const MatchesSchema = new mongoose.Schema(
  {
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seasons",
      required: true,
    },
    homeTeam: {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
    awayTeam: {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
    homeTeamScore: {
      type: Number,
      required: true,
      default: 0,
    },
    awayTeamScore: {
      type: Number,
      required: true,
      default: 0,
    },
    matchDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "finished", "postponed", "cancelled"],
      default: "upcoming",
    },

    competition: {
      type: String,
      required: true, // Premier League, UCL, FA Cup...
    },

    matchType: {
      type: String, // regular, group, qf 1, qf2, ssf 1, sf 2, final
    },

    venue: {
      type: String,
    },

    matchday: {
      type: Number,
    },

    isHome: {
      type: Boolean,
      required: true,
    },
    goalScorers: [
      {
        playerName: String,
        minute: Number,
        team: {
          type: String,
          enum: ["home", "away"],
          required: true,
        },
        isPenalty: {
          type: Boolean,
          default: false,
        },
        isOwnGoal: {
          type: Boolean,
          default: false,
        },
      },
    ],

    lineup: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Players",
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

MatchesSchema.index({ matchDate: -1 });

export const MatchesModel =
  mongoose.models.Matches || mongoose.model("Matches", MatchesSchema);
