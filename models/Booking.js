const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    checkin: { type: Date, required: true },
    checkout: { type: Date, required: true },
    services: [{ type: String }],
    status: { type: String, enum: ["booked", "checkedout", "cancelled"], default: "booked" },
    actualCheckinDate: { type: Date },
    checkoutDate: { type: Date },
    cancelDate: { type: Date },
    totalAmount: { type: Number } // thêm trường này
  }, { timestamps: true });
  
module.exports = mongoose.model("Booking", bookingSchema);
