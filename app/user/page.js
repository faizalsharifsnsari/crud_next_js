import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectionStr } from "../lib/mongodb";
import User from "../lib/model/User";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function UserPage() {
  // 1️⃣ Connect to MongoDB
  if (mongoose.connection.readyState === 0) await mongoose.connect(connectionStr);

  // 2️⃣ Get Google session
  const session = await getServerSession(authOptions);
  let user = null;

  if (session?.user?.id) {
    user = await User.findById(session.user.id).select(
      "name email image sessionToken"
    );
    console.log("✅ Google login detected:", user?.email);
  }

  // 3️⃣ Truecaller fallback (only if Google session not found)
  if (!user) {
    const cookieStore = await cookies();
    const truecallerToken = cookieStore.get("truecaller_session")?.value;

    if (truecallerToken) {
      user = await User.findOne({ sessionToken: truecallerToken }).select(
        "name email image sessionToken"
      );
      console.log("✅ Truecaller login detected:", user?.phone);
    }
  }

  // 4️⃣ If no auth found
  if (!user) {
    console.log("❌ No authentication found, redirecting...");
    redirect("/auth/login");
  }

  // 5️⃣ Render user info (or your ProfileClient component)
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}