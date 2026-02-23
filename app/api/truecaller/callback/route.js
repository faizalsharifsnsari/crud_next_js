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
   const phone = profile.phoneNumbers?.[0]?.toString();

const firstName = profile.name?.first || "";
const lastName = profile.name?.last || "";
const name = `${firstName} ${lastName}`.trim();

const email = profile.onlineIdentities?.email || null;
const image = profile.avatarUrl || null;

    if (!phone) {
      return Response.json(
        { error: "Phone number missing from Truecaller" },
        { status: 400 }
      );
    }

    // Check existing user
    let user = await User.findOne({
  $or: [
    { email: email },
    { phone: phone }
  ]
});

   if (!user) {
  // Create new user
  user = await User.create({
    name,
    phone,
    email,
    image,
    providers: ["truecaller"],
  });

  console.log("✅ New Truecaller user created");

} else {

  // Update missing fields if needed
  if (!user.phone) user.phone = phone;
  if (!user.email) user.email = email;
  if (!user.image) user.image = image;

  // Add provider if not already added
  if (!user.providers?.includes("truecaller")) {
    user.providers = [...(user.providers || []), "truecaller"];
  }

  await user.save();

  console.log("ℹ️ Existing user updated");
}
return Response.json({
  success: true,
  userId: user._id,
});

  } catch (error) {
    console.error("Callback error:", error);
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}