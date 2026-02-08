
import mongoose from "mongoose"






const Taskify_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    status:{
      type:String,
      enum:["completed","ongoing","not started"],
      default:"not started"
    },

    dueDate: {
      type: Date,
    },

    userId: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
      index:true
    },
    order:{
      type:Number,
      default:0
    },
  },
  {
    timestamps: true, // ✅ correct
  }
);

export const Taskify =
  mongoose.models.Taskify ||
  mongoose.model("Taskify", Taskify_schema);



