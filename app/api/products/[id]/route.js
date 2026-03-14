import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import TruecallerUser from "../../../lib/model/User";

import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

// ✅ Get userId from Google login OR Truecaller login
async function getUserId() {
  // 1️⃣ Check NextAuth session (Google login)
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return session.user.id.toString();
  }

  // 2️⃣ Check Truecaller session cookie
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("taskify_session")?.value;

  if (!sessionToken) return null;

  const user = await TruecallerUser.findOne({ sessionToken });

  if (!user) return null;

  return user._id.toString(); // ⭐ ensure string
}

export async function DELETE(req, { params }) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const task = await Taskify.findOne({
      _id: id,
      userId: userId,
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const deletedOrder = task.order;

    await Taskify.deleteOne({ _id: id });

    await Taskify.updateMany(
      {
        userId: userId,
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const body = await req.json();

    const {
      title,
      description,
      priority,
      status,
      dueDate,
    } = body;

    const updatedTask = await Taskify.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}