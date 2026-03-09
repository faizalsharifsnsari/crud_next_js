import mongoose from "mongoose";

const TruecallerVerificationSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    phone: {
      type: String,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // ⏳ auto delete after 10 minutes
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TruecallerVerification ||
  mongoose.model("TruecallerVerification", TruecallerVerificationSchema);