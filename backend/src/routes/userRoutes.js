const express = require("express");
const db = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { createActivityLog } = require("../utils/activityLog");

const router = express.Router();

const safeNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const getUserGroup = ({ totalSpent, orderCount, bookingCount }) => {
  const totalTransactions = safeNumber(orderCount) + safeNumber(bookingCount);
  const spent = safeNumber(totalSpent);

  if (spent >= 15000000 || totalTransactions >= 20) {
    return "vip";
  }

  if (spent >= 3000000 || totalTransactions >= 5) {
    return "regular";
  }

  return "new";
};

const mapUser = (row) => {
  const orderCount = safeNumber(row.order_count);
  const bookingCount = safeNumber(row.booking_count);
  const orderTotal = safeNumber(row.order_total);
  const bookingTotal = safeNumber(row.booking_total);
  const totalSpent = orderTotal + bookingTotal;

  return {
    id: row.id,
    name: row.name || row.full_name,
    fullName: row.full_name || row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    avatar: row.avatar,
    role: row.role,
    status: row.status,
    emailVerified: Boolean(row.email_verified),
    authProvider: row.auth_provider,
    providerUid: row.provider_uid,
    orderCount,
    bookingCount,
    orderTotal,
    bookingTotal,
    totalSpent,
    group: getUserGroup({
      totalSpent,
      orderCount,
      bookingCount,
    }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getBookingStatsMap = async () => {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM bookings");
    const columnNames = columns.map((item) => item.Field);

    if (!columnNames.includes("email")) {
      return new Map();
    }

    const totalExpression = columnNames.includes("total")
      ? "COALESCE(SUM(total), 0)"
      : "0";

    const [rows] = await db.query(`
      SELECT
        LOWER(email) AS email_key,
        COUNT(*) AS booking_count,
        ${totalExpression} AS booking_total
      FROM bookings
      WHERE email IS NOT NULL AND email != ''
      GROUP BY LOWER(email)
    `);

    return new Map(rows.map((row) => [row.email_key, row]));
  } catch {
    return new Map();
  }
};

const getUserRows = async ({ search = "", status = "all" } = {}) => {
  const where = ["u.deleted_at IS NULL", "u.role = 'user'"];
  const params = [];

  if (status !== "all") {
    where.push("u.status = ?");
    params.push(status);
  }

  if (search) {
    where.push(`
      (
        LOWER(COALESCE(u.name, '')) LIKE ?
        OR LOWER(COALESCE(u.full_name, '')) LIKE ?
        OR LOWER(COALESCE(u.email, '')) LIKE ?
        OR COALESCE(u.phone, '') LIKE ?
      )
    `);

    const keyword = `%${search.toLowerCase()}%`;
    params.push(keyword, keyword, keyword, `%${search}%`);
  }

  const [rows] = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.full_name,
      u.phone,
      u.email,
      u.address,
      u.avatar,
      u.role,
      u.status,
      u.email_verified,
      u.auth_provider,
      u.provider_uid,
      u.created_at,
      u.updated_at,
      COALESCE(os.order_count, 0) AS order_count,
      COALESCE(os.order_total, 0) AS order_total
    FROM users u
    LEFT JOIN (
      SELECT
        LOWER(email) AS email_key,
        COUNT(*) AS order_count,
        COALESCE(SUM(total), 0) AS order_total
      FROM orders
      WHERE email IS NOT NULL AND email != ''
      GROUP BY LOWER(email)
    ) os ON os.email_key = LOWER(u.email)
    WHERE ${where.join(" AND ")}
    ORDER BY u.created_at DESC, u.id DESC
    `,
    params,
  );

  const bookingStatsMap = await getBookingStatsMap();

  return rows.map((row) => {
    const bookingStats = bookingStatsMap.get(
      String(row.email || "").toLowerCase(),
    );

    return {
      ...row,
      booking_count: bookingStats?.booking_count || 0,
      booking_total: bookingStats?.booking_total || 0,
    };
  });
};

// GET /api/users/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        full_name,
        phone,
        email,
        address,
        avatar,
        role,
        status,
        email_verified,
        auth_provider,
        provider_uid,
        created_at,
        updated_at
      FROM users
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
      `,
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản.",
      });
    }

    res.json({
      success: true,
      user: mapUser(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin cá nhân:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin cá nhân.",
      error: error.message,
    });
  }
});

