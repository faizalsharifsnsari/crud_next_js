
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import TruecallerUser from "../../../lib/model/User";

import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

/* -------------------- GET USER ID -------------------- */
async function getUserId() {
  try {

    const debug = {
      loginType: null,
      userId: null,
      googleSession: null,
      truecallerToken: null
    };

    // GOOGLE LOGIN
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      debug.loginType = "google";
      debug.userId = session.user.id;
      debug.googleSession = session.user;

      console.log("LOGIN TYPE: GOOGLE");
      console.log("GOOGLE USER:", session.user);

      return { userId: session.user.id, debug };
    }

    // TRUECALLER LOGIN
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    if (!sessionToken) {
      console.log("No Truecaller cookie found");
      return { userId: null, debug };
    }

    debug.truecallerToken = sessionToken;

    const user = await TruecallerUser.findOne({ sessionToken });

    if (!user) {
      console.log("Truecaller user not found in DB");
      return { userId: null, debug };
    }

    debug.loginType = "truecaller";
    debug.userId = user._id.toString();

    console.log("LOGIN TYPE: TRUECALLER");
    console.log("TRUECALLER USER:", user);

    return { userId: user._id.toString(), debug };

  } catch (error) {
    console.error("getUserId error:", error);
    return { userId: null, debug: { error: error.message } };
  }
}

/* -------------------- DELETE TASK -------------------- */
export async function DELETE(req, { params }) {
  try {

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("MongoDB connected");
    }

    const { userId, debug } = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          debug
        },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Task ID missing" },
        { status: 400 }
      );
    }

    console.log("TASK ID RECEIVED:", id);
    console.log("USER ID RECEIVED:", userId);

    // Check if task exists
    const task = await Taskify.findById(id);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task does not exist in DB",
          debug
        },
        { status: 404 }
      );
    }

    console.log("TASK FOUND:", task);

    // Check if task belongs to user
    if (task.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Task does not belong to this user",
          taskUserId: task.userId,
          requestUserId: userId,
          debug
        },
        { status: 403 }
      );
    }

    const deletedOrder = task.order;

    await Taskify.deleteOne({ _id: id });

    await Taskify.updateMany(
      {
        userId: task.userId,
        order: { $gt: deletedOrder }
      },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
      debug
    });

  } catch (error) {
    console.error("DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed",
        error: error.message
      },
      { status: 500 }
    );
  }
}

/* -------------------- UPDATE TASK -------------------- */
export async function PUT(req, { params }) {
  try {

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("MongoDB connected");
    }

    const { userId, debug } = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          debug
        },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Task ID missing" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { title, description, priority, status, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const task = await Taskify.findById(id);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found in DB",
          debug
        },
        { status: 404 }
      );
    }

    if (task.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Task does not belong to this user",
          taskUserId: task.userId,
          requestUserId: userId,
          debug
        },
        { status: 403 }
      );
    }

    const updatedTask = await Taskify.findByIdAndUpdate(
      id,
      {
        title,
        description,
        priority,
        status,
        dueDate
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
      debug
    });

  } catch (error) {

    console.error("UPDATE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Update failed",
        error: error.message
      },
      { status: 500 }
    );
  }
}

