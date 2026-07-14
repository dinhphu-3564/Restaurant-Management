const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketConfig = require("./src/config/socket");

const db = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const adminMenuRoutes = require("./src/routes/adminMenuRoutes");
const menuRoutes = require("./src/routes/menuRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const tableRoutes = require("./src/routes/tableRoutes");
const dealRoutes = require("./src/routes/dealRoutes");
const spaceRoutes = require("./src/routes/spaceRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const activityLogRoutes = require("./src/routes/activityLogRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const revenueRoutes = require("./src/routes/revenueRoutes");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/admin/menu-items", adminMenuRoutes);
app.use("/api/menu-items", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/revenue", revenueRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend SePay is running",
  });
});

// Webhook SePay
app.post("/api/sepay/webhook", async (req, res) => {
  try {
    const payment = req.body;

    console.log("=== SEPAY WEBHOOK RECEIVED ===");
    console.log(payment);

    const paymentContent = String(
      payment.content || payment.description || "",
    ).replace(/[^A-Z0-9]/gi, "");

    const transferAmount = Number(payment.transferAmount || 0);

    const [orders] = await db.query(`
      SELECT id, order_code, payment_content, total
      FROM orders
      WHERE payment_status != 'paid'
      ORDER BY created_at DESC
    `);

    const matchedOrder = orders.find((order) => {
      const orderCode = String(
        order.payment_content || order.order_code || "",
      ).replace(/[^A-Z0-9]/gi, "");

      return paymentContent.toLowerCase().includes(orderCode.toLowerCase());
    });

    // 2. Kiểm tra các bàn đang phục vụ (bookings)
    const [bookings] = await db.query(`
      SELECT id, status, payment_status
      FROM bookings
      WHERE status = 'serving' AND payment_status != 'paid'
      ORDER BY created_at DESC
    `);

    const matchedBooking = bookings.find((booking) => {
      const bookingCode = `DB${booking.id}`;
      return paymentContent.toLowerCase().includes(bookingCode.toLowerCase());
    });

    if (matchedOrder) {
      // Lưu vào order_payments
      await db.query(
        `INSERT INTO order_payments (order_id, amount, payment_method, payment_status, created_at, updated_at) 
         VALUES (?, ?, 'bank', 'paid', NOW(), NOW())`,
        [matchedOrder.id, transferAmount]
      );

      // Tính tổng tiền đã trả
      const [paymentRows] = await db.query(
        `SELECT SUM(amount) as totalPaid FROM order_payments WHERE order_id = ?`,
        [matchedOrder.id]
      );
      
      const totalPaid = Number(paymentRows[0].totalPaid || 0);
      const isFullyPaid = totalPaid >= Number(matchedOrder.total || 0);
      const nextPaymentStatus = isFullyPaid ? 'paid' : 'partial';

      await db.query(
        `
        UPDATE orders
        SET
          payment_method = 'bank',
          payment_status = ?,
          paid_at = NOW(),
          sepay_transaction = ?,
          sepay_amount = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [nextPaymentStatus, JSON.stringify(payment), transferAmount, matchedOrder.id],
      );

      console.log(`Đã cập nhật đơn hàng ${matchedOrder.order_code}. Trạng thái: ${nextPaymentStatus} (Đã thu: ${totalPaid}/${matchedOrder.total})`);

      try {
        const { getIO } = require("./src/config/socket");
        const orderRoutes = require("./src/routes/orderRoutes"); // Cần getOrderByCode
        // Hoặc đơn giản là lấy từ db, nhưng để dễ thì emit id
        // Nhưng getOrderByCode không được export trực tiếp từ orderRoutes, thôi emit tạm data ngắn gọn
        getIO().emit("order_updated"); // Frontend sẽ tự load lại
      } catch (err) {
        console.error("Lỗi socket:", err);
      }
    } else if (matchedBooking) {
      await db.query(
        `
        UPDATE bookings
        SET
          payment_method = 'bank',
          payment_status = 'paid',
          paid_at = NOW()
        WHERE id = ?
        `,
        [matchedBooking.id],
      );

      console.log("Đã cập nhật thanh toán lịch đặt bàn:", matchedBooking.id);
    } else {
      console.log("Không tìm thấy đơn hàng hoặc lịch đặt phù hợp cho nội dung:", paymentContent);
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Lỗi webhook SePay:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi xử lý webhook SePay",
      error: error.message,
    });
  }
});

// API reset thủ công (chỉ dùng nội bộ / admin)
app.post("/api/admin/reset-stale-tables", async (req, res) => {
  try {
    await resetStaleTables();
    res.json({ success: true, message: "Đã reset bàn cũ thành công." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Auto-reset bàn qua ngày mới ───────────────────────────────────────────
/**
 * Reset tất cả bàn đang ở trạng thái "serving" (đang phục vụ) mà lịch đặt bàn
 * liên kết thuộc về ngày hôm trước hoặc sớm hơn về trạng thái "available" (bàn trống).
 * Đồng thời đánh dấu các lịch đặt tương ứng là "completed" (hoàn thành).
 */
async function resetStaleTables() {
  try {
    // Tính ngày hôm nay theo múi giờ Việt Nam (UTC+7)
    const now = new Date();
    const vnOffset = 7 * 60; // phút
    const vnNow = new Date(now.getTime() + vnOffset * 60 * 1000);
    const todayStr = vnNow.toISOString().slice(0, 10); // "YYYY-MM-DD" theo giờ VN

    console.log(`[Auto-Reset] Kiểm tra bàn cũ vào lúc ${now.toLocaleString("vi-VN")} (ngày VN: ${todayStr})...`);

    // 1. Tìm tất cả lịch đặt bàn đang serving/confirmed thuộc ngày trước hôm nay
    const [staleBookings] = await db.query(
      `
      SELECT b.id, b.selected_table, b.booking_date, b.status
      FROM bookings b
      WHERE b.status IN ('serving', 'confirmed')
        AND b.deleted_at IS NULL
        AND DATE(b.booking_date) < ?
      `,
      [todayStr]
    );

    if (staleBookings.length > 0) {
      console.log(`[Auto-Reset] Tìm thấy ${staleBookings.length} lịch đặt cũ cần reset:`, staleBookings.map(b => `DB${b.id} (bàn ${b.selected_table}, ngày ${b.booking_date})`));

      // 2. Cập nhật trạng thái lịch đặt → completed
      const staleBookingIds = staleBookings.map(b => b.id);
      await db.query(
        `UPDATE bookings SET status = 'completed', updated_at = NOW() WHERE id IN (?)`,
        [staleBookingIds]
      );

      // 3. Tìm các bàn ăn tương ứng đang bị giữ (serving) và reset về available
      const staleTablCodes = [...new Set(staleBookings.map(b => b.selected_table).filter(Boolean))];
      if (staleTablCodes.length > 0) {
        await db.query(
          `UPDATE restaurant_tables SET status = 'available', updated_at = NOW()
           WHERE table_code IN (?) AND status IN ('serving', 'reserved') AND deleted_at IS NULL`,
          [staleTablCodes]
        );
      }
      console.log(`[Auto-Reset] Đã reset ${staleBookings.length} lịch đặt cũ và ${staleTablCodes.length} bàn.`);
    } else {
      console.log("[Auto-Reset] Không có lịch đặt quá ngày cần reset.");
    }

    // 4. Dọn dẹp bàn "mồ côi": đang serving nhưng không có lịch đặt active nào
    const [orphanResult] = await db.query(`
      UPDATE restaurant_tables rt
      SET rt.status = 'available', rt.updated_at = NOW()
      WHERE rt.status = 'serving'
        AND rt.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.selected_table = rt.table_code
            AND b.status IN ('serving', 'confirmed')
            AND b.deleted_at IS NULL
        )
    `);
    if (orphanResult.affectedRows > 0) {
      console.log(`[Auto-Reset] Đã reset ${orphanResult.affectedRows} bàn mồ côi (serving không có lịch đặt) về available.`);
    }

  } catch (err) {
    console.error("[Auto-Reset] Lỗi khi reset bàn:", err);
  }
}

/**
 * Tính số mili-giây còn lại đến 00:00:00 của ngày hôm sau (múi giờ server).
 */
function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // ngày mai 00:00:00
  return midnight.getTime() - now.getTime();
}

/**
 * Lên lịch chạy resetStaleTables mỗi đêm lúc 00:00.
 */
function scheduleMidnightReset() {
  const delay = msUntilMidnight();
  console.log(`[Auto-Reset] Lên lịch reset bàn vào lúc 00:00 (còn ${Math.round(delay / 60000)} phút).`);
  setTimeout(() => {
    resetStaleTables();
    // Sau lần đầu tiên chạy đúng 00:00, đặt interval 24h cho các ngày tiếp theo
    setInterval(resetStaleTables, 24 * 60 * 60 * 1000);
  }, delay);
}
// ────────────────────────────────────────────────────────────────────────────

const server = http.createServer(app);
socketConfig.init(server);

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Chạy reset ngay khi server khởi động để dọn dẹp các bàn từ ngày hôm trước
  await resetStaleTables();
  // Lên lịch chạy lại mỗi đêm lúc 00:00
  scheduleMidnightReset();
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM bookings");
    const hasPaymentMethod = columns.some(c => c.Field === "payment_method");
    if (!hasPaymentMethod) {
      console.log("Migrating bookings table: adding payment_method, payment_status, paid_at...");
      await db.query(`
        ALTER TABLE bookings
        ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL AFTER status,
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid' AFTER payment_method,
        ADD COLUMN paid_at DATETIME DEFAULT NULL AFTER payment_status
      `);
      console.log("Migration successful!");
    }
    const hasCouponCode = columns.some(c => c.Field === "coupon_code");
    if (!hasCouponCode) {
      console.log("Migrating bookings table: adding coupon_code, discount_amount...");
      await db.query(`
        ALTER TABLE bookings
        ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL AFTER payment_status,
        ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0.00 AFTER coupon_code
      `);
      console.log("Coupon migration successful!");
    }
    const statusCol = columns.find(c => c.Field === "status");
    const hasServingStatus = statusCol && statusCol.Type.includes("'serving'");
    if (!hasServingStatus) {
      console.log("Migrating bookings table: updating status enum to include serving...");
      await db.query(`
        ALTER TABLE bookings
        MODIFY COLUMN status enum('pending','confirmed','serving','completed','cancelled') DEFAULT 'pending'
      `);
      console.log("Status enum migration successful!");
    }
  } catch (err) {
    console.error("Database migration error:", err);
  }
});
