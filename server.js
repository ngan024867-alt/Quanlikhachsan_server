const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // cho phép request không có origin (ví dụ từ server)
    if (
      origin === "http://localhost:3000" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

const User = require("./models/User");
const bcrypt = require("bcryptjs");

async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      const admin = new User({
        username: "admin",
        email: "admin@hotel.com",
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log("✅ Admin created: admin / admin123");
    }
  } catch (err) {
    console.error("Admin creation error:", err);
  }
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoteldb')
  .then(async () => {
    console.log("✅ MongoDB connected");
await createDefaultAdmin().catch(err => console.error("Admin create skipped:", err));
    
    // ADD ROUTES AFTER DB CONNECTED
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/rooms", require("./routes/roomRoutes"));
    app.use("/api/bookings", require("./routes/bookingRoutes"));
    app.use("/api/users", require("./routes/userRoutes"));
    app.use("/api/services", require("./routes/serviceRoutes"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

module.exports = app;

