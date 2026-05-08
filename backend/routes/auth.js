import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      userId: user.user_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userWithoutPassword = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role || "user",
    };

    req.session.user = userWithoutPassword;
    req.session.isAuthenticated = true;

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      sessionId: req.sessionID,
      isAuthenticated: req.session.isAuthenticated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/logout", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/status", (req, res) => {
  try {
    const isLoggedIn = req.session && req.session.isAuthenticated === true;
    res.status(200).json({
      isAuthenticated: isLoggedIn,
      user: isLoggedIn ? req.session.user : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
