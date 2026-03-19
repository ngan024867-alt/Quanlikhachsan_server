const mongoose = require("mongoose");

const serviceOrderSchema = new mongoose.Schema({
  services: String,
  time: Date,
  roomNumber: String,
  username: String,
  status: { type: String, default: "Chờ xử lý" }
});

module.exports = mongoose.model("ServiceOrder", serviceOrderSchema);
