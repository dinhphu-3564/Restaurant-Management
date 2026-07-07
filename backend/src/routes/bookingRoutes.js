const express = require("express");
const db = require("../config/db");
const { getIO } = require("../config/socket");
const {
  requireAuth,
  requireBackOffice,
  requireManagerOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

const ALLOWED_STATUSES = ["pending", "confirmed", "serving", "completed", "cancelled"];

const toJsonString = (value) => {
  if (!value) return null;

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const parseJson = (value, fallback = []) => {
  if (!value) return fallback;

  try {
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapBooking = (row) => ({
  id: row.id,
  bookingCode: row.booking_code,

  userId: row.user_id,

  source: row.source,
  type: row.type,

  customerName: row.customer_name,
  name: row.customer_name,
  phone: row.phone,
  email: row.email,

  date: row.booking_date,
  time: row.booking_time,
  guests: row.guests,

  selectedArea: row.selected_area,
  selectedAreaTitle: row.selected_area_title,
  selectedTable: row.selected_table,

  note: row.note,

  cartItems: parseJson(row.cart_items, []),
  subtotal: Number(row.subtotal || 0),
  total: Number(row.total || 0),
  totalQty: Number(row.total_qty || 0),

  paymentMethod: row.payment_method || null,
  paymentStatus: row.payment_status || "unpaid",
  paidAt: row.paid_at || null,

  couponCode: row.coupon_code || null,
  discountAmount: Number(row.discount_amount || 0),

  status: row.status,

  createdBy: row.created_by,
  assignedBy: row.assigned_by,
  assignedAt: row.assigned_at,

  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

//hàm tránh đặt trùng bàn
const hasTableConflict = async ({
  date,
  selectedTable,
  excludeBookingId = null,
  conn = db,
}) => {
  if (!date || !selectedTable) return false;

  const params = [date, selectedTable];
  let excludeSql = "";

  if (excludeBookingId) {
    excludeSql = "AND id != ?";
    params.push(excludeBookingId);
  }

  const [rows] = await conn.query(
    `
    SELECT id
    FROM bookings
    WHERE deleted_at IS NULL
      AND booking_date = ?
      AND selected_table = ?
      AND status IN ('pending', 'confirmed', 'serving')
      ${excludeSql}
    LIMIT 1
    FOR UPDATE
    `,
    params,
  );

  return rows.length > 0;
};

//hàm kiểm tra sức chứa bàn
const validateTableCapacity = async ({ selectedTable, guests, date, conn = db }) => {
  if (!selectedTable) return null;

  const guestCount = Number(guests || 0);

  if (!guestCount || guestCount <= 0) {
    const error = new Error("Số khách không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await conn.query(
    `
    SELECT
      t.id,
      t.table_code,
      t.seats,
      t.status,
      t.area_id,
      a.name AS area_name
    FROM restaurant_tables t
    LEFT JOIN areas a ON a.id = t.area_id
    WHERE t.table_code = ?
      AND t.deleted_at IS NULL
    LIMIT 1
    FOR UPDATE
    `,
    [selectedTable],
  );

  if (rows.length === 0) {
    const error = new Error("Bàn không tồn tại hoặc đã bị xóa.");
    error.statusCode = 400;
    throw error;
  }

  const table = rows[0];

  if (["maintenance", "disabled"].includes(table.status)) {
    const error = new Error(
      `Bàn ${table.table_code} hiện đang bảo trì hoặc vô hiệu hóa. Vui lòng chọn bàn khác.`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (date) {
    const today = new Date().toLocaleDateString('en-CA'); // format: YYYY-MM-DD
    const isToday = date === today;
    if (isToday && table.status === "serving") {
      const error = new Error(
        `Bàn ${table.table_code} hiện đang có khách. Vui lòng chọn bàn khác.`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (guestCount > Number(table.seats || 0)) {
    const error = new Error(
      `Bàn ${table.table_code} chỉ chứa tối đa ${table.seats} người. Vui lòng chọn bàn khác phù hợp hơn.`,
    );
    error.statusCode = 400;
    throw error;
  }

  return table;
};
// POST /api/bookings
// Người dùng tạo đặt bàn
router.post("/", requireAuth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const customerName = String(
      req.body.customerName || req.body.name || "",
    ).trim();

    const phone = String(req.body.phone || "").trim();
    const email = String(req.body.email || req.user.email || "").trim();

    const date = String(req.body.date || "").trim();
    const time = String(req.body.time || "").trim();
    const guests = Number(req.body.guests || req.body.people || 1);
    const selectedTable = String(req.body.selectedTable || "").trim();

    if (!customerName || !phone || !date || !time || !guests) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập đầy đủ tên, số điện thoại, ngày, giờ và số khách.",
      });
    }

    if (selectedTable) {
      await validateTableCapacity({
        selectedTable,
        guests,
        date,
        conn,
      });

      const isConflict = await hasTableConflict({
        date,
        selectedTable,
        conn,
      });

      if (isConflict) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
        });
      }
    }

    const [result] = await conn.query(
      `
      INSERT INTO bookings (
        user_id,
        source,
        type,
        customer_name,
        phone,
        email,
        booking_date,
        booking_time,
        guests,
        selected_area,
        selected_area_title,
        selected_table,
        note,
        cart_items,
        subtotal,
        total,
        total_qty,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'user')
      `,
      [
        req.user.id,
        req.body.source || "booking_page",
        req.body.type || "table_only",

        customerName,
        phone,
        email || null,

        date,
        time,
        guests,

        req.body.selectedArea || null,
        req.body.selectedAreaTitle || "Nhà hàng sắp xếp",
        selectedTable || null,

        req.body.note || null,

        toJsonString(req.body.cartItems || []),
        Number(req.body.subtotal || 0),
        Number(req.body.total || 0),
        Number(req.body.totalQty || 0),
      ],
    );

    const bookingCode = `DB${String(result.insertId).padStart(5, "0")}`;

    await conn.query(
      `
      UPDATE bookings
      SET booking_code = ?
      WHERE id = ?
      `,
      [bookingCode, result.insertId],
    );

    const [rows] = await conn.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    await conn.commit();
    try {
      getIO().emit("table_updated", { source: "booking_created" });
    } catch (err) {
      console.error("Emit error:", err);
    }
    res.status(201).json({
      success: true,
      message: "Đặt bàn thành công.",
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    await conn.rollback();
    console.error("Lỗi tạo đặt bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Lỗi server khi tạo đặt bàn.",
      error: error.message,
    });
  } finally {
    conn.release();
  }
});

// GET /api/bookings/me
// Người dùng lấy lịch sử đặt bàn của mình
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE user_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
      `,
      [req.user.id],
    );

    res.json({
      success: true,
      bookings: rows.map(mapBooking),
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử đặt bàn:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử đặt bàn.",
      error: error.message,
    });
  }
});

// GET /api/bookings/me/:id
// Người dùng lấy chi tiết đặt bàn của mình
router.get("/me/:id", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
        AND user_id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [req.params.id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt bàn.",
      });
    }

    res.json({
      success: true,
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết đặt bàn:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết đặt bàn.",
      error: error.message,
    });
  }
});

// GET /api/bookings/availability?date=YYYY-MM-DD
// Lấy các bàn đã được giữ/đã đặt theo ngày để trang người dùng khóa bàn
router.get("/availability", async (req, res) => {
  try {
    const date = String(req.query.date || "").trim();

    if (!date) {
      return res.json({
        success: true,
        bookings: [],
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        booking_code,
        booking_date,
        booking_time,
        selected_area,
        selected_area_title,
        selected_table,
        status
      FROM bookings
      WHERE deleted_at IS NULL
        AND booking_date = ?
        AND selected_table IS NOT NULL
        AND selected_table != ''
        AND status IN ('pending', 'confirmed')
      ORDER BY booking_time ASC, id ASC
      `,
      [date],
    );

    const bookings = rows.map((row) => ({
      id: row.id,
      bookingCode: row.booking_code,
      date: row.booking_date,
      time: row.booking_time,
      selectedArea: row.selected_area,
      selectedAreaTitle: row.selected_area_title,
      selectedTable: row.selected_table,
      status: row.status,
    }));

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch bàn đã đặt:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch bàn đã đặt.",
      error: error.message,
    });
  }
});
// Admin / quản lý / nhân viên lấy toàn bộ đặt bàn
router.get("/admin", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const status = String(req.query.status || "all").trim();
    const search = String(req.query.search || "")
      .trim()
      .toLowerCase();
    const date = String(req.query.date || "").trim();

    const where = ["deleted_at IS NULL"];
    const params = [];

    if (status !== "all") {
      where.push("status = ?");
      params.push(status);
    }

    if (date) {
      where.push("booking_date = ?");
      params.push(date);
    }

    if (search) {
      where.push(`
        (
          LOWER(customer_name) LIKE ?
          OR phone LIKE ?
          OR LOWER(email) LIKE ?
          OR LOWER(booking_code) LIKE ?
        )
      `);

      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE ${where.join(" AND ")}
      ORDER BY created_at DESC, id DESC
      `,
      params,
    );

    res.json({
      success: true,
      bookings: rows.map(mapBooking),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách đặt bàn admin:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đặt bàn.",
      error: error.message,
    });
  }
});

// POST /api/bookings/admin
// Admin tạo đặt bàn
router.post("/admin", requireAuth, requireBackOffice, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const customerName = String(req.body.customerName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const date = String(req.body.date || "").trim();
    const time = String(req.body.time || "").trim();
    const selectedTable = String(req.body.selectedTable || "").trim();
    const guests = Number(req.body.guests || 1);

    if (!customerName || !phone || !date || !time) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đủ tên, số điện thoại, ngày và giờ.",
      });
    }

    const status = ALLOWED_STATUSES.includes(req.body.status)
      ? req.body.status
      : "pending";

    if (selectedTable && ["pending", "confirmed"].includes(status)) {
      await validateTableCapacity({
        selectedTable,
        guests,
        date,
        conn,
      });

      const isConflict = await hasTableConflict({
        date,
        selectedTable,
        conn,
      });

      if (isConflict) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
        });
      }
    }

    const [result] = await conn.query(
      `
      INSERT INTO bookings (
        source,
        type,
        customer_name,
        phone,
        email,
        booking_date,
        booking_time,
        guests,
        selected_area,
        selected_area_title,
        selected_table,
        note,
        cart_items,
        subtotal,
        total,
        total_qty,
        status,
        created_by,
        assigned_by,
        assigned_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', ?, ?)
      `,
      [
        "admin_page",
        req.body.type || "table_only",
        customerName,
        phone,
        req.body.email || null,
        date,
        time,
        guests,
        req.body.selectedArea || null,
        req.body.selectedAreaTitle || null,
        selectedTable || null,
        req.body.note || null,
        toJsonString(req.body.cartItems || []),
        Number(req.body.subtotal || 0),
        Number(req.body.total || 0),
        Number(req.body.totalQty || 0),
        status,
        req.user.name || "admin",
        selectedTable ? new Date() : null,
      ],
    );

    const bookingCode = `DB${String(result.insertId).padStart(5, "0")}`;

    await conn.query(
      `
      UPDATE bookings
      SET booking_code = ?
      WHERE id = ?
      `,
      [bookingCode, result.insertId],
    );

    const [rows] = await conn.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    await conn.commit();
    try {
      getIO().emit("table_updated", { source: "booking_admin_created" });
    } catch (err) {
      console.error("Emit error:", err);
    }
    res.status(201).json({
      success: true,
      message: "Tạo đặt bàn thành công.",
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    await conn.rollback();
    console.error("Lỗi admin tạo đặt bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Lỗi server khi tạo đặt bàn.",
      error: error.message,
    });
  } finally {
    conn.release();
  }
});

// PATCH /api/bookings/admin/:id
// Admin sửa đặt bàn
router.patch("/admin/:id", requireAuth, requireBackOffice, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const bookingId = Number(req.params.id);

    const [currentRows] = await conn.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
      FOR UPDATE
      `,
      [bookingId],
    );

    if (currentRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt bàn.",
      });
    }

    const current = currentRows[0];

    const status = ALLOWED_STATUSES.includes(req.body.status)
      ? req.body.status
      : current.status;

    //Chặn trùng bàn khi admin sửa đặt bàn
    const nextDate = req.body.date || current.booking_date;
    const nextTable = req.body.selectedTable ?? current.selected_table;
    const nextGuests = Number(req.body.guests ?? current.guests ?? 1);

    if (nextTable && ["pending", "confirmed"].includes(status)) {
      await validateTableCapacity({
        selectedTable: nextTable,
        guests: nextGuests,
        date: nextDate,
        conn,
      });

      const isConflict = await hasTableConflict({
        date: nextDate,
        selectedTable: nextTable,
        excludeBookingId: bookingId,
        conn,
      });

      if (isConflict) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
        });
      }
    }

    await conn.query(
      `
      UPDATE bookings
      SET
        status = ?,
        booking_date = ?,
        booking_time = ?,
        guests = ?,
        selected_area = ?,
        selected_area_title = ?,
        selected_table = ?,
        note = ?,
        assigned_by = ?,
        assigned_at = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        status,
        req.body.date || current.booking_date,
        req.body.time || current.booking_time,
        nextGuests,
        req.body.selectedArea ?? current.selected_area,
        req.body.selectedAreaTitle ?? current.selected_area_title,
        req.body.selectedTable ?? current.selected_table,
        req.body.note ?? current.note,
        req.body.selectedTable ? req.user.name || "admin" : current.assigned_by,
        req.body.selectedTable ? new Date() : current.assigned_at,
        bookingId,
      ],
    );

    const [rows] = await conn.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
      `,
      [bookingId],
    );

    await conn.commit();
    try {
      getIO().emit("table_updated", { source: "booking_admin_updated" });
    } catch (err) {
      console.error("Emit error:", err);
    }
    res.json({
      success: true,
      message: "Cập nhật đặt bàn thành công.",
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    await conn.rollback();
    console.error("Lỗi cập nhật đặt bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Lỗi server khi cập nhật đặt bàn.",
      error: error.message,
    });
  } finally {
    conn.release();
  }
});

