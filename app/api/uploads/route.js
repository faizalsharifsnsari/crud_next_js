import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    console.log("🔥 POST /api/upload HIT");

    console.log("🔐 CLOUDINARY CONFIG:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING",
    });

    const formData = await req.formData();
    console.log("🟡 FORM DATA RECEIVED");

    const file = formData.get("file");

    if (!file) {
      console.log("❌ NO FILE FOUND");
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("🟢 BUFFER CREATED:", buffer.length);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "profile_avatars" },
          (error, result) => {
            if (error) {
              console.log("🔥 CLOUDINARY ERROR:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    console.log("🟢 UPLOAD SUCCESS:", result.secure_url);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("🔥 UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}