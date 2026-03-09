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

    if (body.status === "flow_invoked") {
      return NextResponse.json({ message: "Flow started" }, { status: 200 });
    }

    const { accessToken, endpoint } = body;

    if (!accessToken || !endpoint) {
      return NextResponse.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();
    console.log("Truecaller profile:", profile);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const phone = profile.phoneNumbers?.[0]?.toString() || null;
    const name =
      `${profile.name?.first || ""} ${profile.name?.last || ""}`.trim();
    const email = profile.onlineIdentities?.email || null;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number missing from Truecaller" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        image: null,
        providers: ["truecaller"],
      });

      console.log("✅ New Truecaller user created");
    } else {
      console.log("ℹ️ Existing user found");
    }

    // ⭐ CREATE SESSION TOKEN
   // ⭐ CREATE SESSION TOKEN
const sessionToken = crypto.randomBytes(32).toString("hex");

user.sessionToken = sessionToken;
await user.save();

console.log("✅ Session token stored in DB");

// ⭐ RETURN RESPONSE WITH COOKIE
const response = NextResponse.json({
  success: true,
  phone,
});

response.cookies.set("taskify_session", sessionToken, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

return response;

  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}