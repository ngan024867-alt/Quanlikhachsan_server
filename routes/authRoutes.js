const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Đăng ký (thêm email)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Thiếu thông tin đăng ký" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Sai tài khoản" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Quên mật khẩu: nhập email, tạo mật khẩu ngẫu nhiên và gửi vào mail
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Không tìm thấy user" });

    // Tạo mật khẩu ngẫu nhiên
    const newPassword = Math.random().toString(36).slice(-8);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Gửi email cho người dùng
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // email gửi
        pass: process.env.EMAIL_PASS  // mật khẩu ứng dụng
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset mật khẩu Hotel Management",
      text: `Mật khẩu mới của bạn là: ${newPassword}`
    });

    res.json({ message: "Mật khẩu mới đã được gửi vào email của bạn" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
