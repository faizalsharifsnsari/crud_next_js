import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../../lib/mongodb";
import { Taskify } from "../../../../lib/model/Product";

import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function DELETE(req, { params }) {

  try {

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const userId = session.user.id;
    const id = params.id;

    console.log("UserId:", userId);
    console.log("TaskId:", id);

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

    console.error(error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );

  }
}