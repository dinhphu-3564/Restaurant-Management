const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      `
      SELECT id, name, full_name, phone, email, avatar, role, status, created_at
FROM users
WHERE id = ?
LIMIT 1
      `,
      [decoded.id],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại.",
      });
    }

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa.",
      });
    }

    req.user = {
      id: user.id,
      name: user.name || user.full_name,
      fullName: user.full_name || user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập admin.",
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
