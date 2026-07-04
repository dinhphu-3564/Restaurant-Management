const express = require("express");
const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  requireAuth,
  requireBackOffice,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Configure storage for space images
const uploadDir = path.join(__dirname, "../../uploads/spaces");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const spaceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `space-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const uploadSpaceImages = multer({
  storage: spaceStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ tải lên các tệp định dạng JPG, JPEG, PNG, WEBP."));
    }
  },
});

// Helper to format output space data
function formatSpaces(spacesRows, imagesRows) {
  return spacesRows.map((space) => {
    const spaceImages = imagesRows
      .filter((img) => img.space_id === space.id)
      .map((img) => ({
        id: String(img.id),
        url: img.url,
        title: img.title || "",
        description: img.description || "",
        isCover: img.is_cover === 1,
      }));

    return {
      key: space.space_key,
      label: space.label,
      description: space.description || "",
      detailDescription: space.detail_description || "",
      capacity: space.capacity || 0,
      order: space.display_order || 1,
      status: space.status,
      images: spaceImages,
    };
  });
}

// 1. GET /api/spaces/active (Public)
router.get("/active", async (req, res) => {
  try {
    const [spaces] = await db.query(
      "SELECT * FROM restaurant_spaces WHERE status = 'active' ORDER BY display_order ASC"
    );
    if (spaces.length === 0) {
      return res.json([]);
    }
    const [images] = await db.query(
      "SELECT * FROM space_images WHERE space_id IN (?)",
      [spaces.map((s) => s.id)]
    );
    const formatted = formatSpaces(spaces, images);
    res.json(formatted);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách không gian:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2. GET /api/admin/spaces (Admin only)
router.get("/admin-list", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const [spaces] = await db.query("SELECT * FROM restaurant_spaces ORDER BY display_order ASC");
    if (spaces.length === 0) {
      return res.json([]);
    }
    const [images] = await db.query("SELECT * FROM space_images");
    const formatted = formatSpaces(spaces, images);
    res.json(formatted);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách không gian quản trị:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3. POST /api/admin/spaces (Admin only) - Create blank space
router.post("/", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { key, label, description, detailDescription, capacity, order, status } = req.body;
    const randomKey = key || "space_" + Math.random().toString(36).substring(2, 9);
    
    await db.query(
      `INSERT INTO restaurant_spaces (space_key, label, description, detail_description, capacity, display_order, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        randomKey,
        label || "",
        description || "",
        detailDescription || "",
        Number(capacity) || 0,
        Number(order) || 1,
        status || "active",
      ]
    );

    // Auto-create a corresponding area in areas table
    try {
      if (label && label.trim()) {
        await db.query(
          `INSERT INTO areas (name, description, status)
           VALUES (?, ?, 'active')`,
          [label.trim(), description || ""]
        );
      }
    } catch (areaErr) {
      console.warn("Không thể tự động tạo khu vực cho không gian mới:", areaErr.message);
    }

    res.json({
      success: true,
      message: "Tạo không gian mới thành công",
      space: {
        key: randomKey,
        label: label || "",
        description: description || "",
        detailDescription: detailDescription || "",
        capacity: Number(capacity) || 0,
        order: Number(order) || 1,
        status: status || "active",
        images: [],
      },
    });
  } catch (error) {
    console.error("Lỗi tạo không gian mới:", error);
    res.status(500).json({ success: false, message: "Không thể tạo không gian mới" });
  }
});

// 4. PUT /api/admin/spaces/:key (Admin only) - Update space & its images array
router.put("/:key", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { key } = req.params;
    const { label, description, detailDescription, capacity, order, status, images } = req.body;

    // Get the internal ID of the space
    const [spaces] = await db.query("SELECT id FROM restaurant_spaces WHERE space_key = ?", [key]);
    if (spaces.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy không gian" });
    }
    const spaceId = spaces[0].id;

    // Update space metadata
    await db.query(
      `UPDATE restaurant_spaces 
       SET label = ?, description = ?, detail_description = ?, capacity = ?, display_order = ?, status = ?
       WHERE id = ?`,
      [
        label,
        description || "",
        detailDescription || "",
        Number(capacity) || 0,
        Number(order) || 1,
        status,
        spaceId,
      ]
    );

    // Delete existing images for this space
    await db.query("DELETE FROM space_images WHERE space_id = ?", [spaceId]);

    // Insert new images
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        await db.query(
          `INSERT INTO space_images (space_id, url, title, description, is_cover) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            spaceId,
            img.url,
            img.title || "",
            img.description || "",
            img.isCover ? 1 : 0,
          ]
        );
      }
    }

    res.json({
      success: true,
      message: "Cập nhật không gian thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật không gian:", error);
    res.status(500).json({ success: false, message: "Không thể lưu cập nhật không gian" });
  }
});

// 5. DELETE /api/admin/spaces/:key (Admin only)
router.delete("/:key", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { key } = req.params;
    const [result] = await db.query("DELETE FROM restaurant_spaces WHERE space_key = ?", [key]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy không gian để xóa" });
    }
    res.json({ success: true, message: "Xóa không gian thành công" });
  } catch (error) {
    console.error("Lỗi xóa không gian:", error);
    res.status(500).json({ success: false, message: "Không thể xóa không gian này" });
  }
});

// 6. POST /api/admin/spaces/upload (Admin only) - Upload single image file
router.post("/upload", requireAuth, requireBackOffice, uploadSpaceImages.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh để tải lên" });
    }
    const publicUrl = `/uploads/spaces/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error("Lỗi upload ảnh không gian:", error);
    res.status(500).json({ success: false, message: "Không thể tải lên hình ảnh" });
  }
});

module.exports = router;
