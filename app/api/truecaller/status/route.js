import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import User from "../../../lib/model/User";

export async function GET(req) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const cookieStore =await cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    console.log("Checking session:", sessionToken);

    const user = await User.findOne({ sessionToken });

    if (!user) {
      return NextResponse.json({ status: "invalid-session" }, { status: 401 });
    }

    return NextResponse.json({
      status: "verified",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    });

  } catch (error) {
    console.error("Status API error:", error);

    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // ✅ Read cookie created after Truecaller login
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No session token" },
        { status: 401 }
      );
    }

    console.log("Searching user with sessionToken:", sessionToken);

    // ✅ Find user using the stored sessionToken
    const user = await User.findOne({ sessionToken });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const payload = await request.json();

    // 🔥 Calculate task order
    const count = await Taskify.countDocuments({
      userId: user._id,
    });

    const task = new Taskify({
      ...payload,
      userId: user._id,
      order: count,
    });

    const result = await task.save();

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}