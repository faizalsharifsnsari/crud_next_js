import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectionStr } from "../../../lib/mongodb";
import TruecallerVerification from "../../../lib/model/TruecallerVerification";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Truecaller body:", body);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    // Truecaller first call
    if (body.status === "flow_invoked") {
      return NextResponse.json({ message: "Flow started" });
    }

    const { requestId, accessToken, endpoint } = body;

    if (!accessToken || !endpoint) {
      return NextResponse.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    // fetch profile
    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();

    const phone = profile.phoneNumbers?.[0]?.toString();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone missing" },
        { status: 400 }
      );
    }

    // store verification
    await TruecallerVerification.findOneAndUpdate(
      { requestId },
      {
        requestId,
        phone,
        verified: true,
      },
      { upsert: true }
    );

    console.log("Verification stored for requestId:", requestId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ error: "Internal error" });
  }
}