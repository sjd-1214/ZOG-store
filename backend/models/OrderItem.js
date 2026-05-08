import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const orderItemSchema = new mongoose.Schema({
  order_item_id: { type: Number, unique: true },
  order_id: { type: Number, required: true },
  game_id: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

orderItemSchema.pre("save", async function () {
  if (this.isNew) {
    this.order_item_id = await getNextSequence("order_item_id");
  }
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