// PATCH /api/bookings/admin/:id/status
// Admin cập nhật trạng thái
router.patch(
  "/admin/:id/status",
  requireAuth,
  requireBackOffice,
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const bookingId = Number(req.params.id);
      const status = String(req.body.status || "").trim();

      if (!ALLOWED_STATUSES.includes(status)) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: "Trạng thái đặt bàn không hợp lệ.",
        });
      }

      const [currentRows] = await conn.query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
        `,
        [bookingId],
      );

      if (currentRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đặt bàn.",
        });
      }

      const current = currentRows[0];

      if (current.selected_table && ["pending", "confirmed"].includes(status)) {
        await validateTableCapacity({
          selectedTable: current.selected_table,
          guests: current.guests,
          date: current.booking_date,
          conn,
        });

        const isConflict = await hasTableConflict({
          date: current.booking_date,
          selectedTable: current.selected_table,
          excludeBookingId: bookingId,
          conn,
        });

        if (isConflict) {
          await conn.rollback();
          return res.status(409).json({
            success: false,
            message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
          });
        }
      }

      await conn.query(
        `
        UPDATE bookings
        SET status = ?, updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [status, bookingId],
      );

      const [rows] = await conn.query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
        LIMIT 1
        `,
        [bookingId],
      );

      await conn.commit();
      try {
        getIO().emit("table_updated", { source: "booking_status_updated" });
      } catch (err) {
        console.error("Emit error:", err);
      }
      res.json({
        success: true,
        message: "Cập nhật trạng thái đặt bàn thành công.",
        booking: mapBooking(rows[0]),
      });
    } catch (error) {
      await conn.rollback();
      console.error("Lỗi cập nhật trạng thái đặt bàn:", error);

      res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode
          ? error.message
          : "Lỗi server khi cập nhật trạng thái đặt bàn.",
        error: error.message,
      });
    } finally {
      conn.release();
    }
  },
);

// DELETE /api/bookings/admin/:id
// Admin xóa mềm đặt bàn
router.delete(
  "/admin/:id",
  requireAuth,
  requireManagerOrAdmin,
  async (req, res) => {
    try {
      const bookingId = Number(req.params.id);

      await db.query(
        `
      UPDATE bookings
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
        [bookingId],
      );

      res.json({
        success: true,
        message: "Xóa đặt bàn thành công.",
        bookingId,
      });
    } catch (error) {
      console.error("Lỗi xóa đặt bàn:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa đặt bàn.",
        error: error.message,
      });
    }
  },
);

