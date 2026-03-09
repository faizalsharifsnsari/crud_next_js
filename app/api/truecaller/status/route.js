import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectionStr } from "../../../lib/mongodb";
import TruecallerVerification from "../../../lib/model/TruecallerVerification";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json({ status: "pending" });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionStr);
    }

    const record = await TruecallerVerification.findOne({ requestId });

    if (!record || !record.verified) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({
      status: "verified",
      phone: record.phone,
    });

  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json({ status: "error" });
  }
}