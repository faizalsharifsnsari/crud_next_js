import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";

import { connectionStr } from "../../../lib/mongodb";
import User from "../../../lib/model/User";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Truecaller initial body:", body);

    if (body.status === "flow_invoked") {
      return NextResponse.json({ message: "Flow started" }, { status: 200 });
    }

    const { accessToken, endpoint, requestId } = body;

    if (!accessToken || !endpoint) {
      return NextResponse.json({ error: "Invalid Truecaller response" }, { status: 400 });
    }

    const profileRes = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = await profileRes.json();
    console.log("Truecaller profile:", profile);

    if (mongoose.connection.readyState === 0) await mongoose.connect(connectionStr);

    const phone = profile.phoneNumbers?.[0]?.toString() || null;
    const name = `${profile.name?.first || ""} ${profile.name?.last || ""}`.trim();
    const email = profile.onlineIdentities?.email || null;

    if (!phone) return NextResponse.json({ error: "Phone number missing from Truecaller" }, { status: 400 });

    // ✅ Safe user creation/update to avoid duplicate emails
    let user = await User.findOne({ phone });

    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        image: profile.avatarUrl || null,
        providers: ["truecaller"],
        requestId,
      });
    } else {
      // Update existing user with Truecaller info if not already present
      if (!user.providers.includes("truecaller")) user.providers.push("truecaller");
      user.requestId = requestId;
      await user.save();
    }

    // ✅ Generate session token for Truecaller login
    const sessionToken = crypto.randomBytes(32).toString("hex");
    user.sessionToken = sessionToken;
    await user.save();
    console.log("✅ Session token stored in DB");

    return NextResponse.json({
      success: true,
      phone,
      sessionToken, // send it to frontend to set cookie
    });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}