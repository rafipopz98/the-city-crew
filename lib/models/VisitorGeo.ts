import mongoose from "mongoose";

const VisitorGeoSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },

    country: {
      type: String,
      default: null,
    },
    country_code: {
      type: String,
      default: null,
    },
    country_code3: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    latitude: {
      type: String,
      default: null,
    },
    longitude: {
      type: String,
      default: null,
    },
    timezone: {
      type: String,
      default: null,
    },
    organization: {
      type: String,
      default: null,
    },
    organization_name: {
      type: String,
      default: null,
    },
    asn: {
      type: Number,
      default: null,
    },
    accuracy: {
      type: Number,
      default: null,
    },
    area_code: {
      type: String,
      default: null,
    },
    continent_code: {
      type: String,
      default: null,
    },

    /**
     * How many times this IP has been seen.
     * Incremented on each upsert.
     */
    count: {
      type: Number,
      default: 1,
    },

    last_seen_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const VisitorGeoModel =
  mongoose.models.VisitorGeo ||
  mongoose.model("VisitorGeo", VisitorGeoSchema);

export default VisitorGeoModel;
