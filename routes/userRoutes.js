const express = require("express");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Lấy danh sách user
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Khóa/Mở khóa
router.put("/:id/lock", authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
  user.locked = !user.locked;
  await user.save();
  res.json(user);
});

// Đặt lại mật khẩu
router.put("/:id/password", authMiddleware, adminMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Mật khẩu đã được cập nhật" });
});

// Gửi thông báo
router.post("/:id/notify", authMiddleware, adminMiddleware, async (req, res) => {
  const { message } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
  user.notifications.push({ message, date: new Date() });
  await user.save();
  res.json({ message: "Thông báo đã được gửi" });
});

// Lấy thông tin user hiện tại (bao gồm thông báo)
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
  res.json(user);
});

module.exports = router;
