const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['Standard', 'Deluxe', 'Suite', 'Vip'] },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["available", "booked", "maintenance"], default: "available" },
  images: [{ type: String }],
  amenities: [{ type: String }],
  description: String,
  capacity: { type: Number, default: 2 }
}, { timestamps: true });



module.exports = mongoose.model("Room", roomSchema);
