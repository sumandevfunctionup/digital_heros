export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./lib/mongodb");
    try {
      console.log("\x1b[35m[Startup] Initializing MongoDB connection...\x1b[0m");
      await connectDB();
    } catch (error) {
      console.error(
        `\x1b[31m[Startup] ❌ Failed to connect to MongoDB on startup: ${error.message}\x1b[0m`
      );
    }
  }
}
