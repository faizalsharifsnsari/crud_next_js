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
    // 🔵 SESSION CHECK
    // =========================
    const session = await getServerSession(authOptions);
    console.log("🟡 SESSION:", session);

    if (!session) {
      console.log("❌ NO SESSION FOUND");
      return NextResponse.json(
        { success: false, message: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      console.log("❌ SESSION USER ID MISSING");
      return NextResponse.json(
        { success: false, message: "Invalid session user" },
        { status: 400 }
      );
    }

    // =========================
    // 🔵 BODY PARSE
    // =========================
    const body = await req.json();
    console.log("🟡 REQUEST BODY:", body);

    if (!body || Object.keys(body).length === 0) {
      console.log("❌ EMPTY BODY");
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 }
      );
    }

    // =========================
    // 🔵 DB CONNECTION
    // =========================
    if (mongoose.connection.readyState === 0) {
      console.log("🟡 CONNECTING TO DB...");
      await mongoose.connect(connectionStr);
      console.log("🟢 DB CONNECTED");
    } else {
      console.log("🟢 DB ALREADY CONNECTED");
    }

    // =========================
    // 🔵 BUILD UPDATE DATA
    // =========================
    const updateData = {};

    // 🔹 NAME VALIDATION
    if (body.name !== undefined) {
      console.log("🔵 NAME FIELD DETECTED:", body.name);

      if (typeof body.name !== "string") {
        console.log("❌ NAME NOT STRING");
        return NextResponse.json(
          { success: false, message: "Name must be a string" },
          { status: 400 }
        );
      }

      if (body.name.trim() === "") {
        console.log("❌ NAME EMPTY");
        return NextResponse.json(
          { success: false, message: "Name cannot be empty" },
          { status: 400 }
        );
      }

      updateData.name = body.name.trim();
    }

    // 🔹 IMAGE VALIDATION
    if (body.image !== undefined) {
      console.log("🔵 IMAGE FIELD DETECTED:", body.image);

      if (typeof body.image !== "string") {
        console.log("❌ IMAGE NOT STRING");
        return NextResponse.json(
          { success: false, message: "Image must be a string URL" },
          { status: 400 }
        );
      }

      updateData.image = body.image;
    }

    // ❌ NOTHING TO UPDATE
    if (Object.keys(updateData).length === 0) {
      console.log("❌ NO VALID FIELDS TO UPDATE");
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    console.log("🟡 FINAL UPDATE DATA:", updateData);

    // =========================
    // 🔵 UPDATE USER
    // =========================
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select("name email image");

    console.log("🟢 UPDATED USER:", updatedUser);

    if (!updatedUser) {
      console.log("❌ USER NOT FOUND IN DB");
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // =========================
    // ✅ SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("🔥 PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
