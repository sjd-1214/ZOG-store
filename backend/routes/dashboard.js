import express from "express";
import User from "../models/User.js";
import Game from "../models/Game.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(isAdmin);

router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalGames, totalOrders, salesAgg, recentOrders, paymentStats] =
      await Promise.all([
        User.countDocuments(),
        Game.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $group: { _id: null, totalSales: { $sum: "$total_amount" } } },
        ]),
        Order.find()
          .sort({ order_id: -1 })
          .limit(5)
          .lean(),
        Payment.aggregate([
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
            $group: {
              _id: "$payment_method",
              count: { $sum: 1 },
              total: { $sum: "$order.total_amount" },
            },
          },
          { $sort: { _id: -1 } },
        ]),
      ]);

    const totalSales = salesAgg.length > 0 ? salesAgg[0].totalSales : 0;

    const userIds = [...new Set(recentOrders.map((o) => o.user_id))];
    const users = await User.find({ user_id: { $in: userIds } })
      .select("user_id username")
      .lean();
    const userMap = {};
    users.forEach((u) => {
      userMap[u.user_id] = u.username;
    });

    const formattedRecentOrders = recentOrders.map((o) => ({
      order_id: o.order_id,
      total_amount: o.total_amount,
      order_date: o.order_date,
      username: userMap[o.user_id] || "Unknown",
    }));

    const paymentMethodStats = paymentStats.map((p) => ({
      payment_method: p._id,
      count: p.count,
      total: p.total,
    }));

    res.json({
      totalUsers,
      totalGames,
      totalOrders,
      totalSales,
      recentOrders: formattedRecentOrders,
      paymentMethodStats,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
});

router.get("/top-games", async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topGames = await OrderItem.aggregate([
      {
        $group: {
          _id: "$game_id",
          units_sold: { $sum: "$quantity" },
        },
      },
      { $sort: { units_sold: -1, _id: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "games",
          localField: "_id",
          foreignField: "game_id",
          as: "game",
        },
      },
      { $unwind: "$game" },
      {
        $project: {
          _id: 0,
          game_id: "$_id",
          title: "$game.title",
          units_sold: 1,
          revenue: {
            $multiply: ["$units_sold", { $toDouble: "$game.price" }],
          },
        },
      },
    ]);

    res.json(topGames);
  } catch (err) {
    res.status(500).json({ message: "Error fetching top games data" });
  }
});

export default router;
