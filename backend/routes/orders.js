import express from "express";
import Cart from "../models/Cart.js";
import Game from "../models/Game.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import { isAuthenticated, isRegularUser } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/create", isRegularUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { paymentMethod } = req.body;

    const cartItems = await Cart.find({ user_id: userId }).lean();
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const gameIds = cartItems.map((item) => item.game_id);
    const games = await Game.find({ game_id: { $in: gameIds } }).lean();
    const gameMap = {};
    games.forEach((g) => {
      gameMap[g.game_id] = g;
    });

    for (const item of cartItems) {
      const game = gameMap[item.game_id];
      if (!game || item.quantity > game.stock_quantity) {
        return res.status(400).json({
          message: "Item is out of stock or quantity exceeds available stock",
          gameId: item.game_id,
        });
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      const game = gameMap[item.game_id];
      return sum + parseFloat(game.price) * item.quantity;
    }, 0);

    const order = new Order({ user_id: userId, total_amount: totalAmount });
    await order.save();

    for (const item of cartItems) {
      const orderItem = new OrderItem({
        order_id: order.order_id,
        game_id: item.game_id,
        quantity: item.quantity,
      });
      await orderItem.save();

      await Game.updateOne(
        { game_id: item.game_id },
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    const payment = new Payment({
      order_id: order.order_id,
      payment_method: paymentMethod || "Credit Card",
    });
    await payment.save();

    await Cart.deleteMany({ user_id: userId });

    res.status(201).json({
      message: "Order created successfully",
      orderId: order.order_id,
      totalAmount,
      itemCount: cartItems.length,
      paymentId: payment.payment_id,
      paymentStatus: "Pending",
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating order" });
  }
});

router.get("/", isRegularUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const statusFilter = req.query.status;

    const countPipeline = [
      { $match: { user_id: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ];
    const statusResults = await Order.aggregate(countPipeline);

    const statusCounts = {};
    statusResults.forEach((row) => {
      statusCounts[row._id || "Unknown"] = row.count;
    });

    const filter = { user_id: userId };
    if (statusFilter && statusFilter !== "All") {
      filter.status = statusFilter;
    }

    const orders = await Order.find(filter)
      .sort({ order_id: -1 })
      .lean();

    if (orders.length === 0) {
      return res.status(200).json({ orders: [], statusCounts });
    }

    const orderIds = orders.map((o) => o.order_id);

    const payments = await Payment.find({ order_id: { $in: orderIds } }).lean();
    const paymentMap = {};
    payments.forEach((p) => {
      paymentMap[p.order_id] = p.payment_method;
    });

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
      const price = parseFloat(game.price) || 0;
      itemsByOrder[item.order_id].push({
        order_id: item.order_id,
        order_item_id: item.order_item_id,
        game_id: item.game_id,
        quantity: item.quantity,
        title: game.title || "Product No Longer Available",
        price: game.price || 0,
        gameicon: game.gameicon || "",
        subtotal: price * item.quantity,
      });
    });

    const ordersWithItems = orders.map((order) => ({
      order_id: order.order_id,
      total_amount: order.total_amount,
      order_date: order.order_date,
      order_status: order.status,
      payment_method: paymentMap[order.order_id] || null,
      items: itemsByOrder[order.order_id] || [],
    }));

    res.status(200).json({ orders: ordersWithItems, statusCounts });
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get("/search", isRegularUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.findOne({
      user_id: userId,
      order_id: parseInt(orderId),
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.findOne({ order_id: order.order_id }).lean();

    const orderItems = await OrderItem.find({ order_id: order.order_id })
      .sort({ order_item_id: -1 })
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
        order_id: item.order_id,
        order_item_id: item.order_item_id,
        game_id: item.game_id,
        quantity: item.quantity,
        title: game.title || "Product No Longer Available",
        price: game.price || 0,
        gameicon: game.gameicon || "",
        subtotal: price * item.quantity,
      };
    });

    res.status(200).json({
      order: {
        order_id: order.order_id,
        total_amount: order.total_amount,
        order_date: order.order_date,
        order_status: order.status,
        payment_method: payment ? payment.payment_method : null,
        items,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error searching order" });
  }
});

export default router;
