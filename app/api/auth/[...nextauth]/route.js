export const runtime = "nodejs";
import mongoose from "mongoose";
import { connectionStr } from "../../../lib/mongodb";
import User from "../../../lib/model/User";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Truecaller initial body:", body);

    // If flow just started
    if (body.status === "flow_invoked") {
      return Response.json(
        { message: "Flow started" },
        { status: 200 }
      );
    }

    const { accessToken, endpoint } = body;

    if (!accessToken || !endpoint) {
      return Response.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();
    console.log("Truecaller profile:", profile);

    // Connect DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // Extract fields
    const phone = profile.phoneNumber;
    const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    const email = profile.email || null;

    if (!phone) {
      return Response.json(
        { error: "Phone number missing from Truecaller" },
        { status: 400 }
      );
    }

    // Check existing user
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        image: null,
        provider: "truecaller",
      });

      console.log("✅ New Truecaller user created");
    } else {
      console.log("ℹ️ Existing user foundskjfnsjkf");

    }

    return Response.json(
      {
        success: true,
        message: "User stored successfully",
        userId: user._id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Callback error:", error);
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}