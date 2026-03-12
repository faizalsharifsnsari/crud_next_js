import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongoClient";
import { cookies } from "next/headers";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  debug: true,

  session: {
    strategy: "database",
  },

  callbacks: {

    async signIn({ account }) {

      // ✅ If user logs in with Google, remove Truecaller session
      if (account?.provider === "google") {
        const cookieStore = await cookies();
        cookieStore.delete("taskify_session");
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };