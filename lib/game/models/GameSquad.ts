import mongoose from "mongoose";

const GameSquadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "My Squad",
    },
    // Positions: GK, DEF, MID, FWD
    // 5 players: 1 GK, 1 DEF, 2 MID, 1 FWD (default 4-2-1 formation)
    players: [
      {
        ownedPlayerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GameOwnedPlayer",
          required: true,
        },
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GamePlayer",
          required: true,
        },
        position: {
          type: String,
          enum: ["GK", "DEF", "MID", "FWD"],
          required: true,
        },
        slot: {
          type: Number, // 0-4
          required: true,
        },
      },
    ],
    is_active: {
      type: Boolean,
      default: false,
    },
    formation: {
      type: String,
      default: "1-1-2-1", // GK-DEF-MID-MID-FWD
    },
  },
  {
    timestamps: true,
    collection: "game_squads",
  },
);

export const GameSquadModel =
  mongoose.models.GameSquad || mongoose.model("GameSquad", GameSquadSchema);
