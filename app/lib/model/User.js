import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const User = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true,
        required:true
    },
    image:String
}
,{
    timestamps:true
});


export const user = mongoose.models.User || mongoose.model("User",User);