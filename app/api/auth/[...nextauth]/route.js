import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongoClient";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    // ✅ Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ✅ Truecaller login
   CredentialsProvider({
  name: "truecaller",
  credentials: {
    userId: { label: "userId", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.userId) return null;

    const { MongoClient, ObjectId } = require("mongodb");
    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(credentials.userId) });

    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
}),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
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