const express = require("express");
const db = require("../config/db");

const router = express.Router();

const DEFAULT_IMAGE = "/src/assets/images/Menu/default-food.png";

function parseImages(value) {
  if (!value) return [];

  try {
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function mapPublicMenuItem(row) {
  const images = parseImages(row.images);
  const image = row.image || images[0] || DEFAULT_IMAGE;

  return {
    id: row.code,
    dbId: row.id,
    name: row.name,
    image,
    images: images.length > 0 ? images : [image],
    category:
      row.category_name || row.sub_category || row.parent_category || "",
    parentCategory: row.parent_category || row.category_name || "",
    subCategory: row.sub_category || "",
    price: formatPrice(row.price),
    priceNumber: Number(row.price || 0),
    type: row.type || "Món chính",
    status: row.status,
    badge: row.badge || "",
    sold: Number(row.sold || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    shortDescription: row.short_description || "",
    description: row.description || row.short_description || "",
    ingredients: row.ingredients || "",
    flavor: row.flavor || "",
    portion: row.portion || "2 - 3 người",
    cooking: row.cooking || "Nóng hổi",
    time: row.time || "15 - 20 phút",
  };
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        menu_items.*,
        categories.name AS category_name
      FROM menu_items
      LEFT JOIN categories ON menu_items.category_id = categories.id
      WHERE menu_items.status IN ('selling', 'paused')
      ORDER BY menu_items.id DESC
    `);

    res.json({
      success: true,
      data: rows.map(mapPublicMenuItem),
    });
  } catch (error) {
    console.error("Lỗi lấy menu người dùng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy menu người dùng",
      error: error.message,
    });
  }
});
// API lấy đánh giá của món
router.get("/:code/reviews", async (req, res) => {
  try {
    const { code } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        id,
        menu_item_code,
        order_id,
        user_name,
        rating,
        comment,
        created_at
      FROM food_reviews
      WHERE menu_item_code = ?
      ORDER BY created_at DESC
      `,
      [code],
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi lấy đánh giá món:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy đánh giá món",
      error: error.message,
    });
  }
});

//API gửi đánh giá món
router.post("/:code/reviews", async (req, res) => {
  try {
    const { code } = req.params;
    const { orderId, userEmail, userName, rating, comment } = req.body;

    const numericRating = Number(rating);

    if (!orderId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đơn hàng hoặc người dùng",
      });
    }

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Số sao đánh giá không hợp lệ",
      });
    }

    const [menuRows] = await db.query(
      "SELECT id, code FROM menu_items WHERE code = ? LIMIT 1",
      [code],
    );

    if (menuRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    const menuItem = menuRows[0];

    await db.query(
      `
      INSERT INTO food_reviews (
        menu_item_id,
        menu_item_code,
        order_id,
        user_email,
        user_name,
        rating,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        menuItem.id,
        menuItem.code,
        orderId,
        userEmail,
        userName || "Khách hàng",
        numericRating,
        comment || "",
      ],
    );

    const [statsRows] = await db.query(
      `
      SELECT 
        ROUND(AVG(rating), 1) AS avg_rating,
        COUNT(*) AS total_reviews
      FROM food_reviews
      WHERE menu_item_id = ?
      `,
      [menuItem.id],
    );

    const avgRating = Number(statsRows[0].avg_rating || 0);
    const totalReviews = Number(statsRows[0].total_reviews || 0);

    await db.query(
      `
      UPDATE menu_items
      SET rating = ?, reviews = ?
      WHERE id = ?
      `,
      [avgRating, totalReviews, menuItem.id],
    );

    res.status(201).json({
      success: true,
      message: "Đánh giá món ăn thành công",
      data: {
        rating: avgRating,
        reviews: totalReviews,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá món này trong đơn hàng này rồi",
      });
    }

    console.error("Lỗi gửi đánh giá món:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi đánh giá món",
      error: error.message,
    });
  }
});

module.exports = router;
