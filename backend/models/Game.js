import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const gameSchema = new mongoose.Schema({
  game_id: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: String, required: true },
  platform: { type: String, default: "" },
  genre: { type: String, required: true },
  gameicon: { type: String, default: "" },
  stock_quantity: { type: Number, default: 0 },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

gameSchema.pre("save", async function () {
  if (this.isNew) {
    this.game_id = await getNextSequence("game_id");
  }
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
