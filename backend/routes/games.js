import express from "express";
import Game from "../models/Game.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", async (req, res) => {
  try {
    const games = await Game.find({
      $or: [{ is_deleted: false }, { is_deleted: null }],
    })
      .sort({ game_id: -1 })
      .select("-_id -__v")
      .lean();
    res.json(games);
  } catch (err) {
    res.status(500).send("Error fetching data");
  }
});

router.get("/filter", async (req, res) => {
  try {
    const { genre } = req.query;
    const games = await Game.find({
      genre,
      $or: [{ is_deleted: false }, { is_deleted: null }],
    })
      .sort({ game_id: -1 })
      .select("-_id -__v")
      .lean();
    res.json(games);
  } catch (err) {
    res.status(500).send("Error fetching data");
  }
});

router.get("/genres", async (req, res) => {
  try {
    const genres = await Game.distinct("genre", {
      $or: [{ is_deleted: false }, { is_deleted: null }],
    });
    const sorted = genres.sort().reverse().map((genre) => ({ genre }));
    res.json(sorted);
  } catch (err) {
    res.status(500).send("Error fetching genre data");
  }
});

router.get("/search", async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const games = await Game.find({
      title: { $regex: title, $options: "i" },
      $or: [{ is_deleted: false }, { is_deleted: null }],
    })
      .sort({ game_id: -1 })
      .select("-_id -__v")
      .lean();
    res.json(games);
  } catch (err) {
    res.status(500).send("Error searching games");
  }
});

router.get("/game", async (req, res) => {
  try {
    const { gameId } = req.query;
    const game = await Game.findOne({
      game_id: parseInt(gameId),
      $or: [{ is_deleted: false }, { is_deleted: null }],
    })
      .select("-_id -__v")
      .lean();

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (err) {
    res.status(500).send("Error fetching game details");
  }
});

export default router;
