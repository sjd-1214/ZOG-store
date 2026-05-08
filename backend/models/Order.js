import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, unique: true },
  user_id: { type: Number, required: true },
  order_date: { type: Date, default: Date.now },
  total_amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "canceled"],
    default: "pending",
  },
});

orderSchema.pre("save", async function () {
  if (this.isNew) {
    this.order_id = await getNextSequence("order_id");
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
