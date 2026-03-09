import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows null values
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows null values
    },

    image: String,
    emailVerified: Date,

    providers: {
      type: [String],
      default: [],
    },

    // ⭐ ADD THIS
    requestId: {
      type: String,
      index: true, // optional but faster for polling lookup
    },

    sessionToken: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);