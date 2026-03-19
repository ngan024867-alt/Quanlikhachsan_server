const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());


  const User = require("./models/User");
  const bcrypt = require("bcryptjs");
  
  async function createDefaultAdmin() {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new User({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log("Admin mặc định đã được tạo: admin / admin123");
    }
  }
  
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("MongoDB connected");
      await createDefaultAdmin();
    })
    .catch(err => console.error("MongoDB connection error:", err));
  
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
