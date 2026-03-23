export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    console.log("🔥 POST /api/upload HIT");

    // =========================
    // 🔵 READ FORM DATA
    // =========================
    const formData = await req.formData();
    console.log("🟡 FORM DATA RECEIVED");

    const file = formData.get("file");

    // =========================
    // ❌ FILE VALIDATION
    // =========================
    if (!file) {
      console.log("❌ NO FILE FOUND IN FORM DATA");
      return NextResponse.json(
        { success: false, error: "No file received" },
        { status: 400 }
      );
    }

    console.log("🟢 FILE RECEIVED:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // =========================
    // ❌ TYPE VALIDATION
    // =========================
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      console.log("❌ INVALID FILE TYPE:", file.type);
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, WEBP allowed" },
        { status: 400 }
      );
    }

    // =========================
    // ❌ SIZE VALIDATION (2MB)
    // =========================
    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      console.log("❌ FILE TOO LARGE:", file.size);
      return NextResponse.json(
        { success: false, error: "File size exceeds 2MB" },
        { status: 400 }
      );
    }

    // =========================
    // 🔵 CONVERT TO BUFFER
    // =========================
    console.log("🟡 CONVERTING FILE TO BUFFER...");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("🟢 BUFFER CREATED:", buffer.length);

    // =========================
    // 🔵 CLOUDINARY UPLOAD
    // =========================
    console.log("🟡 UPLOADING TO CLOUDINARY...");

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "profile_avatars",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.log("❌ CLOUDINARY ERROR:", error);
              reject(error);
            } else {
              console.log("🟢 CLOUDINARY SUCCESS:", result);
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    // =========================
    // ❌ RESULT VALIDATION
    // =========================
    if (!result || !result.secure_url) {
      console.log("❌ INVALID CLOUDINARY RESPONSE:", result);
      return NextResponse.json(
        { success: false, error: "Upload failed - no URL returned" },
        { status: 500 }
      );
    }

    console.log("🟢 FINAL IMAGE URL:", result.secure_url);

    // =========================
    // ✅ SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });

  } catch (error) {
    console.error("🔥 UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack, // 🔥 extra debug
      },
      { status: 500 }
    );
  }
}