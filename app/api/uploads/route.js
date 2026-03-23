export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(req) {
  try {
    console.log("🔥 PATCH /api/user HIT");

    const session = await getServerSession(authOptions);
    console.log("🟡 SESSION:", session);

    if (!session?.user?.id) {
      console.log("❌ INVALID SESSION");
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("🟡 REQUEST BODY:", body);

    // =========================
    // 🔵 CONNECT DB
    // =========================
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
      console.log("🟢 DB CONNECTED:", mongoose.connection.name);
    }

    // =========================
    // 🔥 DEBUG: CHECK USER EXISTS FIRST
    // =========================
    const existingUser = await User.findOne({
      _id: session.user.id, // 🔥 NO ObjectId conversion
    });

    console.log("🔍 EXISTING USER:", existingUser);

    if (!existingUser) {
      console.log("❌ USER NOT FOUND IN DB");

      // EXTRA DEBUG
      const allUsers = await User.find().limit(5);
      console.log("🧠 SAMPLE USERS FROM DB:", allUsers);

      return NextResponse.json(
        {
          success: false,
          message: "User not found in DB",
          sessionId: session.user.id,
        },
        { status: 404 }
      );
    }

    // =========================
    // 🔵 BUILD UPDATE
    // =========================
    const updateData = {};

    if (body.name) {
      updateData.name = body.name.trim();
    }

    if (body.image) {
      updateData.image = body.image;
    }

    console.log("🟡 UPDATE DATA:", updateData);

    // =========================
    // 🔵 UPDATE USER
    // =========================
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id, // 🔥 IMPORTANT
      updateData,
      { new: true }
    ).select("name email image");

    console.log("🟢 UPDATED USER:", updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}