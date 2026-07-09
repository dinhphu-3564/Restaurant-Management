const express = require("express");
const {
  requireAuth,
  requireStaffOrHigher,
  requireCashierOrHigher,
} = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

const router = express.Router();

// GET /api/orders - Lấy danh sách đơn hàng
router.get("/", requireAuth, requireStaffOrHigher, orderController.getOrders);

// GET /api/orders/me - Lấy lịch sử đơn hàng của tài khoản đang đăng nhập
router.get("/me", requireAuth, orderController.getMyOrders);

// GET /api/orders/me/:id - Lấy chi tiết đơn hàng của tài khoản đang đăng nhập
router.get("/me/:id", requireAuth, orderController.getMyOrderById);

// GET /api/orders/:id - Lấy chi tiết đơn hàng (Nhân viên)
router.get(
  "/:id",
  requireAuth,
  requireStaffOrHigher,
  orderController.getOrderById,
);

// POST /api/orders - Tạo đơn hàng mới
router.post("/", requireAuth, orderController.createOrder);

// PATCH /api/orders/:id - Cập nhật đơn hàng
router.patch(
  "/:id",
  requireAuth,
  requireStaffOrHigher,
  orderController.updateOrder,
);

// POST /api/orders/:id/payments - Thêm thanh toán (chia bill / trả trước)
router.post(
  "/:id/payments",
  requireAuth,
  requireCashierOrHigher,
  orderController.addPayment,
);

module.exports = router;
