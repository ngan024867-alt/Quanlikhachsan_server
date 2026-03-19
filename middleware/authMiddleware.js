const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực token
async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Không có token, vui lòng đăng nhập" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // tìm user trong DB bằng id từ token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User không tồn tại" });
    }

    req.user = user; // gắn user đầy đủ vào request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
}

// Middleware kiểm tra quyền admin
function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Bạn không có quyền admin" });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
