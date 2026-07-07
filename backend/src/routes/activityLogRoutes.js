const express = require("express");
const db = require("../config/db");
const { requireAuth, requireBackOffice } = require("../middleware/authMiddleware");

const router = express.Router();

// Lấy danh sách lịch sử thao tác
router.get("/", requireAuth, requireBackOffice, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.id, l.action, l.old_value, l.new_value, l.message, l.created_at,
        u1.name as target_user_name, 
        u2.name as actor_user_name 
      FROM user_activity_logs l 
      LEFT JOIN users u1 ON l.target_user_id = u1.id 
      LEFT JOIN users u2 ON l.actor_user_id = u2.id 
      ORDER BY l.created_at DESC 
      LIMIT 200
    `);

    res.json({
      success: true,
      logs: rows,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử thao tác:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử thao tác",
      error: error.message,
    });
  }
});

module.exports = router;
