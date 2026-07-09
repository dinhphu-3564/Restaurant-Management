const express = require("express");
const {
  requireAuth,
  requireAdmin,
  requireManagerOrAdmin,
} = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// GET /api/users/me - Lấy thông tin cá nhân
router.get("/me", requireAuth, userController.getMe);

// PATCH /api/users/me - Cập nhật thông tin cá nhân
router.patch("/me", requireAuth, userController.updateMe);

// GET /api/users - Lấy danh sách khách hàng (Manager/Admin)
router.get("/", requireAuth, requireManagerOrAdmin, userController.getUsers);

// GET /api/users/:id - Lấy chi tiết khách hàng
router.get("/:id", requireAuth, requireManagerOrAdmin, userController.getUserById);

// PATCH /api/users/:id/status - Cập nhật trạng thái tài khoản (Admin)
router.patch("/:id/status", requireAuth, requireAdmin, userController.updateUserStatus);

// POST /api/users/bulk-status - Cập nhật trạng thái hàng loạt
router.post("/bulk-status", requireAuth, requireAdmin, userController.bulkUpdateUserStatus);

// DELETE /api/users/:id - Xóa mềm khách hàng (Admin)
router.delete("/:id", requireAuth, requireAdmin, userController.deleteUser);

// POST /api/users/bulk-delete - Xóa hàng loạt khách hàng (Admin)
router.post("/bulk-delete", requireAuth, requireAdmin, userController.bulkDeleteUsers);

module.exports = router;
