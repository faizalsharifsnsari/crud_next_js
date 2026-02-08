import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // ✅ If already logged in, go to dashboard
  if (session) {
    redirect("/user");
  }

  return <LoginClient />;
}
