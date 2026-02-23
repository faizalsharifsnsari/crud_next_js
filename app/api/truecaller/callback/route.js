export const runtime = "nodejs";

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionStr } from "../../../lib/mongodb";
import User from "../../../lib/model/User";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Truecaller initial body:", body);

    // Flow started check
    if (body.status === "flow_invoked") {
      return NextResponse.json({ message: "Flow started" });
    }

    const { accessToken, endpoint } = body;

    if (!accessToken || !endpoint) {
      return NextResponse.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    // Fetch profile from Truecaller
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
      return NextResponse.json(
        { error: "Phone number missing" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        image,
        providers: ["truecaller"],
      });

      console.log("✅ New Truecaller user created");
    } else {
      if (!user.phone) user.phone = phone;
      if (!user.email) user.email = email;
      if (!user.image) user.image = image;

      if (!user.providers?.includes("truecaller")) {
        user.providers = [...(user.providers || []), "truecaller"];
      }

      await user.save();
      console.log("ℹ️ Existing user updated");
    }

    // 🔥 IMPORTANT PART
    // Return HTML that redirects browser to NextAuth credentials login

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            window.location.href = "/api/auth/signin/truecaller?userId=${user._id}&callbackUrl=/user";
          </script>
        </head>
        <body>
          Logging you in...
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}