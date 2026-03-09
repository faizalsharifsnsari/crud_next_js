import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import User from "../../../lib/model/User";

export async function GET() {
  console.log("sdfnsfjsladnfsanjfkladnfklasnmf");
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    console.log("Checking session:", sessionToken);

    if (!sessionToken) {
      return NextResponse.json({ status: "pending" });
    }

    const user = await User.findOne({ sessionToken });

    if (!user) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({
      status: "verified",
    });

  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json({ status: "error" });
  }
}
export async function POST(request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No session token" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ sessionToken });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const payload = await request.json();

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