const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// Đặt phòng (user)
// Đặt phòng (user)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { room, checkin, checkout, services } = req.body;

    // kiểm tra phòng
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ error: "Không tìm thấy phòng" });
    }
    if (roomDoc.status !== "available") {
      return res.status(400).json({ error: "Phòng không khả dụng" });
    }

    // kiểm tra ngày
    if (!checkin || !checkout) {
      return res.status(400).json({ error: "Thiếu ngày check-in hoặc check-out" });
    }
    if (new Date(checkout) <= new Date(checkin)) {
      return res.status(400).json({ error: "Ngày check-out phải sau check-in" });
    }

    // tạo booking
    const booking = new Booking({
      user: req.user._id, // lấy từ token
      room,
      checkin: new Date(checkin),
      checkout: new Date(checkout),
      services: Array.isArray(services) ? services : (services ? services.split(",") : []),
      status: "booked"
    });
    await booking.save();
    console.log("Booking saved:", booking);


    // cập nhật trạng thái phòng
    roomDoc.status = "booked";
    await roomDoc.save();

    res.json({ message: "Đặt phòng thành công", booking });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Lỗi đặt phòng: " + err.message });
  }
});

// Xác nhận ngày nhận phòng (admin)
router.post("/checkin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return res.status(404).json({ error: "Không tìm thấy booking" });

    // chỉ cho phép xác nhận nếu chưa có actualCheckinDate
    if (booking.actualCheckinDate) {
      return res.status(400).json({ error: "Đã xác nhận ngày nhận phòng trước đó" });
    }

    booking.actualCheckinDate = new Date(); // ngày hiện tại
    await booking.save();

    res.json({ message: "Xác nhận ngày nhận phòng thành công", booking });
  } catch (err) {
    res.status(400).json({ error: "Lỗi xác nhận ngày nhận phòng: " + err.message });
  }
});


// Checkout (admin)
router.post("/checkout/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return res.status(404).json({ error: "Không tìm thấy booking" });

    // cập nhật trạng thái phòng về available
    await Room.findByIdAndUpdate(booking.room._id, { status: "available" });

    // lấy ngày hiện tại làm ngày checkout thực tế
    const actualCheckoutDate = new Date();

    // tính số ngày ở (làm tròn lên 1 ngày nếu ở < 24h)
    const checkinDate = new Date(booking.checkin);
    const diffTime = Math.abs(actualCheckoutDate - checkinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // tính tổng tiền
    const totalAmount = diffDays * booking.room.price;

    // cập nhật booking
    booking.status = "checkedout";
    booking.checkoutDate = actualCheckoutDate;
    booking.totalAmount = totalAmount; // thêm trường này vào model Booking nếu chưa có
    await booking.save();

    res.json({ message: "Checkout thành công", booking });
  } catch (err) {
    res.status(400).json({ error: "Lỗi checkout: " + err.message });
  }
});

// Hủy booking (user, trước khi check-in)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Không tìm thấy booking" });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền hủy booking này" });
    }

    if (new Date(booking.checkin) <= new Date()) {
      return res.status(400).json({ error: "Không thể hủy sau khi đã check-in" });
    }

    await Room.findByIdAndUpdate(booking.room, { status: "available" });

    booking.status = "cancelled";
    booking.cancelDate = new Date();
    await booking.save();

    res.json({ message: "Hủy booking thành công", booking });
  } catch (err) {
    res.status(400).json({ error: "Lỗi hủy booking: " + err.message });
  }
});

// Lấy danh sách booking
router.get("/", authMiddleware, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === "admin") {
      bookings = await Booking.find().populate("user").populate("room");
    } else {
      bookings = await Booking.find({ user: req.user._id }).populate("room");
    }
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: "Lỗi lấy danh sách: " + err.message });
  }
});

module.exports = router;
