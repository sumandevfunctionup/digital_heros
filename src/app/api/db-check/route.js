import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const readyState = mongoose.connection.readyState;
    const dbName = mongoose.connection.name;

    return NextResponse.json({
      success: true,
      message: "MongoDB connection established successfully",
      database: dbName,
      readyState: readyState, // 1 = connected
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to MongoDB",
        error: error.message,
        hint: "Ensure your MONGODB_URI in .env.local is correct (e.g. MongoDB Atlas connection string).",
      },
      { status: 500 }
    );
  }
}
