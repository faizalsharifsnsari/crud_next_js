import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import TruecallerUser from "../../../lib/model/User";

import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

async function getUserId() {

  console.log("---- CHECKING USER LOGIN ----");

  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    console.log("Google userId:", session.user.id);
    return String(session.user.id);
  }

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("taskify_session")?.value;

  console.log("Truecaller sessionToken:", sessionToken);

  if (!sessionToken) return null;

  const user = await TruecallerUser.findOne({ sessionToken });

  console.log("Truecaller user found:", user);

  if (!user) return null;

  return String(user._id);
}

export async function DELETE(req, context) {
  try {

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const userId = await getUserId();

    console.log("Resolved userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = context.params;

    console.log("Task id from URL:", id);

    const task = await Taskify.findOne({
      _id: id,
      userId: userId,
    });

    console.log("Task found:", task);

    if (!task) {

      const allTasks = await Taskify.find({});

      console.log("All tasks in DB:", allTasks);

      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
          debug: {
            userId,
            id
          }
        },
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