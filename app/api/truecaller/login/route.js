import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";

import { connectionStr } from "@/lib/mongodb";
import User from "@/lib/model/User";

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone required" },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        providers: ["truecaller"],
      });
    }

    // generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    user.sessionToken = sessionToken;
    await user.save();

    const response = NextResponse.json({
      success: true,
      user,
    });

    // set cookie
    response.cookies.set("taskify_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}