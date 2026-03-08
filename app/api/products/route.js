import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectionStr } from "../../lib/mongodb";
import { Taskify } from "../../lib/model/Product";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import User from "../../lib/model/User";


export async function GET() {
  try {

    let userId = null;

    // 🔐 NextAuth session
    const session = await getServerSession(authOptions);

    if (session) {
      userId = session.user.id;
    } 
    else {

      // 🔐 Truecaller session
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("taskify_session")?.value;

      if (!sessionToken) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionStr);
      }

      const user = await User.findOne({ sessionToken });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid session" },
          { status: 401 }
        );
      }

      userId = user._id;
    }

    // 🔌 Ensure DB connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // 🔥 Fetch tasks for that user
    const data = await Taskify.find({
      userId: userId,
    }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      result: data,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    let userId = null;

    // ✅ NextAuth user
    if (session) {
      userId = session.user.id;
    }
    // ✅ Truecaller user
    else {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("taskify_session")?.value;

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionStr);
      }

      if (!sessionToken) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }

      const user = await User.findOne({ sessionToken });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid session" },
          { status: 401 },
        );
      }

      userId = user._id;
    }

    const payload = await request.json();

    const count = await Taskify.countDocuments({
      userId: userId,
    });

    const task = new Taskify({
      ...payload,
      userId: userId,
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
      { status: 500 },
    );
  }
}

