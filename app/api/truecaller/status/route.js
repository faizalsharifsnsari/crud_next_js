import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "../../auth/[...nextauth]/route";
import { connectionStr } from "../../../lib/mongodb";
import { Taskify } from "../../../lib/model/Product";
import TruecallerUser from "../../../lib/model/User";

export async function PATCH(req) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    let userId = null;

    // ✅ Try NextAuth session first (Google login)
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      userId = session.user.id;
    }

    // ✅ If no NextAuth session → try Truecaller cookie
    if (!userId) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("taskify_session")?.value;

      if (sessionToken) {
        const user = await TruecallerUser.findOne({ sessionToken });
        if (user) {
          userId = user._id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updates = await req.json();

    const bulkOps = updates.map((task) => ({
      updateOne: {
        filter: {
          _id: task.id,
          userId: userId,
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