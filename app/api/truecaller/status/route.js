import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionStr } from "../../../lib/mongodb";
import User from "../../../lib/model/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    console.log("Checking status for:", requestId);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // just check if user exists for now
    const user = await User.findOne({ phone: { $exists: true } });

    if (user) {
      return NextResponse.json({ status: "verified" });
    }

    return NextResponse.json({ status: "pending" });

  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json({ status: "error" });
  }
}