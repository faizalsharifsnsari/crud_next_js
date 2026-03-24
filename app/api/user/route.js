import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { connectionStr } from "../../lib/mongodb";
import TruecallerUser from "../../lib/model/User";

import User from "../../lib/model/User"; // Truecaller
import NextAuthUser from "../../lib/model/NextAuthUser"; // Google

import { cookies } from "next/headers";

export async function GET() {
  try {
    console.log("🔥 /api/user API HIT");

    const session = await getServerSession(authOptions);

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    console.log("🟡 SESSION:", session);
    console.log("🟡 TRUECALLER TOKEN:", sessionToken);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("🟢 MongoDB Connected");
    }

    let user = null;

    // =========================
    // ⭐ PRIORITY 1: TRUECALLER
    // =========================
    if (sessionToken) {
      console.log("🔵 Trying TRUECALLER LOGIN");

      user = await TruecallerUser.findOne({ sessionToken }).select(
        "name email image phone",
      );

      console.log("🔵 TRUECALLER USER:", user);

      if (user) {
        return NextResponse.json({
          success: true,
          user,
          source: "truecaller",
        });
      }
    }

    // =========================
    // ⭐ PRIORITY 2: GOOGLE
    // =========================
    if (session?.user?.id) {
      console.log("🟢 Trying GOOGLE LOGIN:", session.user.id);

      user = await NextAuthUser.findById(session.user.id).select(
        "name email image",
      );

      console.log("🟢 GOOGLE USER:", user);

      if (user) {
        return NextResponse.json({
          success: true,
          user,
          source: "google",
        });
      }
    }

    // =========================
    // ❌ NO USER FOUND
    // =========================
    console.log("🔴 NO USER FOUND");

    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  } catch (error) {
    console.log("🔥 ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    console.log("🔥 PATCH /api/user HIT");

    // =========================
    // 🔵 SESSION
    // =========================
    const session = await getServerSession(authOptions);

    // =========================
    // 🔵 BODY
    // =========================
    const body = await req.json();

    const updateData = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Invalid name" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.image !== undefined) {
      if (typeof body.image !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid image" },
          { status: 400 }
        );
      }
      updateData.image = body.image;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    // =========================
    // 🔵 DB CONNECTION
    // =========================
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    let updatedUser = null;

    // =========================
    // ⭐ PRIORITY 1: TRUECALLER
    // =========================
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    if (sessionToken) {
      console.log("🔵 UPDATING TRUECALLER USER");

      updatedUser = await TruecallerUser.findOneAndUpdate(
        { sessionToken },
        updateData,
        { new: true }
      ).select("name email image");

      if (updatedUser) {
        return NextResponse.json({
          success: true,
          user: updatedUser,
          source: "truecaller",
        });
      }
    }

    // =========================
    // ⭐ PRIORITY 2: GOOGLE
    // =========================
    if (session?.user?.id) {
      console.log("🟢 UPDATING GOOGLE USER");

      updatedUser = await NextAuthUser.findByIdAndUpdate(
        session.user.id,
        updateData,
        { new: true }
      ).select("name email image");

      if (updatedUser) {
        return NextResponse.json({
          success: true,
          user: updatedUser,
          source: "google",
        });
      }
    }

    // =========================
    // ❌ NO USER FOUND
    // =========================
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );

  } catch (error) {
    console.error("🔥 PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}