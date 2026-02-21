import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      sparse: true,   // ✅ allows null values
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,   // ✅ allows null values
    },

    image: String,
    emailVerified: Date,

    provider: {
      type: String,   // "google" | "truecaller"
    }
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);