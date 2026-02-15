import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { connectionStr } from "../../lib/mongodb";

import User from "../../lib/model/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const user = await User.findById(session.user.id).select(
      "name email image"
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔥 Connect to MongoDB (same as GET)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      body,
      { new: true }
    ).select("name email image");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