// PATCH /api/bookings/admin/:id/items
// Cập nhật danh sách món ăn đã đặt của đặt bàn
router.patch(
  "/admin/:id/items",
  requireAuth,
  requireBackOffice,
  async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const cartItems = req.body.cartItems || [];

      let totalQty = 0;
      let subtotal = 0;
      cartItems.forEach((item) => {
        totalQty += Number(item.qty || 0);
        subtotal += Number(item.price || 0) * Number(item.qty || 0);
      });
      const total = subtotal;

      await db.query(
        `
        UPDATE bookings
        SET
          cart_items = ?,
          subtotal = ?,
          total = ?,
          total_qty = ?,
          updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [JSON.stringify(cartItems), subtotal, total, totalQty, bookingId],
      );

      const [rows] = await db.query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [bookingId],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đặt bàn để cập nhật món ăn.",
        });
      }

      res.json({
        success: true,
        booking: mapBooking(rows[0]),
      });
    } catch (error) {
      console.error("Lỗi cập nhật món ăn đặt bàn:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật món ăn.",
        error: error.message,
      });
    }
  },
);

// PATCH /api/bookings/admin/:id/payment
// Xác nhận thanh toán đặt bàn
router.patch(
  "/admin/:id/payment",
  requireAuth,
  requireBackOffice,
  async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const {
        paymentMethod,
        paymentStatus,
        couponCode,
        discountAmount,
        total,
      } = req.body;

      await db.query(
        `
        UPDATE bookings
        SET
          payment_method = ?,
          payment_status = ?,
          paid_at = ?,
          coupon_code = ?,
          discount_amount = ?,
          total = ?
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [
          paymentMethod || null,
          paymentStatus || "unpaid",
          paymentStatus === "paid" ? new Date() : null,
          couponCode || null,
          Number(discountAmount || 0),
          Number(total || 0),
          bookingId,
        ],
      );

      const [rows] = await db.query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [bookingId],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đặt bàn để cập nhật thanh toán.",
        });
      }

      res.json({
        success: true,
        booking: mapBooking(rows[0]),
      });
    } catch (error) {
      console.error("Lỗi xác nhận thanh toán:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xác nhận thanh toán.",
        error: error.message,
      });
    }
  },
);

module.exports = router;
