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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const updateData = {};

    // ✅ Only update fields that exist
    if (body.name !== undefined) {
      if (body.name.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Name is required" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.image !== undefined) {
      updateData.image = body.image;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select("name email image");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
