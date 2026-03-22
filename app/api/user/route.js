import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { connectionStr } from "../../lib/mongodb";

import User from "../../lib/model/User"; // Truecaller
import NextAuthUser from "../../lib/model/NextAuthUser"; // Google

export async function GET() {
  try {
    console.log("🔥 /api/user called");

    const session = await getServerSession(authOptions);

    console.log("🟡 SESSION:", session);

    // ❌ NO SESSION
    if (!session) {
      console.log("❌ No session found");
      return NextResponse.json(
        { success: false, message: "Unauthorized - No session" },
        { status: 401 },
      );
    }

    // ❌ SESSION BUT NO USER ID
    if (!session.user?.id) {
      console.log("❌ Session exists but no user.id");
      return NextResponse.json(
        { success: false, message: "Invalid session user" },
        { status: 400 },
      );
    }

    // 🔌 CONNECT DB
    if (mongoose.connection.readyState === 0) {
      console.log("🔌 Connecting to DB...");
      await mongoose.connect(connectionStr);
    }

    let user = null;

    // =========================
    // 🔵 TRY GOOGLE USER
    // =========================
    console.log("🔍 Searching in NextAuthUser (Google)...");

    user = await NextAuthUser.findById(session.user.id).select(
      "name email image",
    );

    if (user) {
      console.log("✅ GOOGLE USER FOUND:", user);
    } else {
      console.log("⚠️ Not found in Google DB, trying Truecaller...");
    }

    // =========================
    // 🔵 TRY TRUECALLER USER
    // =========================
    if (!user) {
      user = await User.findById(session.user.id).select("name email image");

      if (user) {
        console.log("✅ TRUECALLER USER FOUND:", user);
      }
    }

    // ❌ USER NOT FOUND ANYWHERE
    if (!user) {
      console.log("❌ User not found in ANY DB");

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          sessionUserId: session.user.id,
        },
        { status: 404 },
      );
    }

    // ✅ FINAL RESPONSE
    console.log("🚀 FINAL USER:", user);

    return NextResponse.json({
      success: true,
      user: {
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
      },
    });
  } catch (error) {
    console.log("🔥 ERROR IN /api/user:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
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
          { status: 400 },
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
      { new: true },
    ).select("name email image");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
