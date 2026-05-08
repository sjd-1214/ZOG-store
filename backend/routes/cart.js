import express from "express";
import Cart from "../models/Cart.js";
import Game from "../models/Game.js";
import { isAuthenticated, isRegularUser } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(isRegularUser);

router.get("/", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cartItems = await Cart.find({ user_id: userId })
      .sort({ cart_id: -1 })
      .lean();

    const gameIds = cartItems.map((item) => item.game_id);
    const games = await Game.find({ game_id: { $in: gameIds } })
      .select("game_id title price gameicon")
      .lean();

    const gameMap = {};
    games.forEach((g) => {
      gameMap[g.game_id] = g;
    });

    const results = cartItems.map((item) => {
      const game = gameMap[item.game_id] || {};
      const price = parseFloat(game.price) || 0;
      return {
        cart_id: item.cart_id,
        user_id: item.user_id,
        game_id: item.game_id,
        quantity: item.quantity,
        title: game.title || "Unknown",
        price: game.price || "0.00",
        gameicon: game.gameicon || "",
        subtotal: item.quantity * price,
      };
    });

    const total = results.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      cartItems: results,
      total,
      itemCount: results.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart items" });
  }
});

router.get("/count", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemCount = await Cart.countDocuments({ user_id: userId });
    res.json({ itemCount });
  } catch (err) {
    res.status(500).json({ message: "Error counting cart items" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { gameId, quantity = 1 } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    const game = await Game.findOne({ game_id: parseInt(gameId) }).lean();
    if (!game) {
      return res.status(404).json({ message: "Product not found in inventory" });
    }

    if (quantity > game.stock_quantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        availableQuantity: game.stock_quantity,
      });
    }

    const existing = await Cart.findOne({ user_id: userId, game_id: parseInt(gameId) });
    if (existing) {
      return res.status(400).json({
        message: "Item already exists in cart. Use update endpoint to modify quantity.",
        cartId: existing.cart_id,
        currentQuantity: existing.quantity,
      });
    }

    const cartItem = new Cart({
      user_id: userId,
      game_id: parseInt(gameId),
      quantity,
    });
    await cartItem.save();

    return res.status(201).json({
      message: "Item added to cart",
      cartId: cartItem.cart_id,
      quantity,
      availableQuantity: game.stock_quantity,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

router.post("/update", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { cartId, quantity } = req.body;

    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const cartItem = await Cart.findOne({ cart_id: cartId, user_id: userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found or unauthorized" });
    }

    const game = await Game.findOne({ game_id: cartItem.game_id }).lean();
    const availableQuantity = game ? game.stock_quantity : 0;

    if (quantity > availableQuantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        availableQuantity,
        cartId,
      });
    }

    if (quantity === cartItem.quantity) {
      return res.status(200).json({
        message: "No change in quantity",
        cartId,
        quantity,
        availableQuantity,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      message: "Cart updated successfully",
      cartId,
      quantity,
      availableQuantity,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating cart item" });
  }
});

router.post("/remove", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { cartId } = req.body;

    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const cartItem = await Cart.findOne({ cart_id: cartId, user_id: userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found or unauthorized" });
    }

    await Cart.deleteOne({ cart_id: cartId });

    return res.status(200).json({
      message: "Item removed from cart",
      cartId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

export default router;
