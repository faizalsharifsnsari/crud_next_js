import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updates = await req.json(); 
    // [{ id, order }, { id, order }]

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const bulkOps = updates.map((task) => ({
      updateOne: {
        filter: {
          _id: task.id,
          userId: session.user.id, // 🔐 VERY IMPORTANT
        },
        update: {
          order: task.order,
        },
      },
    }));

    await Taskify.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
