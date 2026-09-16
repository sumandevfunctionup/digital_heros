import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global cache for MongoDB connection across Next.js hot reloads and serverless invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Attach mongoose event listeners once
if (!global.mongooseListenersAttached) {
  mongoose.connection.on("connected", () => {
    console.log(`\x1b[32m[MongoDB]  Connected to database: ${mongoose.connection.name} (${mongoose.connection.host})\x1b[0m`);
  });

  mongoose.connection.on("error", (err) => {
    console.error(`\x1b[31m[MongoDB] ❌ Connection error: ${err.message}\x1b[0m`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("\x1b[33m[MongoDB] ⚠️ Disconnected from database\x1b[0m");
  });

  global.mongooseListenersAttached = true;
}

/**
 * Connect to MongoDB database using Mongoose.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB() {
  if (cached.conn) {
    console.log("\x1b[36m[MongoDB] ⚡ Using existing cached connection\x1b[0m");
    return cached.conn;
  }

  if (!MONGODB_URI) {
    const errorMsg = "MONGODB_URI is not defined in .env.local";
    console.error(`\x1b[31m[MongoDB] ❌ ${errorMsg}\x1b[0m`);
    throw new Error(errorMsg);
  }

  if (!cached.promise) {
    const sanitizedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
    console.log(`\x1b[34m[MongoDB] ⏳ Connecting to: ${sanitizedUri} ...\x1b[0m`);

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`\x1b[31m[MongoDB] ❌ Connection failed: ${err.message}\x1b[0m`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
export { connectDB };
