import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Counter } from "./models/Counter.js";
import User from "./models/User.js";
import Game from "./models/Game.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import OrderItem from "./models/OrderItem.js";
import Payment from "./models/Payment.js";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/gamestore";

async function seed() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  await Counter.deleteMany({});
  await User.deleteMany({});
  await Game.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});
  await OrderItem.deleteMany({});
  await Payment.deleteMany({});

  console.log("Cleared existing data");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = new User({
    username: "admin",
    email: "admin@zogstore.com",
    password: adminPassword,
    role: "admin",
  });
  await admin.save();

  const user = new User({
    username: "john",
    email: "john@example.com",
    password: userPassword,
    role: "user",
  });
  await user.save();

  console.log("Users created: admin (admin123), john (user123)");

  const gamesData = [
    {
      title: "The Witcher 3: Wild Hunt",
      description:
        "An action role-playing game set in an open world environment.",
      price: "29.99",
      platform: "PC",
      genre: "RPG",
      gameicon: "https://cdn2.steamgriddb.com/icon/cd3afef9b8b89558cd56f3ea06b22c14/32/256x256.png",
      stock_quantity: 50,
    },
    {
      title: "Red Dead Redemption 2",
      description:
        "An epic tale of life in America at the dawn of the modern age.",
      price: "39.99",
      platform: "PC",
      genre: "Action",
      gameicon: "https://cdn2.steamgriddb.com/icon/b9a25e422daac03190703fbb62801949/32/256x256.png",
      stock_quantity: 35,
    },
    {
      title: "Elden Ring",
      description:
        "An action RPG developed by FromSoftware and published by Bandai Namco.",
      price: "49.99",
      platform: "PC",
      genre: "RPG",
      gameicon: "https://cdn2.steamgriddb.com/icon/46a89885ec689a498e0b5faa0a55cde1/32/256x256.png",
      stock_quantity: 40,
    },
    {
      title: "God of War Ragnarok",
      description:
        "Join Kratos and Atreus on a mythic journey for answers.",
      price: "59.99",
      platform: "PlayStation",
      genre: "Action",
      gameicon: "https://cdn2.steamgriddb.com/icon/7845b20e58db57c0e6a4635a2a30e036/32/256x256.png",
      stock_quantity: 25,
    },
    {
      title: "Zelda: Tears of the Kingdom",
      description:
        "An epic adventure across the land and skies of Hyrule.",
      price: "59.99",
      platform: "Nintendo",
      genre: "Adventure",
      gameicon: "https://cdn2.steamgriddb.com/icon/2b399f498b8c7a3e67305a0c2b9bbb46/32/256x256.png",
      stock_quantity: 30,
    },
    {
      title: "Cyberpunk 2077",
      description:
        "An open-world action-adventure set in Night City.",
      price: "34.99",
      platform: "PC",
      genre: "RPG",
      gameicon: "https://cdn2.steamgriddb.com/icon/7fa732140f3b9a2e3f974bface0a1738/32/256x256.png",
      stock_quantity: 45,
    },
    {
      title: "FIFA 24",
      description:
        "The world's game with HyperMotion technology.",
      price: "49.99",
      platform: "PlayStation",
      genre: "Sports",
      gameicon: "https://cdn2.steamgriddb.com/icon/ad0a4fa31e21058ad6e5c275cf5e4a4e/32/256x256.png",
      stock_quantity: 60,
    },
    {
      title: "Halo Infinite",
      description:
        "Master Chief returns in the next chapter of the legendary franchise.",
      price: "39.99",
      platform: "Xbox",
      genre: "Shooter",
      gameicon: "https://cdn2.steamgriddb.com/icon/b6b87f508b483bcae99aa76ca1508cba/32/256x256.png",
      stock_quantity: 20,
    },
    {
      title: "Minecraft",
      description:
        "A sandbox game where you can build anything you imagine.",
      price: "19.99",
      platform: "PC",
      genre: "Sandbox",
      gameicon: "https://cdn2.steamgriddb.com/icon/25b0340e02e25e97dd4bf1657e3dba94/32/256x256.png",
      stock_quantity: 100,
    },
    {
      title: "Forza Horizon 5",
      description:
        "Explore the vibrant open world landscapes of Mexico.",
      price: "44.99",
      platform: "Xbox",
      genre: "Racing",
      gameicon: "https://cdn2.steamgriddb.com/icon/c635d74df40e13d6c498bb2eb55e7803/32/256x256.png",
      stock_quantity: 30,
    },
  ];

  for (const gameData of gamesData) {
    const game = new Game(gameData);
    await game.save();
  }

  console.log(`${gamesData.length} games created`);
  console.log("\nSeed complete!");
  console.log("Login credentials:");
  console.log("  Admin: admin@zogstore.com / admin123");
  console.log("  User:  john@example.com / user123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
