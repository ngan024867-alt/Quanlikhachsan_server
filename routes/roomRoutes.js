const express = require("express");
const Room = require("../models/Room");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const validation = require("../middleware/validation");
const router = express.Router();

// Lấy danh sách phòng
router.get("/", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// Thêm phòng (admin)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { error } = validation.roomSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const room = new Room(req.body);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cập nhật trạng thái phòng
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
