import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import TruecallerUser from "../../../lib/model/User";

import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

/* -------- GET USER ID FROM GOOGLE OR TRUECALLER -------- */

async function getUserId() {

  console.log("STEP 1: Checking login session");

  const session = await getServerSession(authOptions);

  console.log("SESSION DATA:", session);

  // GOOGLE LOGIN
  if (session?.user?.id) {
    console.log("LOGIN TYPE: GOOGLE");
    console.log("GOOGLE USER ID:", session.user.id);
    return session.user.id;
  }

  console.log("STEP 2: Checking Truecaller cookie");

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("taskify_session")?.value;

  console.log("TRUECALLER COOKIE:", sessionToken);

  if (!sessionToken) {
    console.log("ERROR: No Truecaller cookie found");
    return null;
  }

  console.log("STEP 3: Finding Truecaller user in DB");

  const user = await TruecallerUser.findOne({ sessionToken });

  console.log("TRUECALLER USER FROM DB:", user);

  if (!user) {
    console.log("ERROR: Truecaller user not found in DB");
    return null;
  }

  console.log("LOGIN TYPE: TRUECALLER");
  console.log("TRUECALLER USER ID:", user._id.toString());

  return user._id.toString();
}

/* ---------------- DELETE TASK ---------------- */

export async function DELETE(req, context) {

  try {

    console.log("===== DELETE API CALLED =====");

    const userId = await getUserId();

    console.log("USER ID RECEIVED:", userId);

    if (!userId) {
      console.log("ERROR: Unauthorized user");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("STEP 4: Checking MongoDB connection");

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("MongoDB connected");
    }

    const { id } = await context.params;

    console.log("TASK ID RECEIVED:", id);

    if (!id) {
      console.log("ERROR: Task ID missing");
      return NextResponse.json(
        { success: false, message: "Task ID missing" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ERROR: Invalid Mongo ID");
      return NextResponse.json(
        { success: false, message: "Invalid Task ID" },
        { status: 400 }
      );
    }

    console.log("STEP 5: Searching task in DB");

    const task = await Taskify.findOne({
      _id: id,
      userId: userId,
    });

    console.log("TASK FOUND:", task);

    if (!task) {
      console.log("ERROR: Task not found for this user");
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const deletedOrder = task.order;

    console.log("STEP 6: Deleting task");

    await Taskify.deleteOne({ _id: id });

    console.log("STEP 7: Reordering remaining tasks");

    await Taskify.updateMany(
      {
        userId: userId,
        order: { $gt: deletedOrder },
      },
      { $inc: { order: -1 } }
    );

    console.log("DELETE SUCCESS");

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {

    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ---------------- UPDATE TASK ---------------- */

export async function PUT(req, context) {

  try {

    console.log("===== UPDATE API CALLED =====");

    const userId = await getUserId();

    console.log("USER ID RECEIVED:", userId);

    if (!userId) {
      console.log("ERROR: Unauthorized user");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("STEP 4: Checking MongoDB connection");

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("MongoDB connected");
    }

    const { id } = await context.params;

    console.log("TASK ID RECEIVED:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ERROR: Invalid Mongo ID");
      return NextResponse.json(
        { success: false, message: "Invalid Task ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    console.log("REQUEST BODY:", body);

    const {
      title,
      description,
      priority,
      status,
      dueDate,
    } = body;

    if (!title) {
      console.log("ERROR: Title missing");
      return NextResponse.json(
        { success: false, message: "Title required" },
        { status: 400 }
      );
    }

    console.log("STEP 5: Updating task");

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

    console.log("UPDATED TASK:", updatedTask);

    if (!updatedTask) {
      console.log("ERROR: Task not found or not owned by user");
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    console.log("UPDATE SUCCESS");

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (error) {

    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}