const db = require("../config/db");

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

function mapMenuItem(row) {
  const images = parseImages(row.images);
  return {
    id: row.code,
    dbId: row.id,
    name: row.name,
    image: row.image || images[0] || DEFAULT_IMAGE,
    images: images.length > 0 ? images : [row.image || DEFAULT_IMAGE],
    category:
      row.category_name || row.sub_category || row.parent_category || "",
    parentCategory: row.parent_category || row.category_name || "",
    subCategory: row.sub_category || "",
    price: Number(row.price || 0),
    type: row.type || "Món chính",
    status: row.status || "selling",
    badge: row.badge || "",
    sold: Number(row.sold || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    shortDescription: row.short_description || "",
    description: row.description || "",
    ingredients: row.ingredients || "",
    flavor: row.flavor || "",
    portion: row.portion || "",
    cooking: row.cooking || "",
    time: row.time || "",
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toLocaleDateString("vi-VN")
      : "",
  };
}

async function findOrCreateCategory(categoryName) {
  if (!categoryName) return null;
  const [rows] = await db.query(
    "SELECT id FROM categories WHERE name = ? LIMIT 1",
    [categoryName],
  );
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await db.query(
    "INSERT INTO categories (name, status) VALUES (?, 'active')",
    [categoryName],
  );
  return result.insertId;
}

async function createNextCode() {
  const [rows] = await db.query(`
    SELECT code
    FROM menu_items
    WHERE code LIKE 'DE%'
    ORDER BY CAST(REPLACE(code, 'DE', '') AS UNSIGNED) DESC
    LIMIT 1
  `);
  if (rows.length === 0 || !rows[0].code) {
    return "DE001";
  }
  const currentNumber = Number(String(rows[0].code).replace("DE", ""));
  return `DE${String(currentNumber + 1).padStart(3, "0")}`;
}

exports.uploadImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Chưa có ảnh được upload",
      });
    }
    const imageUrls = req.files.map(
      (file) => `http://localhost:5001/uploads/menu/${file.filename}`,
    );
    res.json({
      success: true,
      images: imageUrls,
      image: imageUrls[0],
    });
  } catch (error) {
    console.error("Lỗi upload ảnh món ăn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi upload ảnh món ăn",
      error: error.message,
    });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        menu_items.*,
        categories.name AS category_name
      FROM menu_items
      LEFT JOIN categories ON menu_items.category_id = categories.id
      WHERE menu_items.status != 'deleted'
      ORDER BY menu_items.id DESC
    `);
    res.json({
      success: true,
      data: rows.map(mapMenuItem),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách món:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách món",
      error: error.message,
    });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const body = req.body;
    const realCategory =
      body.category === "Món khác" && body.subCategory
        ? body.subCategory
        : body.category;

    const categoryId = await findOrCreateCategory(realCategory);
    const code = await createNextCode();
    const image = body.image || body.images?.[0] || DEFAULT_IMAGE;
    const images = JSON.stringify(body.images?.length ? body.images : [image]);

    await db.query(
      `
      INSERT INTO menu_items (
        code,
        category_id,
        name,
        description,
        price,
        image,
        images,
        type,
        status,
        badge,
        sold,
        rating,
        reviews,
        short_description,
        ingredients,
        flavor,
        portion,
        cooking,
        time,
        parent_category,
        sub_category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code,
        categoryId,
        body.name || "",
        body.description || "",
        Number(body.price || 0),
        image,
        images,
        body.type || "Món chính",
        body.status || "selling",
        body.badge || "",
        body.shortDescription || "",
        body.ingredients || "",
        body.flavor || "",
        body.portion || "",
        body.cooking || "",
        body.time || "",
        body.category || realCategory,
        body.subCategory || "",
      ],
    );

    const [rows] = await db.query(
      `
      SELECT menu_items.*, categories.name AS category_name
      FROM menu_items
      LEFT JOIN categories ON menu_items.category_id = categories.id
      WHERE menu_items.code = ?
      LIMIT 1
      `,
      [code],
    );

    res.status(201).json({
      success: true,
      data: mapMenuItem(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi thêm món:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm món",
      error: error.message,
    });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { code } = req.params;
    const body = req.body;
    const realCategory =
      body.category === "Món khác" && body.subCategory
        ? body.subCategory
        : body.category;

    const categoryId = await findOrCreateCategory(realCategory);
    const image = body.image || body.images?.[0] || DEFAULT_IMAGE;
    const images = JSON.stringify(body.images?.length ? body.images : [image]);

    await db.query(
      `
      UPDATE menu_items
      SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image = ?,
        images = ?,
        type = ?,
        status = ?,
        badge = ?,
        short_description = ?,
        ingredients = ?,
        flavor = ?,
        portion = ?,
        cooking = ?,
        time = ?,
        parent_category = ?,
        sub_category = ?
      WHERE code = ?
      `,
      [
        categoryId,
        body.name || "",
        body.description || "",
        Number(body.price || 0),
        image,
        images,
        body.type || "Món chính",
        body.status || "selling",
        body.badge || "",
        body.shortDescription || "",
        body.ingredients || "",
        body.flavor || "",
        body.portion || "",
        body.cooking || "",
        body.time || "",
        body.category || realCategory,
        body.subCategory || "",
        code,
      ],
    );

    const [rows] = await db.query(
      `
      SELECT menu_items.*, categories.name AS category_name
      FROM menu_items
      LEFT JOIN categories ON menu_items.category_id = categories.id
      WHERE menu_items.code = ?
      LIMIT 1
      `,
      [code],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    res.json({
      success: true,
      data: mapMenuItem(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi sửa món:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi sửa món",
      error: error.message,
    });
  }
};

exports.updateMenuItemStatus = async (req, res) => {
  try {
    const { code } = req.params;
    const { status } = req.body;
    await db.query("UPDATE menu_items SET status = ? WHERE code = ?", [
      status,
      code,
    ]);
    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    console.error("Lỗi đổi trạng thái:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi trạng thái",
      error: error.message,
    });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { code } = req.params;
    await db.query(
      "UPDATE menu_items SET status = 'deleted' WHERE code = ?",
      [code],
    );
    res.json({
      success: true,
      message: "Xóa món thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa món:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa món",
      error: error.message,
    });
  }
};

exports.bulkStopMenuItems = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách món không hợp lệ",
      });
    }
    await db.query(
      "UPDATE menu_items SET status = 'stopped' WHERE code IN (?)",
      [ids],
    );
    res.json({
      success: true,
      message: "Ngừng bán các món đã chọn thành công",
    });
  } catch (error) {
    console.error("Lỗi ngừng bán nhiều món:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi ngừng bán nhiều món",
      error: error.message,
    });
  }
};

exports.bulkDeleteMenuItems = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách món không hợp lệ",
      });
    }
    await db.query(
      "UPDATE menu_items SET status = 'deleted' WHERE code IN (?)",
      [ids],
    );
    res.json({
      success: true,
      message: "Xóa các món đã chọn thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa nhiều món:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa nhiều món",
      error: error.message,
    });
  }
};
