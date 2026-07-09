const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const {
  requireAuth,
  requireBackOffice,
  requireManagerOrAdmin,
} = require("../middleware/authMiddleware");
const adminMenuController = require("../controllers/adminMenuController");

// Cấu hình upload ảnh
const uploadDir = path.join(__dirname, "../../uploads/menu");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `menu-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const uploadMenuImages = multer({
  storage: menuStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Chỉ cho phép upload JPG, PNG hoặc WebP"));
    }
    cb(null, true);
  },
});

// POST /api/admin/menu/upload - Upload hình ảnh món ăn
router.post(
  "/upload",
  requireAuth,
  requireManagerOrAdmin,
  uploadMenuImages.array("images", 10),
  adminMenuController.uploadImages
);

// GET /api/admin/menu - Lấy danh sách món ăn
router.get("/", requireAuth, requireBackOffice, adminMenuController.getMenuItems);

// POST /api/admin/menu - Thêm món ăn mới (Manager/Admin)
router.post("/", requireAuth, requireManagerOrAdmin, adminMenuController.createMenuItem);

// PUT /api/admin/menu/:code - Cập nhật thông tin món ăn (Manager/Admin)
router.put("/:code", requireAuth, requireManagerOrAdmin, adminMenuController.updateMenuItem);

// PATCH /api/admin/menu/:code/status - Cập nhật trạng thái món ăn
router.patch("/:code/status", requireAuth, requireManagerOrAdmin, adminMenuController.updateMenuItemStatus);

// DELETE /api/admin/menu/:code - Xóa mềm món ăn
router.delete("/:code", requireAuth, requireManagerOrAdmin, adminMenuController.deleteMenuItem);

// PATCH /api/admin/menu/bulk/stop - Ngừng bán hàng loạt món ăn
router.patch("/bulk/stop", requireAuth, requireManagerOrAdmin, adminMenuController.bulkStopMenuItems);

// PATCH /api/admin/menu/bulk/delete - Xóa hàng loạt món ăn
router.patch("/bulk/delete", requireAuth, requireManagerOrAdmin, adminMenuController.bulkDeleteMenuItems);

module.exports = router;
