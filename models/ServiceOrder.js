const mongoose = require("mongoose");

const serviceOrderSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  services: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  roomNumber: String,
  username: String,
  status: { type: String, enum: ['Chờ xử lý', 'Đang xử lý', 'Hoàn thành', 'Hủy'], default: 'Chờ xử lý' },
  totalAmount: Number
}, { timestamps: true });

serviceOrderSchema.index({ booking: 1, status: 1 });

module.exports = mongoose.model("ServiceOrder", serviceOrderSchema);
