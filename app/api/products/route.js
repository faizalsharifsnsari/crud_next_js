import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../lib/mongodb";
import { Taskify } from "../../lib/model/Product";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // 🔐 Get logged-in user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 🔌 Connect DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // 🔥 FETCH ONLY USER'S TASKS
    
    const data = await Taskify.find({
      userId: session.user.id, // 🔐 user-specific
    }).sort({ order: 1 }); 

    return NextResponse.json({ success: true, result: data });
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await request.json();

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // 🔥 FIX: calculate order
    const count = await Taskify.countDocuments({
      userId: session.user.id,
    });

    const task = new Taskify({
      ...payload,
      userId: session.user.id,
      order: count, // ✅ append at bottom
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



export async function DELETE(req, { params }) {
  try {
    // 🔐 Get logged-in user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔌 Connect DB (same as your GET)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const { id } = params;

    // 1️⃣ Find task (user-scoped)
    const task = await Taskify.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const deletedOrder = task.order;

    // 2️⃣ Delete task
    await Taskify.deleteOne({ _id: id });

    // 3️⃣ Fix order for remaining tasks
    await Taskify.updateMany(
      {
        userId: session.user.id,
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
