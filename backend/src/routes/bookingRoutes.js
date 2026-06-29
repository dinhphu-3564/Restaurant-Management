const express = require("express");
const db = require("../config/db");
const {
  requireAuth,
  requireBackOffice,
} = require("../middleware/authMiddleware");

const router = express.Router();

const ALLOWED_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

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
}) => {
  if (!date || !selectedTable) return false;

  const params = [date, selectedTable];
  let excludeSql = "";

  if (excludeBookingId) {
    excludeSql = "AND id != ?";
    params.push(excludeBookingId);
  }

  const [rows] = await db.query(
    `
    SELECT id
    FROM bookings
    WHERE deleted_at IS NULL
      AND booking_date = ?
      AND selected_table = ?
      AND status IN ('pending', 'confirmed')
      ${excludeSql}
    LIMIT 1
    `,
    params,
  );

  return rows.length > 0;
};

//hàm kiểm tra sức chứa bàn
const validateTableCapacity = async ({ selectedTable, guests }) => {
  if (!selectedTable) return null;

  const guestCount = Number(guests || 0);

  if (!guestCount || guestCount <= 0) {
    const error = new Error("Số khách không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await db.query(
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
    `,
    [selectedTable],
  );

  if (rows.length === 0) {
    const error = new Error("Bàn không tồn tại hoặc đã bị xóa.");
    error.statusCode = 400;
    throw error;
  }

  const table = rows[0];

  if (["maintenance", "disabled", "serving"].includes(table.status)) {
    const error = new Error(
      `Bàn ${table.table_code} hiện không thể đặt. Vui lòng chọn bàn khác.`,
    );
    error.statusCode = 400;
    throw error;
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
  try {
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
      });

      const isConflict = await hasTableConflict({
        date,
        selectedTable,
      });

      if (isConflict) {
        return res.status(409).json({
          success: false,
          message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
        });
      }
    }

    const [result] = await db.query(
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

    await db.query(
      `
      UPDATE bookings
      SET booking_code = ?
      WHERE id = ?
      `,
      [bookingCode, result.insertId],
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Đặt bàn thành công.",
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi tạo đặt bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Lỗi server khi tạo đặt bàn.",
      error: error.message,
    });
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
  try {
    const customerName = String(req.body.customerName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const date = String(req.body.date || "").trim();
    const time = String(req.body.time || "").trim();
    const selectedTable = String(req.body.selectedTable || "").trim();
    const guests = Number(req.body.guests || 1);

    if (!customerName || !phone || !date || !time) {
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
      });

      const isConflict = await hasTableConflict({
        date,
        selectedTable,
      });

      if (isConflict) {
        return res.status(409).json({
          success: false,
          message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
        });
      }
    }

    const [result] = await db.query(
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

    await db.query(
      `
      UPDATE bookings
      SET booking_code = ?
      WHERE id = ?
      `,
      [bookingCode, result.insertId],
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Tạo đặt bàn thành công.",
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi admin tạo đặt bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Lỗi server khi tạo đặt bàn.",
      error: error.message,
    });
  }
});

// PATCH /api/bookings/admin/:id
// Admin sửa đặt bàn
router.patch("/admin/:id", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    const [currentRows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [bookingId],
    );

    if (currentRows.length === 0) {
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
      });

      const isConflict = await hasTableConflict({
        date: nextDate,
        selectedTable: nextTable,
        excludeBookingId: bookingId,
      });

      if (isConflict) {
        return res.status(409).json({
          success: false,
          message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
        });
      }
    }

    await db.query(
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

    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
      `,
      [bookingId],
    );

    res.json({
      success: true,
      message: "Cập nhật đặt bàn thành công.",
      booking: mapBooking(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi cập nhật đặt bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Lỗi server khi cập nhật đặt bàn.",
      error: error.message,
    });
  }
});

// PATCH /api/bookings/admin/:id/status
// Admin cập nhật trạng thái
router.patch(
  "/admin/:id/status",
  requireAuth,
  requireBackOffice,
  async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const status = String(req.body.status || "").trim();

      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái đặt bàn không hợp lệ.",
        });
      }

      const [currentRows] = await db.query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [bookingId],
      );

      if (currentRows.length === 0) {
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
        });

        const isConflict = await hasTableConflict({
          date: current.booking_date,
          selectedTable: current.selected_table,
          excludeBookingId: bookingId,
        });

        if (isConflict) {
          return res.status(409).json({
            success: false,
            message: "Bàn này đã có lịch đặt trong ngày đã chọn.",
          });
        }
      }

      await db.query(
        `
        UPDATE bookings
        SET status = ?, updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [status, bookingId],
      );

      const [rows] = await db.query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
        LIMIT 1
        `,
        [bookingId],
      );

      res.json({
        success: true,
        message: "Cập nhật trạng thái đặt bàn thành công.",
        booking: mapBooking(rows[0]),
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đặt bàn:", error);

      res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode
          ? error.message
          : "Lỗi server khi cập nhật trạng thái đặt bàn.",
        error: error.message,
      });
    }
  },
);

// DELETE /api/bookings/admin/:id
// Admin xóa mềm đặt bàn
router.delete(
  "/admin/:id",
  requireAuth,
  requireBackOffice,
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

module.exports = router;
