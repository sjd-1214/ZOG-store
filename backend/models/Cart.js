import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const cartSchema = new mongoose.Schema({
  cart_id: { type: Number, unique: true },
  user_id: { type: Number, required: true },
  game_id: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

cartSchema.pre("save", async function () {
  if (this.isNew) {
    this.cart_id = await getNextSequence("cart_id");
  }
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
