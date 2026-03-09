import { NextResponse } from "next/server";
export const runtime = "nodejs";

import mongoose from "mongoose";
import crypto from "crypto";

import { connectionStr } from "../../../lib/mongodb";
import User from "../../../lib/model/User";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Truecaller initial body:", body);

    // Step 1: Flow started event
    if (body.status === "flow_invoked") {
      return NextResponse.json(
        { message: "Flow started" },
        { status: 200 }
      );
    }

    const { accessToken, endpoint } = body;

    if (!accessToken || !endpoint) {
      return NextResponse.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    // Step 2: Fetch profile from Truecaller
    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();
    console.log("Truecaller profile:", profile);

    // Step 3: Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // Step 4: Extract user info
    const phone = profile.phoneNumbers?.[0]?.toString() || null;

    const name =
      `${profile.name?.first || ""} ${profile.name?.last || ""}`.trim();

    const email =
      profile.onlineIdentities?.[0]?.email ||
      profile.onlineIdentities?.[0]?.value ||
      null;

    const image = profile.pictureUrl || null;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number missing from Truecaller" },
        { status: 400 }
      );
    }

    // Step 5: Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        image,
        providers: ["truecaller"],
      });

      console.log("✅ New Truecaller user created");
    } else {
      console.log("ℹ️ Existing user found");
    }

    // Step 6: Create session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    user.sessionToken = sessionToken;
    user.updatedAt = new Date();

    await user.save();

    console.log("✅ Session token stored in DB:", sessionToken);

    // Step 7: Send cookie to browser
    const response = NextResponse.json({
      success: true,
      phone,
    });

    response.cookies.set("taskify_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // change to "none" if popup blocks cookies
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Callback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}