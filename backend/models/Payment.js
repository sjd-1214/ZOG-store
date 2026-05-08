import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const paymentSchema = new mongoose.Schema({
  payment_id: { type: Number, unique: true },
  order_id: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now },
  payment_method: { type: String, required: true },
});

paymentSchema.pre("save", async function () {
  if (this.isNew) {
    this.payment_id = await getNextSequence("payment_id");
  }
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
