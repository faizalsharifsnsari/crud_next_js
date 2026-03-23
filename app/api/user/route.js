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

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectionStr } from "../../lib/mongodb";
import User from "../../lib/model/User";

export async function PATCH(req) {
  try {
    console.log("🔥 PATCH /api/user HIT");

    // =========================
    // 🔵 SESSION CHECK
    // =========================
    const session = await getServerSession(authOptions);
    console.log("🟡 SESSION:", session);

    if (!session) {
      console.log("❌ NO SESSION");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!session.user?.email) {
      console.log("❌ SESSION EMAIL MISSING");
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 400 },
      );
    }

    // =========================
    // 🔵 PARSE BODY
    // =========================
    const body = await req.json();
    console.log("🟡 BODY:", body);

    if (!body || Object.keys(body).length === 0) {
      console.log("❌ EMPTY BODY");
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 },
      );
    }

    // =========================
    // 🔵 DB CONNECT
    // =========================
    if (mongoose.connection.readyState === 0) {
      console.log("🟡 CONNECTING DB...");
      await mongoose.connect(connectionStr);
      console.log("🟢 DB CONNECTED:", mongoose.connection.name);
    } else {
      console.log("🟢 DB ALREADY CONNECTED:", mongoose.connection.name);
    }

    console.log("📦 COLLECTION:", User.collection.name);

    // =========================
    // 🔵 BUILD UPDATE DATA
    // =========================
    const updateData = {};

    // NAME
    if (body.name !== undefined) {
      console.log("🔵 NAME:", body.name);

      if (typeof body.name !== "string") {
        return NextResponse.json(
          { success: false, message: "Name must be string" },
          { status: 400 },
        );
      }

      if (body.name.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Name cannot be empty" },
          { status: 400 },
        );
      }

      updateData.name = body.name.trim();
    }

    // IMAGE
    if (body.image !== undefined) {
      console.log("🔵 IMAGE:", body.image);

      if (typeof body.image !== "string") {
        return NextResponse.json(
          { success: false, message: "Image must be string" },
          { status: 400 },
        );
      }

      updateData.image = body.image;
    }

    if (Object.keys(updateData).length === 0) {
      console.log("❌ NOTHING TO UPDATE");
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 },
      );
    }

    console.log("🟡 UPDATE DATA:", updateData);

    // =========================
    // 🔍 DEBUG CHECKS
    // =========================
    const existingByEmail = await User.findOne({
      email: session.user.email,
    });

    console.log("🔍 USER BY EMAIL:", existingByEmail);

    // =========================
    // 🔵 UPDATE (EMAIL BASED - BEST)
    // =========================
    let updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      {
        new: true,
        upsert: true, // 🔥 auto-create if missing
      },
    ).select("name email image");

    console.log("🟢 UPDATED USER:", updatedUser);

    if (!updatedUser) {
      console.log("❌ UPDATE FAILED COMPLETELY");
      return NextResponse.json(
        { success: false, message: "Update failed" },
        { status: 500 },
      );
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
