const express = require("express");
const db = require("../config/db");
const { getIO } = require("../config/socket");
const { createActivityLog } = require("../utils/activityLog");
const {
  requireAuth,
  requireBackOffice,
  requireManagerOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

const TABLE_STATUSES = ["available", "serving", "maintenance", "disabled"];

//hàm tự sinh mã bàn
function removeVietnameseTones(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function escapeRegExp(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAreaCodeConfig(areaName = "") {
  const normalizedName = removeVietnameseTones(areaName);

  // Phòng VIP -> VIP01, VIP02...
  if (normalizedName.includes("vip")) {
    return {
      type: "text",
      prefix: "VIP",
    };
  }

  // Tầng 1 -> 101, 102...
  // Tầng 2 -> 201, 202...
  const floorMatch = normalizedName.match(/tang\s*(\d+)/);

  if (floorMatch) {
    return {
      type: "floor",
      prefix: String(floorMatch[1]),
    };
  }

  // Tầng trệt vẫn xem là tầng 1
  if (normalizedName.includes("tret")) {
    return {
      type: "floor",
      prefix: "1",
    };
  }

  // Sân vườn -> SV01, SV02...
  if (normalizedName.includes("san vuon")) {
    return {
      type: "text",
      prefix: "SV",
    };
  }

  // Khu A -> KA01, Khu ngoài trời -> KNT01...
  const prefix =
    normalizedName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "KV";

  return {
    type: "text",
    prefix,
  };
}

async function generateTableCodeByArea(areaId) {
  const [areaRows] = await db.query(
    `
    SELECT id, name
    FROM areas
    WHERE id = ?
      AND deleted_at IS NULL
      AND status = 'active'
    LIMIT 1
    `,
    [areaId],
  );

  if (areaRows.length === 0) {
    const error = new Error("Khu vực không tồn tại.");
    error.statusCode = 400;
    throw error;
  }

  const area = areaRows[0];
  const config = getAreaCodeConfig(area.name);
  const safePrefix = escapeRegExp(config.prefix);

  const [tableRows] = await db.query(
    `
    SELECT table_code
    FROM restaurant_tables
    WHERE deleted_at IS NULL
    `,
  );

  const usedNumbers = tableRows
    .map((row) => String(row.table_code || "").trim())
    .map((code) => {
      if (config.type === "floor") {
        const match = code.match(new RegExp(`^${safePrefix}(\\d{2})$`));
        return match ? Number(match[1]) : null;
      }

      const match = code.match(new RegExp(`^${safePrefix}(\\d+)$`, "i"));
      return match ? Number(match[1]) : null;
    })
    .filter((number) => Number.isInteger(number));

  let nextNumber = 1;

  while (usedNumbers.includes(nextNumber)) {
    nextNumber += 1;
  }

  return `${config.prefix}${String(nextNumber).padStart(2, "0")}`;
}

const mapArea = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTable = (row) => ({
  id: row.id,
  areaId: row.area_id,
  areaName: row.area_name,
  code: row.table_code,
  tableCode: row.table_code,
  capacity: row.seats,
  seats: row.seats,
  status: row.status,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// GET /api/tables/areas
router.get("/areas", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM areas
      WHERE deleted_at IS NULL
        AND status = 'active'
      ORDER BY id ASC
      `,
    );

    res.json({
      success: true,
      areas: rows.map(mapArea),
    });
  } catch (error) {
    console.error("Lỗi lấy khu vực:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy khu vực.",
      error: error.message,
    });
  }
});

// POST /api/tables/areas
router.post("/areas", requireAuth, requireManagerOrAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên khu vực.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO areas (name, description, status)
      VALUES (?, ?, 'active')
      `,
      [name, description || null],
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM areas
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    // Auto-create a pending space linked to this new area
    try {
      const spaceKey = "area_" + result.insertId + "_" + Math.random().toString(36).substring(2, 6);
      const [maxOrderRows] = await db.query("SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM restaurant_spaces");
      const nextOrder = maxOrderRows[0]?.next_order || 1;

      await db.query(
        `INSERT INTO restaurant_spaces (space_key, label, description, detail_description, capacity, display_order, status)
         VALUES (?, ?, ?, '', 0, ?, 'pending')`,
        [spaceKey, name, description || "", nextOrder],
      );
    } catch (spaceErr) {
      // Non-critical: log but don't fail the area creation
      console.warn("Không thể tạo không gian pending cho khu vực mới:", spaceErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Thêm khu vực thành công.",
      area: mapArea(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi thêm khu vực:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm khu vực.",
      error: error.message,
    });
  }
});

// PATCH /api/tables/areas/:id
router.patch("/areas/:id", requireAuth, requireManagerOrAdmin, async (req, res) => {
  try {
    const areaId = Number(req.params.id);
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên khu vực.",
      });
    }

    await db.query(
      `
      UPDATE areas
      SET name = ?, description = ?, updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [name, description || null, areaId],
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM areas
      WHERE id = ?
      LIMIT 1
      `,
      [areaId],
    );

    res.json({
      success: true,
      message: "Cập nhật khu vực thành công.",
      area: mapArea(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi cập nhật khu vực:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật khu vực.",
      error: error.message,
    });
  }
});

// DELETE /api/tables/areas/:id
router.delete(
  "/areas/:id",
  requireAuth,
  requireManagerOrAdmin,
  async (req, res) => {
    try {
      const areaId = Number(req.params.id);

      const [tableRows] = await db.query(
        `
      SELECT id
      FROM restaurant_tables
      WHERE area_id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
        [areaId],
      );

      if (tableRows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa khu vực đang có bàn.",
        });
      }

      // Get area details first to get the name
      const [areaRows] = await db.query("SELECT name FROM areas WHERE id = ?", [areaId]);
      const areaName = areaRows[0]?.name;

      await db.query(
        `
      UPDATE areas
      SET deleted_at = NOW(), status = 'inactive', updated_at = NOW()
      WHERE id = ?
      `,
        [areaId],
      );

      // Cascade delete the corresponding space in restaurant_spaces
      if (areaName) {
        await db.query(
          "DELETE FROM restaurant_spaces WHERE label = ?",
          [areaName]
        );
      }

      res.json({
        success: true,
        message: "Xóa khu vực thành công.",
        areaId,
      });
    } catch (error) {
      console.error("Lỗi xóa khu vực:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa khu vực.",
        error: error.message,
      });
    }
  },
);

// GET /api/tables
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        t.*,
        a.name AS area_name
      FROM restaurant_tables t
      LEFT JOIN areas a ON a.id = t.area_id
      WHERE t.deleted_at IS NULL
      ORDER BY a.id ASC, t.table_code ASC
      `,
    );

    res.json({
      success: true,
      tables: rows.map(mapTable),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách bàn:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bàn.",
      error: error.message,
    });
  }
});

// POST /api/tables
router.post("/", requireAuth, requireManagerOrAdmin, async (req, res) => {
  try {
    const areaId = Number(req.body.areaId);
    let code = String(req.body.code || req.body.tableCode || "").trim();
    const seats = Number(req.body.capacity || req.body.seats || 4);
    const status = String(req.body.status || "available").trim();
    const description = String(req.body.description || "").trim();

    if (!areaId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn khu vực.",
      });
    }

    if (!Number.isInteger(seats) || seats <= 0) {
      return res.status(400).json({
        success: false,
        message: "Sức chứa bàn không hợp lệ.",
      });
    }

    if (!TABLE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái bàn không hợp lệ.",
      });
    }

    // Nếu admin không nhập mã bàn thì API tự sinh theo khu vực
    if (!code) {
      code = await generateTableCodeByArea(areaId);
    }

    const [existedRows] = await db.query(
      `
      SELECT id
      FROM restaurant_tables
      WHERE table_code = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [code],
    );

    if (existedRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mã bàn đã tồn tại.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO restaurant_tables (
        area_id,
        table_code,
        seats,
        status,
        description
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [areaId, code, seats, status, description || null],
    );

    const [rows] = await db.query(
      `
      SELECT
        t.*,
        a.name AS area_name
      FROM restaurant_tables t
      LEFT JOIN areas a ON a.id = t.area_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    await createActivityLog({
      targetUserId: req.user.id,
      actorUserId: req.user.id,
      action: "add_table",
      message: `Đã thêm bàn mới: ${code}`,
    }).catch(err => console.error("Log error:", err));

    res.status(201).json({
      success: true,
      message: "Thêm bàn thành công.",
      table: mapTable(rows[0]),
    });
  } catch (error) {
    console.error("Lỗi thêm bàn:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Lỗi server khi thêm bàn.",
      error: error.message,
    });
  }
});
// PATCH /api/tables/:id
router.patch("/:id", requireAuth, requireManagerOrAdmin, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const tableId = Number(req.params.id);
    const areaId = Number(req.body.areaId);
    const code = String(req.body.code || req.body.tableCode || "").trim();
    const seats = Number(req.body.capacity || req.body.seats || 4);
    const status = String(req.body.status || "available").trim();
    const description = String(req.body.description || "").trim();

    if (!areaId || !code) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn khu vực và nhập mã bàn.",
      });
    }

    if (!TABLE_STATUSES.includes(status)) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Trạng thái bàn không hợp lệ.",
      });
    }

    if (["maintenance", "disabled"].includes(status)) {
      const [bookingRows] = await conn.query(
        `
    SELECT id
    FROM bookings
    WHERE selected_table = (
      SELECT table_code
      FROM restaurant_tables
      WHERE id = ?
      LIMIT 1
    )
      AND status IN ('pending', 'confirmed')
      AND deleted_at IS NULL
    LIMIT 1
    FOR UPDATE
    `,
        [tableId],
      );

      if (bookingRows.length > 0) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Không thể đổi trạng thái bàn vì bàn đang có lịch đặt chờ xác nhận hoặc đã xác nhận.",
        });
      }
    }

    const [existedRows] = await conn.query(
      `
      SELECT id
      FROM restaurant_tables
      WHERE table_code = ?
        AND id != ?
        AND deleted_at IS NULL
      LIMIT 1
      FOR UPDATE
      `,
      [code, tableId],
    );

    if (existedRows.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "Mã bàn đã tồn tại.",
      });
    }

    await conn.query(
      `
      UPDATE restaurant_tables
      SET
        area_id = ?,
        table_code = ?,
        seats = ?,
        status = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [areaId, code, seats, status, description || null, tableId],
    );

    const [rows] = await conn.query(
      `
      SELECT
        t.*,
        a.name AS area_name
      FROM restaurant_tables t
      LEFT JOIN areas a ON a.id = t.area_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [tableId],
    );

    await conn.commit();
    try {
      getIO().emit("table_updated", { tableId });
    } catch(err) { console.error("Emit error:", err); }
    res.json({
      success: true,
      message: "Cập nhật bàn thành công.",
      table: mapTable(rows[0]),
    });
  } catch (error) {
    await conn.rollback();
    console.error("Lỗi cập nhật bàn:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật bàn.",
      error: error.message,
    });
  } finally {
    conn.release();
  }
});

