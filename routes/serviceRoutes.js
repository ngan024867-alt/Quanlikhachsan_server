const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const ServiceOrder = require("../models/ServiceOrder");

// 🟢 User tạo đơn dịch vụ
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { services, time, roomNumber } = req.body;
    const order = new ServiceOrder({
      services,
      time,
      roomNumber,
      username: req.user.username // lấy từ token
    });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tạo đơn dịch vụ: " + err.message });
  }
});

// 🟢 User xem đơn của mình
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ username: req.user.username });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dịch vụ: " + err.message });
  }
});

// 🟢 Admin xem tất cả đơn
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await ServiceOrder.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dịch vụ: " + err.message });
  }
});


// 🟢 Admin cập nhật trạng thái
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Thiếu trạng thái cần cập nhật" });
    }

    const order = await ServiceOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn dịch vụ" });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Cập nhật trạng thái thành công",
      order
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật trạng thái: " + err.message });
  }
});

module.exports = router;
