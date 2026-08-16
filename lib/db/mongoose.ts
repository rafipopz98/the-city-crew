import mongoose from "mongoose";

// global cache (important for Next.js hot reload)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  // Read/validate MONGODB_URI lazily, at call time — not at module import
  // time. This file gets pulled in transitively by things like
  // dev-ws-server.ts (via handler.ts -> loadSquadMatchPlayers), and ES
  // module imports are always fully evaluated before the importing
  // module's own top-level code runs. A standalone script that calls
  // dotenv.config() itself (as dev-ws-server.ts does) hasn't actually run
  // that yet by the time this module's top level would execute — so
  // reading process.env.MONGODB_URI here at import time would throw
  // before the env was ever loaded, regardless of where the dotenv call
  // is textually positioned in that script.
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in env");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "tcc",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
