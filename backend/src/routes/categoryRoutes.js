const express = require("express");
const db = require("../config/db");
const {
  requireAuth,
  requireBackOffice,
} = require("../middleware/authMiddleware");

const router = express.Router();

// 1. Lấy danh sách danh mục (cho frontend và backend dùng)
router.get("/", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT * FROM categories ORDER BY parent_id IS NOT NULL, display_order ASC, id ASC",
    );

    // Build tree
    const parentMap = {};
    const rootCategories = [];

    categories.forEach((cat) => {
      cat.children = [];
      if (cat.parent_id) {
        if (!parentMap[cat.parent_id]) {
          parentMap[cat.parent_id] = [];
        }
        parentMap[cat.parent_id].push(cat);
      } else {
        rootCategories.push(cat);
      }
    });

    rootCategories.forEach((root) => {
      if (parentMap[root.id]) {
        root.children = parentMap[root.id];
      }
    });

    res.json({
      success: true,
      data: rootCategories,
      flatData: categories,
    });
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2. Thêm danh mục mới (Chỉ Admin/Manager)
router.post("/", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { name, description, status, parent_id, icon } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Tên danh mục là bắt buộc" });
    }

    const [result] = await db.query(
      "INSERT INTO categories (name, description, status, parent_id, icon) VALUES (?, ?, ?, ?, ?)",
      [
        name,
        description || "",
        status || "active",
        parent_id || null,
        icon || "Utensils",
      ],
    );

    res.json({
      success: true,
      message: "Thêm danh mục thành công",
      data: {
        id: result.insertId,
        name,
        description,
        status,
        parent_id,
        icon,
      },
    });
  } catch (error) {
    console.error("Lỗi thêm danh mục:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể thêm danh mục" });
  }
});

// 3. Sửa danh mục (Chỉ Admin/Manager)
router.put("/:id", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, parent_id, icon } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Tên danh mục là bắt buộc" });
    }

    await db.query(
      "UPDATE categories SET name = ?, description = ?, status = ?, parent_id = ?, icon = ? WHERE id = ?",
      [
        name,
        description || "",
        status || "active",
        parent_id || null,
        icon || "Utensils",
        id,
      ],
    );

    res.json({
      success: true,
      message: "Cập nhật danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể cập nhật danh mục" });
  }
});

// 4. Xóa danh mục (Chỉ Admin/Manager)
router.delete("/:id", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is used in menu_items
    const [items] = await db.query(
      "SELECT id FROM menu_items WHERE category_id = ?",
      [id],
    );
    if (items.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xoá danh mục đang chứa món ăn. Vui lòng chuyển các món sang danh mục khác trước.",
      });
    }

    // Check if category has children
    const [children] = await db.query(
      "SELECT id FROM categories WHERE parent_id = ?",
      [id],
    );
    if (children.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xoá danh mục cha đang chứa danh mục con.",
      });
    }

    await db.query("DELETE FROM categories WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Xoá danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({ success: false, message: "Không thể xoá danh mục" });
  }
});

// 5. Cập nhật thứ tự hiển thị
router.post("/reorder", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const { order } = req.body;
    // order is an array of { id, display_order }
    if (!order || !Array.isArray(order)) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu không hợp lệ" });
    }

    const promises = order.map((item) =>
      db.query("UPDATE categories SET display_order = ? WHERE id = ?", [
        item.display_order,
        item.id,
      ]),
    );
    await Promise.all(promises);

    res.json({
      success: true,
      message: "Cập nhật thứ tự thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật thứ tự:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể cập nhật thứ tự" });
  }
});

module.exports = router;
