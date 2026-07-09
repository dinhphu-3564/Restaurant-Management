const express = require("express");
const {
  requireAuth,
  requireBackOffice,
  requireManagerOrAdmin,
} = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

// POST /api/bookings - Người dùng tạo đặt bàn
router.post("/", requireAuth, bookingController.createBooking);

// GET /api/bookings/me - Người dùng lấy lịch sử đặt bàn của mình
router.get("/me", requireAuth, bookingController.getMyBookings);

// GET /api/bookings/me/:id - Người dùng lấy chi tiết đặt bàn của mình
router.get("/me/:id", requireAuth, bookingController.getMyBookingById);

// GET /api/bookings/availability?date=YYYY-MM-DD
router.get("/availability", bookingController.getAvailability);

// GET /api/bookings/admin - Admin lấy danh sách đặt bàn
router.get(
  "/admin",
  requireAuth,
  requireBackOffice,
  bookingController.getAdminBookings,
);

// POST /api/bookings/admin - Admin tạo đặt bàn
router.post(
  "/admin",
  requireAuth,
  requireBackOffice,
  bookingController.adminCreateBooking,
);

// PATCH /api/bookings/admin/:id - Admin sửa đặt bàn
router.patch(
  "/admin/:id",
  requireAuth,
  requireBackOffice,
  bookingController.adminUpdateBooking,
);

// PATCH /api/bookings/admin/:id/status - Admin cập nhật trạng thái đặt bàn
router.patch(
  "/admin/:id/status",
  requireAuth,
  requireBackOffice,
  bookingController.adminUpdateBookingStatus,
);

// DELETE /api/bookings/admin/:id - Admin xóa đặt bàn
router.delete(
  "/admin/:id",
  requireAuth,
  requireManagerOrAdmin,
  bookingController.adminDeleteBooking,
);

// PATCH /api/bookings/admin/:id/items - Admin cập nhật thực đơn đặt bàn
router.patch(
  "/admin/:id/items",
  requireAuth,
  requireBackOffice,
  bookingController.adminUpdateItems,
);

// PATCH /api/bookings/admin/:id/payment - Admin cập nhật thanh toán đặt bàn
router.patch(
  "/admin/:id/payment",
  requireAuth,
  requireBackOffice,
  bookingController.adminUpdatePayment,
);

module.exports = router;
