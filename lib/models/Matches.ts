import mongoose from "mongoose";

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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

MatchesSchema.index({ matchDate: -1 });

export const MatchesModel =
  mongoose.models.Matches || mongoose.model("Matches", MatchesSchema);
