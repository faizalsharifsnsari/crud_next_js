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
    async session({ session }) {
      if (!session?.user?.email) return session;

      const dbUser = await clientPromise
        .then((client) => client.db())
        .then((db) =>
          db.collection("users").findOne({
            email: session.user.email,
          }),
        );

      if (dbUser) {
        session.user.id = dbUser._id.toString(); // ✅ ALWAYS correct
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
