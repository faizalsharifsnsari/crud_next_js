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
        profile: { label: "profile", type: "text" },
      },
      async authorize(credentials) {
        const profile = JSON.parse(credentials.profile);

        const phone = profile.phoneNumbers?.[0];
        const email = profile.onlineIdentities?.email || null;

        if (!phone) return null;

        return {
          id: phone, // unique identifier
          name: profile.name?.first || "Truecaller User",
          email: email,
          image: profile.avatarUrl || null,
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