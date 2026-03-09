import { NextResponse } from "next/server";
export const runtime = "nodejs";

import mongoose from "mongoose";
import crypto from "crypto";

import { connectionStr } from "../../../lib/mongodb";
import User from "../../../lib/model/User";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Truecaller body:", body);

    if (body.status === "flow_invoked") {
      return NextResponse.json({ message: "Flow started" });
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

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const phone = profile.phoneNumbers?.[0]?.toString();
    const name = `${profile.name?.first || ""} ${profile.name?.last || ""}`.trim();
    const email = profile.onlineIdentities?.email || null;

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        providers: ["truecaller"],
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    user.sessionToken = sessionToken;

    await user.save();

    console.log("✅ Session created");

    const response = NextResponse.redirect(
      "https://crud-next-js-beta.vercel.app/user"
    );

    response.cookies.set("taskify_session", sessionToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}