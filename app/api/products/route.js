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
    } else {
      // 🔐 Truecaller session
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("taskify_session")?.value;

      if (!sessionToken) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionStr);
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
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {

    console.log("STEP 1: Checking MongoDB connection");

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("MongoDB connected");
    }

    console.log("STEP 2: Checking login session");

    const session = await getServerSession(authOptions);

    let userId = null;

    // GOOGLE LOGIN
    if (session?.user?.id) {
      console.log("LOGIN TYPE: GOOGLE");
      console.log("GOOGLE USER ID:", session.user.id);
      userId = session.user.id;
    }

    // TRUECALLER LOGIN
    else {
      console.log("Checking Truecaller session");

      const cookieStore =await cookies();
      const sessionToken = cookieStore.get("taskify_session")?.value;

      console.log("TRUECALLER TOKEN:", sessionToken);

      if (!sessionToken) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const user = await User.findOne({ sessionToken });

      console.log("TRUECALLER USER:", user);

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid session" },
          { status: 401 }
        );
      }

      userId = user._id;
    }

    console.log("STEP 3: USER ID READY:", userId);

    const payload = await request.json();

    console.log("STEP 4: REQUEST PAYLOAD:", payload);

    console.log("STEP 5: Counting user tasks");

    const count = await Taskify.countDocuments({
      userId: userId,
    });

    console.log("TASK COUNT:", count);

    const task = new Taskify({
      ...payload,
      userId: userId,
      order: count,
    });

    console.log("STEP 6: Saving task");

    const result = await task.save();

    console.log("TASK SAVED:", result);

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {

    console.error("POST ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}