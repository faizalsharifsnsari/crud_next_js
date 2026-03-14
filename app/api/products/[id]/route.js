import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import TruecallerUser from "../../../lib/model/User";

import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

async function getUserId() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      console.log("Google userId:", session.user.id);
      return session.user.id;
    }

    const cookieStore = cookies();
    const sessionToken = cookieStore.get("taskify_session")?.value;

    if (!sessionToken) {
      console.log("No Truecaller session token");
      return null;
    }

    const user = await TruecallerUser.findOne({ sessionToken });

    if (!user) {
      console.log("Truecaller user not found");
      return null;
    }

    console.log("Truecaller userId:", user._id.toString());

    return user._id.toString();

  } catch (error) {
    console.error("getUserId error:", error);
    return null;
  }
}

export async function DELETE(req, { params }) {
  try {

    // DB CONNECT
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("Mongo connected");
    }

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const taskId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log("DELETE taskId:", taskId);
    console.log("DELETE userId:", userObjectId);

    const task = await Taskify.findOne({
      _id: taskId,
      userId: userObjectId,
    });

    if (!task) {
      console.log("Task not found for user");
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const deletedOrder = task.order;

    await Taskify.deleteOne({ _id: taskId });

    await Taskify.updateMany(
      {
        userId: userObjectId,
        order: { $gt: deletedOrder },
      },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error("DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("Mongo connected");
    }

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const taskId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const body = await req.json();

    const { title, description, priority, status, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const updatedTask = await Taskify.findOneAndUpdate(
      {
        _id: taskId,
        userId: userObjectId,
      },
      {
        $set: {
          title,
          description,
          priority,
          status,
          dueDate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTask) {
      console.log("Update failed: task not found");

      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (error) {

    console.error("UPDATE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Update failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}