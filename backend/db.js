import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gamestore";
  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
};

export default connectDB;
