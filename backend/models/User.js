import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  created_at: { type: Date, default: Date.now },
});

userSchema.pre("save", async function () {
  if (this.isNew) {
    this.user_id = await getNextSequence("user_id");
  }
});

const User = mongoose.model("User", userSchema);

export default User;
