import mongoose from "mongoose";

const NextAuthUserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    image: String,
    emailVerified: Date,
  },
  { timestamps: true }
);

export default mongoose.models.NextAuthUser ||
  mongoose.model("NextAuthUser", NextAuthUserSchema, "users");