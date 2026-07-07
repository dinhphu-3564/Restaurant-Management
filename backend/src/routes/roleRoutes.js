const express = require("express");
const db = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { createActivityLog } = require("../utils/activityLog");

const router = express.Router();

const ROLE_TEXT = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  staff: "Nhân viên",
  user: "Khách hàng",
};

const mapUser = (row) => ({
  id: row.id,
  name: row.name || row.full_name,
  fullName: row.full_name || row.name,
  phone: row.phone,
  email: row.email,
  avatar: row.avatar,
  role: row.role,
  roleText: ROLE_TEXT[row.role] || "Khách hàng",
  status: row.status,
  emailVerified: Boolean(row.email_verified),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapActivity = (row) => ({
  id: row.id,
  targetUserId: row.target_user_id,
  actorUserId: row.actor_user_id,
  actorName: row.actor_name || row.actor_full_name || "Hệ thống",
  action: row.action,
  oldValue: row.old_value,
  newValue: row.new_value,
  message: row.message,
  createdAt: row.created_at,
});

// GET /api/roles/users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const search = String(req.query.search || "")
      .trim()
      .toLowerCase();

    const role = String(req.query.role || "all").trim();

    const allowedRoleFilters = ["admin", "manager", "staff"];

    const where = [
      "deleted_at IS NULL",
      "role IN ('admin', 'manager', 'staff')",
    ];

    const params = [];

    if (role !== "all") {
      if (!allowedRoleFilters.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Vai trò lọc không hợp lệ.",
        });
      }

      where.push("role = ?");
      params.push(role);
    }

    if (search) {
      where.push(`
        (
          LOWER(COALESCE(name, '')) LIKE ?
          OR LOWER(COALESCE(full_name, '')) LIKE ?
          OR LOWER(COALESCE(email, '')) LIKE ?
          OR COALESCE(phone, '') LIKE ?
        )
      `);

      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, `%${search}%`);
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        full_name,
        phone,
        email,
        avatar,
        role,
        status,
        email_verified,
        created_at,
        updated_at
      FROM users
      WHERE ${where.join(" AND ")}
      ORDER BY
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'manager' THEN 2
          WHEN 'staff' THEN 3
          ELSE 4
        END,
        created_at DESC,
        id DESC
      `,
      params,
    );

    res.json({
      success: true,
      users: rows.map(mapUser),
      summary: {
        total: rows.length,
        admins: rows.filter((item) => item.role === "admin").length,
        managers: rows.filter((item) => item.role === "manager").length,
        staffs: rows.filter((item) => item.role === "staff").length,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách vai trò:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách vai trò.",
      error: error.message,
    });
  }
});

//API lấy lịch sử hoạt động
// GET /api/roles/users/:id/activities
router.get(
  "/users/:id/activities",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Mã tài khoản không hợp lệ.",
        });
      }

      const [rows] = await db.query(
        `
      SELECT
        l.id,
        l.target_user_id,
        l.actor_user_id,
        l.action,
        l.old_value,
        l.new_value,
        l.message,
        l.created_at,
        actor.name AS actor_name,
        actor.full_name AS actor_full_name
      FROM user_activity_logs l
      LEFT JOIN users actor ON actor.id = l.actor_user_id
      WHERE l.target_user_id = ?
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT 30
      `,
        [userId],
      );

      res.json({
        success: true,
        activities: rows.map(mapActivity),
      });
    } catch (error) {
      console.error("Lỗi lấy lịch sử hoạt động:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy lịch sử hoạt động.",
        error: error.message,
      });
    }
  },
);

// GET /api/roles/admin-activities
router.get("/admin-activities", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        l.id,
        l.target_user_id,
        l.actor_user_id,
        l.action,
        l.old_value,
        l.new_value,
        l.message,
        l.created_at,

        target.name AS target_name,
        target.full_name AS target_full_name,
        target.email AS target_email,
        target.role AS target_role,
        target.status AS target_status,

        actor.name AS actor_name,
        actor.full_name AS actor_full_name,
        actor.email AS actor_email
      FROM user_activity_logs l
      LEFT JOIN users target ON target.id = l.target_user_id
      LEFT JOIN users actor ON actor.id = l.actor_user_id
      WHERE l.actor_user_id = ?
        AND l.action IN ('role_changed', 'status_changed')
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT 50
      `,
      [req.user.id],
    );

    const activities = rows.map((row) => ({
      id: row.id,
      targetUserId: row.target_user_id,
      actorUserId: row.actor_user_id,
      action: row.action,
      oldValue: row.old_value,
      newValue: row.new_value,
      message: row.message,
      createdAt: row.created_at,

      targetName:
        row.target_name ||
        row.target_full_name ||
        row.target_email ||
        "Tài khoản",

      targetEmail: row.target_email,
      targetRole: row.target_role,
      targetStatus: row.target_status,

      actorName:
        row.actor_name || row.actor_full_name || row.actor_email || "Admin",
    }));

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử hoạt động admin:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử hoạt động admin.",
      error: error.message,
    });
  }
});

// PATCH /api/roles/users/:id
router.patch("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const role = String(req.body.role || "").trim();

    const allowedRoles = ["user", "staff", "manager", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ.",
      });
    }

    if (userId === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Không thể tự thay đổi vai trò của tài khoản đang đăng nhập.",
      });
    }

    const [currentRows] = await db.query(
      `
  SELECT id, name, full_name, phone, email, avatar, role, status, email_verified, created_at, updated_at
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

    const oldRole = currentRows[0].role;

    if (oldRole === "admin" && role !== "admin") {
      const [[{ adminCount }]] = await db.query(
        "SELECT COUNT(*) AS adminCount FROM users WHERE role = 'admin' AND status = 'active' AND deleted_at IS NULL"
      );
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Không thể thay đổi vai trò của quản trị viên (admin) hoạt động cuối cùng trong hệ thống.",
        });
      }
    }

    if (oldRole === role) {
      return res.json({
        success: true,
        message: "Vai trò không thay đổi.",
        user: mapUser(currentRows[0]),
      });
    }

    const [result] = await db.query(
      `
  UPDATE users
  SET role = ?, updated_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
  `,
      [role, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản.",
      });
    }

    await createActivityLog({
      targetUserId: userId,
      actorUserId: req.user.id,
      action: "role_changed",
      oldValue: oldRole,
      newValue: role,
      message: `Đổi vai trò từ ${ROLE_TEXT[oldRole] || oldRole} sang ${
        ROLE_TEXT[role] || role
      }`,
    });

    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        full_name,
        phone,
        email,
        avatar,
        role,
        status,
        email_verified,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId],
    );

    res.json({
      success: true,
      message: "Cập nhật vai trò thành công.",
      user: mapUser(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi cập nhật vai trò:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật vai trò.",
      error: error.message,
    });
  }
});

module.exports = router;