// PATCH /api/tables/:id/status
router.patch(
  "/:id/status",
  requireAuth,
  requireBackOffice,
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const tableId = Number(req.params.id);
      const status = String(req.body.status || "").trim();

      if (!TABLE_STATUSES.includes(status)) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: "Trạng thái bàn không hợp lệ.",
        });
      }

      const [tableRows] = await conn.query(
        `
        SELECT id, table_code
        FROM restaurant_tables
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
        `,
        [tableId],
      );

      if (tableRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy bàn.",
        });
      }

      const table = tableRows[0];

      if (["maintenance", "disabled"].includes(status)) {
        const [bookingRows] = await conn.query(
          `
          SELECT id
          FROM bookings
          WHERE selected_table = ?
            AND status IN ('pending', 'confirmed')
            AND deleted_at IS NULL
          LIMIT 1
          FOR UPDATE
          `,
          [table.table_code],
        );

        if (bookingRows.length > 0) {
          await conn.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Không thể đổi trạng thái bàn vì bàn đang có lịch đặt chờ xác nhận hoặc đã xác nhận.",
          });
        }
      }

      await conn.query(
        `
        UPDATE restaurant_tables
        SET status = ?, updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [status, tableId],
      );

      if (status === "serving") {
        await conn.query(
          `
          UPDATE bookings
          SET status = 'serving', updated_at = NOW()
          WHERE selected_table = ?
            AND status = 'confirmed'
            AND deleted_at IS NULL
          `,
          [table.table_code]
        );
      } else if (status === "available") {
        await conn.query(
          `
          UPDATE bookings
          SET status = 'completed', updated_at = NOW()
          WHERE selected_table = ?
            AND status IN ('serving', 'confirmed')
            AND deleted_at IS NULL
          `,
          [table.table_code]
        );
      }

      const [rows] = await conn.query(
        `
        SELECT
          t.*,
          a.name AS area_name
        FROM restaurant_tables t
        LEFT JOIN areas a ON a.id = t.area_id
        WHERE t.id = ?
        LIMIT 1
        `,
        [tableId],
      );

      await conn.commit();
      try {
        getIO().emit("table_updated", { tableId });
      } catch(err) { console.error("Emit error:", err); }
      if (["maintenance", "disabled"].includes(status)) {
        await createActivityLog({
          targetUserId: req.user.id,
          actorUserId: req.user.id,
          action: "update_table_status",
          message: `Đã đổi trạng thái bàn ${table.table_code} sang ${status}`,
        }).catch(err => console.error("Log error:", err));
      }

      res.json({
        success: true,
        message: "Cập nhật trạng thái bàn thành công.",
        table: mapTable(rows[0]),
      });
    } catch (error) {
      await conn.rollback();
      console.error("Lỗi cập nhật trạng thái bàn:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái bàn.",
        error: error.message,
      });
    } finally {
      conn.release();
    }
  },
);

// DELETE /api/tables/:id
router.delete("/:id", requireAuth, requireManagerOrAdmin, async (req, res) => {
  try {
    const tableId = Number(req.params.id);

    const [bookingRows] = await db.query(
      `
      SELECT id
      FROM bookings
      WHERE selected_table = (
        SELECT table_code
        FROM restaurant_tables
        WHERE id = ?
        LIMIT 1
      )
        AND status IN ('pending', 'confirmed')
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [tableId],
    );

    if (bookingRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa bàn đang có lịch đặt.",
      });
    }

    await db.query(
      `
      UPDATE restaurant_tables
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [tableId],
    );

    await createActivityLog({
      targetUserId: req.user.id,
      actorUserId: req.user.id,
      action: "delete_table",
      message: `Đã xóa bàn ID ${tableId}`,
    }).catch(err => console.error("Log error:", err));

    res.json({
      success: true,
      message: "Xóa bàn thành công.",
      tableId,
    });
  } catch (error) {
    console.error("Lỗi xóa bàn:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa bàn.",
      error: error.message,
    });
  }
});

module.exports = router;
