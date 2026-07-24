import mongoose, { Schema, model, models } from "mongoose";

const ErrorLogSchema = new Schema(
  {
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
    message: {
      type: String,
      required: true,
    },
    status_code: {
      type: Number,
      default: 500,
    },
    error_stack: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
ErrorLogSchema.index({ createdAt: -1 });
ErrorLogSchema.index({ endpoint: 1, createdAt: -1 });

export const ErrorLogModel =
  models.error_logs || model("error_logs", ErrorLogSchema);
