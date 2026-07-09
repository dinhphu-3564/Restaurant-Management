const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register - Đăng ký tài khoản
router.post("/register", authController.register);

// POST /api/auth/login - Đăng nhập truyền thống
router.post("/login", authController.login);

// POST /api/auth/social-login - Đăng nhập Google/Facebook
router.post("/social-login", authController.socialLogin);

// GET /api/auth/me - Lấy thông tin tài khoản hiện tại
router.get("/me", requireAuth, authController.getMe);

// GET /api/auth/verify-email - Xác thực email
router.get("/verify-email", authController.verifyEmail);

module.exports = router;
