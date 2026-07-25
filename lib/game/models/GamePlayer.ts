import mongoose from "mongoose";

const GamePlayerSchema = new mongoose.Schema(
  {
    player_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    short_name: {
      type: String,
      required: true,
    },
    long_name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: 0,
    },
    nationality: {
      type: String,
      default: "",
    },
    positions: {
      type: [String],
      default: [],
    },
    overall: {
      type: Number,
      default: 0,
    },
    pace: { type: Number, default: 0 },
    shooting: { type: Number, default: 0 },
    passing: { type: Number, default: 0 },
    dribbling: { type: Number, default: 0 },
    defending: { type: Number, default: 0 },
    physic: { type: Number, default: 0 },

    // Individual attributes
    attacking_finishing: { type: Number, default: 0 },
    attacking_short_passing: { type: Number, default: 0 },
    skill_ball_control: { type: Number, default: 0 },
    movement_acceleration: { type: Number, default: 0 },
    movement_sprint_speed: { type: Number, default: 0 },
    movement_reactions: { type: Number, default: 0 },
    power_shot_power: { type: Number, default: 0 },
    power_stamina: { type: Number, default: 0 },
    power_strength: { type: Number, default: 0 },
    mentality_positioning: { type: Number, default: 0 },
    mentality_vision: { type: Number, default: 0 },
    mentality_composure: { type: Number, default: 0 },
    defending_marking_awareness: { type: Number, default: 0 },
    defending_standing_tackle: { type: Number, default: 0 },
    defending_sliding_tackle: { type: Number, default: 0 },

    // GK stats
    goalkeeping_diving: { type: Number, default: 0 },
    goalkeeping_handling: { type: Number, default: 0 },
    goalkeeping_kicking: { type: Number, default: 0 },
    goalkeeping_positioning: { type: Number, default: 0 },
    goalkeeping_reflexes: { type: Number, default: 0 },
    goalkeeping_speed: { type: Number, default: 0 },

    preferred_foot: { type: String, default: "Right" },
    weak_foot: { type: Number, default: 3 },
    skill_moves: { type: Number, default: 3 },
    work_rate: { type: String, default: "Medium/Medium" },
    player_traits: { type: [String], default: [] },

    image_url: { type: String, default: "" },
    rarity: {
      type: String,
      enum: ["Basic", "Common", "Uncommon", "Rare", "Epic", "Legendary"],
      default: "Basic",
    },
    required_xp: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "game_players",
  },
);

// Indexes for common queries
GamePlayerSchema.index({ overall: -1 });
GamePlayerSchema.index({ rarity: 1, overall: -1 });
GamePlayerSchema.index({ positions: 1 });
GamePlayerSchema.index({ required_xp: 1 });

export const GamePlayerModel =
  mongoose.models.GamePlayer ||
  mongoose.model("GamePlayer", GamePlayerSchema);
