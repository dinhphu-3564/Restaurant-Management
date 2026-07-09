const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const {
  requireAuth,
  requireManagerOrAdmin,
} = require("../middleware/authMiddleware");
const dealController = require("../controllers/dealController");

// Upload ảnh khuyến mãi
const uploadDir = path.join(__dirname, "../../uploads/deals");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const dealStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `deal-${Date.now()}${ext}`);
  },
});

const uploadDealImage = multer({
  storage: dealStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// GET /api/deals - Lấy danh sách khuyến mãi
router.get("/", dealController.getDeals);

// POST /api/deals/upload - Upload ảnh
router.post(
  "/upload",
  requireAuth,
  requireManagerOrAdmin,
  uploadDealImage.single("image"),
  dealController.uploadImage
);

// POST /api/deals - Thêm khuyến mãi (Manager/Admin)
router.post("/", requireAuth, requireManagerOrAdmin, dealController.createDeal);

// PATCH /api/deals/:id - Cập nhật khuyến mãi (Manager/Admin)
router.patch("/:id", requireAuth, requireManagerOrAdmin, dealController.updateDeal);

// DELETE /api/deals/:id - Xóa khuyến mãi (Manager/Admin)
router.delete("/:id", requireAuth, requireManagerOrAdmin, dealController.deleteDeal);

// POST /api/deals/recalculate-stats - Tính toán lại thống kê khuyến mãi (Manager/Admin)
router.post(
  "/recalculate-stats",
  requireAuth,
  requireManagerOrAdmin,
  dealController.recalculateStats
);

module.exports = router;
