import express from "express";
import bcrypt from "bcrypt";
import Game from "../models/Game.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(isAdmin);

/********************************************************
 * GAME MANAGEMENT
 ********************************************************/
router.post("/games/insert", async (req, res) => {
  try {
    const { title, description, price, platform, genre, gameicon } = req.body;

    if (!title || !price || !genre) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const stockQuantity = req.body.stock_quantity !== undefined ? req.body.stock_quantity : 0;

    const game = new Game({
      title,
      description: description || "",
      price,
      platform: platform || "",
      genre,
      gameicon: gameicon || "",
      stock_quantity: stockQuantity,
    });
    await game.save();

    return res.status(201).json({
      message: "Game added successfully",
      gameId: game.game_id,
      stockQuantity,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding game" });
  }
});

router.put("/games/update", async (req, res) => {
  try {
    const { gameId } = req.query;
    const { title, description, price, platform, genre, gameicon } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (price) updateFields.price = price;
    if (platform) updateFields.platform = platform;
    if (genre) updateFields.genre = genre;
    if (gameicon) updateFields.gameicon = gameicon;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const result = await Game.updateOne(
      { game_id: parseInt(gameId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Game not found" });
    }

    return res.status(200).json({
      message: "Game updated successfully",
      gameId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating game" });
  }
});

router.delete("/games/delete", async (req, res) => {
  try {
    const { gameId } = req.query;

    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    const gid = parseInt(gameId);

    const game = await Game.findOne({ game_id: gid });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const cartCount = await Cart.countDocuments({ game_id: gid });
    if (cartCount > 0) {
      return res.status(400).json({
        message: "Cannot delete game that is in active carts",
        inCart: true,
        inOrders: false,
      });
    }

    const activeOrders = await OrderItem.aggregate([
      { $match: { game_id: gid } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "order_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.status": { $nin: ["shipped", "delivered", "canceled"] },
        },
      },
    ]);

    if (activeOrders.length > 0) {
      return res.status(400).json({
        message: "Cannot delete game that is in active orders",
        inCart: false,
        inOrders: true,
      });
    }

    await Cart.deleteMany({ game_id: gid });
    await Game.updateOne(
      { game_id: gid },
      { $set: { is_deleted: true, stock_quantity: 0 } }
    );

    return res.status(200).json({
      message: "Game deleted successfully",
      gameId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting game" });
  }
});

/********************************************************
 * INVENTORY MANAGEMENT
 ********************************************************/
router.get("/inventory", async (req, res) => {
  try {
    const games = await Game.find()
      .sort({ game_id: -1 })
      .select("game_id title gameicon stock_quantity")
      .lean();

    const results = games.map((g) => ({
      inventory_id: g.game_id,
      game_id: g.game_id,
      stock_quantity: g.stock_quantity,
      title: g.title,
      gameicon: g.gameicon,
    }));

    return res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

router.put("/inventory", async (req, res) => {
  try {
    const { gameId } = req.query;
    const { stockQuantity } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }
    if (stockQuantity === undefined || stockQuantity < 0) {
      return res.status(400).json({ message: "Valid stock quantity is required" });
    }

    const result = await Game.updateOne(
      { game_id: parseInt(gameId) },
      { $set: { stock_quantity: stockQuantity } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Game not found" });
    }

    return res.status(200).json({
      message: "Inventory quantity updated successfully",
      gameId,
      stockQuantity,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating inventory" });
  }
});

/********************************************************
 * ORDER MANAGEMENT
 ********************************************************/
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ order_id: -1 }).lean();

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    const userIds = [...new Set(orders.map((o) => o.user_id))];
    const users = await User.find({ user_id: { $in: userIds } })
      .select("user_id username email")
      .lean();
    const userMap = {};
    users.forEach((u) => {
      userMap[u.user_id] = u;
    });

    const orderIds = orders.map((o) => o.order_id);
    const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
      .sort({ order_item_id: -1 })
      .lean();

    const gameIds = [...new Set(orderItems.map((oi) => oi.game_id))];
    const games = await Game.find({ game_id: { $in: gameIds } })
      .select("game_id title price gameicon")
      .lean();
    const gameMap = {};
    games.forEach((g) => {
      gameMap[g.game_id] = g;
    });

    const itemsByOrder = {};
    orderItems.forEach((item) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      const game = gameMap[item.game_id] || {};
      itemsByOrder[item.order_id].push({
        order_id: item.order_id,
        order_item_id: item.order_item_id,
        game_id: item.game_id,
        quantity: item.quantity,
        price: game.price || 0,
        title: game.title || "Unknown",
        gameicon: game.gameicon || "",
      });
    });

    const ordersWithItems = orders.map((order) => {
      const user = userMap[order.user_id] || {};
      return {
        order_id: order.order_id,
        user_id: order.user_id,
        order_date: order.order_date,
        status: order.status,
        total_amount: order.total_amount,
        username: user.username || "Unknown",
        email: user.email || "",
        items: itemsByOrder[order.order_id] || [],
      };
    });

    return res.status(200).json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get("/orders/search", async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findOne({ order_id: parseInt(orderId) }).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const user = await User.findOne({ user_id: order.user_id })
      .select("user_id username email")
      .lean();

    const orderItems = await OrderItem.find({ order_id: order.order_id })
      .sort({ game_id: 1 })
      .lean();

    const gameIds = orderItems.map((oi) => oi.game_id);
    const games = await Game.find({ game_id: { $in: gameIds } })
      .select("game_id title price gameicon")
      .lean();
    const gameMap = {};
    games.forEach((g) => {
      gameMap[g.game_id] = g;
    });

    const items = orderItems.map((item) => {
      const game = gameMap[item.game_id] || {};
      const price = parseFloat(game.price) || 0;
      return {
        game_id: item.game_id,
        quantity: item.quantity,
        price: game.price || 0,
        title: game.title || "Unknown",
        gameicon: game.gameicon || "",
        subtotal: price * item.quantity,
      };
    });

    return res.status(200).json({
      order: {
        order_id: order.order_id,
        user_id: order.user_id,
        order_date: order.order_date,
        status: order.status,
        total_amount: order.total_amount,
        username: user ? user.username : "Unknown",
        email: user ? user.email : "",
        items,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error searching order" });
  }
});

router.put("/orders/status", async (req, res) => {
  try {
    const { orderId } = req.query;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "canceled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        validValues: validStatuses,
      });
    }

    const result = await Order.updateOne(
      { order_id: parseInt(orderId) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      orderId,
      status,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating order status" });
  }
});

router.delete("/orders", async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const oid = parseInt(orderId);
    const order = await Order.findOne({ order_id: oid });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Payment.deleteMany({ order_id: oid });
    await OrderItem.deleteMany({ order_id: oid });
    await Order.deleteOne({ order_id: oid });

    return res.status(200).json({
      message: "Order deleted successfully",
      orderId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting order" });
  }
});

/********************************************************
 * USER MANAGEMENT
 ********************************************************/
router.get("/users/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const regex = new RegExp(query, "i");
    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    })
      .sort({ user_id: -1 })
      .select("user_id username email created_at role")
      .lean();

    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error searching users" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ user_id: -1 })
      .select("user_id username email created_at role")
      .lean();
    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.put("/users", async (req, res) => {
  try {
    const { userId } = req.query;
    const { username, email, role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (role) {
      const validRoles = ["user", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role value",
          validValues: validRoles,
        });
      }
      updateFields.role = role;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const result = await User.updateOne(
      { user_id: parseInt(userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      userId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

router.put("/users/password", async (req, res) => {
  try {
    const { userId } = req.query;
    const { newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Valid password is required (minimum 8 characters)" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const result = await User.updateOne(
      { user_id: parseInt(userId) },
      { $set: { password: hash } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Password changed successfully",
      userId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
});

router.delete("/users", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const uid = parseInt(userId);

    if (uid === req.session.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const orderCount = await Order.countDocuments({ user_id: uid });
    if (orderCount > 0) {
      return res.status(400).json({
        message: "Cannot delete user with existing orders",
        orderCount,
      });
    }

    await Cart.deleteMany({ user_id: uid });
    const result = await User.deleteOne({ user_id: uid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      userId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

export default router;