// PATCH /api/users/me
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name || req.body.fullName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const address = String(req.body.address || "").trim();
    const hasAvatar = Object.prototype.hasOwnProperty.call(req.body, "avatar");
    const avatar = hasAvatar ? req.body.avatar : null;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên và email.",
      });
    }

    const [existedRows] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ? AND id != ? AND deleted_at IS NULL
      LIMIT 1
      `,
      [email, req.user.id],
    );

    if (existedRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được tài khoản khác sử dụng.",
      });
    }

    await db.query(
      `
  UPDATE users
  SET
    name = ?,
    full_name = ?,
    phone = ?,
    email = ?,
    address = ?,
    avatar = CASE WHEN ? THEN ? ELSE avatar END,
    updated_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
  `,
      [
        name,
        name,
        phone || null,
        email,
        address || null,
        hasAvatar ? 1 : 0,
        avatar,
        req.user.id,
      ],
    );

    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        full_name,
        phone,
        email,
        address,
        avatar,
        role,
        status,
        email_verified,
        auth_provider,
        provider_uid,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công.",
      user: mapUser(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin cá nhân:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin cá nhân.",
      error: error.message,
    });
  }
});

// GET /api/users
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all").trim();

    const rows = await getUserRows({
      search,
      status,
    });

    const users = rows.map(mapUser);

    const summary = {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === "active").length,
      lockedUsers: users.filter((user) => user.status === "locked").length,
      totalOrders: users.reduce((sum, user) => sum + user.orderCount, 0),
      totalBookings: users.reduce((sum, user) => sum + user.bookingCount, 0),
      totalSpent: users.reduce((sum, user) => sum + user.totalSpent, 0),
      newUsersThisMonth: users.filter((user) => {
        if (!user.createdAt) return false;

        const createdDate = new Date(user.createdAt);
        const now = new Date();

        return (
          createdDate.getMonth() === now.getMonth() &&
          createdDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };

    res.json({
      success: true,
      users,
      summary,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách khách hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách khách hàng.",
      error: error.message,
    });
  }
});

// GET /api/users/:id
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await getUserRows();

    const user = rows
      .map(mapUser)
      .find((item) => String(item.id) === String(req.params.id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết khách hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết khách hàng.",
      error: error.message,
    });
  }
});

// PATCH /api/users/:id/status
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    const userId = Number(req.params.id);

    if (!["active", "locked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái tài khoản không hợp lệ.",
      });
    }

    if (String(userId) === String(req.user.id) && status === "locked") {
      return res.status(400).json({
        success: false,
        message: "Không thể tự khóa tài khoản admin đang đăng nhập.",
      });
    }

    const [currentRows] = await db.query(
      `
      SELECT
  id, name, full_name, phone, email, address, avatar,
  role, status, email_verified, auth_provider, provider_uid, created_at, updated_at
FROM users
WHERE id = ? AND deleted_at IS NULL
LIMIT 1
      `,
      [userId],
    );

    if (currentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản.",
      });
    }

    const oldStatus = currentRows[0].status;

    if (oldStatus === status) {
      return res.json({
        success: true,
        message: "Trạng thái không thay đổi.",
        user: mapUser(currentRows[0]),
      });
    }

    await db.query(
      `
      UPDATE users
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
      `,
      [status, userId],
    );

    await createActivityLog({
      targetUserId: userId,
      actorUserId: req.user.id,
      action: "status_changed",
      oldValue: oldStatus,
      newValue: status,
      message:
        status === "locked" ? "Tài khoản bị khóa" : "Tài khoản được mở khóa",
    });

    const [rows] = await db.query(
      `
      SELECT
  id, name, full_name, phone, email, address, avatar,
  role, status, email_verified, auth_provider, provider_uid, created_at, updated_at
FROM users
WHERE id = ?
LIMIT 1
      `,
      [userId],
    );

    res.json({
      success: true,
      message: "Cập nhật trạng thái tài khoản thành công.",
      user: mapUser(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái tài khoản:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái tài khoản.",
      error: error.message,
    });
  }
});

// POST /api/users/bulk-status
router.post("/bulk-status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    if (!["active", "locked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái tài khoản không hợp lệ.",
      });
    }

    const targetIds = ids
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0 && id !== req.user.id);

    if (targetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Chưa chọn khách hàng hợp lệ.",
      });
    }

    await db.query(
      `
      UPDATE users
      SET status = ?, updated_at = NOW()
      WHERE id IN (?) AND deleted_at IS NULL
      `,
      [status, targetIds],
    );

    res.json({
      success: true,
      message: "Cập nhật hàng loạt thành công.",
      ids: targetIds,
      status,
    });
  } catch (error) {
    console.error("Lỗi cập nhật hàng loạt:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật hàng loạt.",
      error: error.message,
    });
  }
});

// DELETE /api/users/:id
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tài khoản admin đang đăng nhập.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE users
      SET status = 'locked', deleted_at = NOW(), updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
      `,
      [req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng.",
      });
    }

    res.json({
      success: true,
      message: "Xóa khách hàng thành công.",
      userId: Number(req.params.id),
    });
  } catch (error) {
    console.error("Lỗi xóa khách hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa khách hàng.",
      error: error.message,
    });
  }
});

// POST /api/users/bulk-delete
router.post("/bulk-delete", requireAuth, requireAdmin, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    const targetIds = ids
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0 && id !== req.user.id);

    if (targetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Chưa chọn khách hàng hợp lệ.",
      });
    }

    await db.query(
      `
      UPDATE users
      SET status = 'locked', deleted_at = NOW(), updated_at = NOW()
      WHERE id IN (?) AND deleted_at IS NULL
      `,
      [targetIds],
    );

    res.json({
      success: true,
      message: "Xóa hàng loạt khách hàng thành công.",
      ids: targetIds,
    });
  } catch (error) {
    console.error("Lỗi xóa hàng loạt khách hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa hàng loạt khách hàng.",
      error: error.message,
    });
  }
});

module.exports = router;
