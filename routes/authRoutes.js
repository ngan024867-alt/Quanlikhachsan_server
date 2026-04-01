const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Helper for JWT secret
const getJWTSecret = () => process.env.JWT_SECRET || "hotel-secret-2024";

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username/Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword, role: "user", lockAttempts: 0, locked: false });
    await user.save();

    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Lỗi đăng ký" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Không tìm thấy tài khoản" });
    if (user.locked) return res.status(400).json({ error: "Tài khoản đã bị khóa" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.lockAttempts || 0) + 1;
      const locked = attempts >= 5;
      await User.updateOne({ _id: user._id }, { $set: { lockAttempts: attempts, locked } });
      return res.status(400).json({ error: "Sai mật khẩu" });
    }

    // Reset lock attempts khi đăng nhập đúng
    await User.updateOne({ _id: user._id }, { $set: { lockAttempts: 0 } });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJWTSecret(),
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Lỗi đăng nhập" });
  }
});

module.exports = router;
