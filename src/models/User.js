import mongoose from "mongoose";
import { ROLES } from "../utils/const.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ROLES,
    },
  },
  {
    collection: "users",
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
