import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import connectDB from "./db.js";

import gamesRoutes from "./routes/games.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import ordersRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/gamestore";

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.KEY || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1200000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/games", gamesRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start();
