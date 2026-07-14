const express = require("express");
const db = require("../config/db");

const router = express.Router();
const {
  requireAuth,
  requireBackOffice,
} = require("../middleware/authMiddleware");

function parseJson(value, fallback = []) {
  if (!value) return fallback;
  try {
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

router.get("/stats", requireAuth, requireBackOffice, async (req, res) => {
  try {
    // 1. Tổng số lượng user (role = 'user')
    const [[{ totalUsers }]] = await db.query(
      "SELECT COUNT(*) AS totalUsers FROM users WHERE deleted_at IS NULL AND role = 'user'",
    );

    // 2. Tổng số đơn hàng và booking
    const [[{ totalOrders }]] = await db.query(
      "SELECT COUNT(*) AS totalOrders FROM orders",
    );
    const [[{ totalBookings }]] = await db.query(
      "SELECT COUNT(*) AS totalBookings FROM bookings WHERE deleted_at IS NULL",
    );

    // 3. Doanh thu từ orders và bookings (Chỉ tính đơn đã thanh toán)
    const [[{ orderRevenue }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS orderRevenue FROM orders WHERE (status = 'paid' OR status = 'completed' OR payment_status = 'paid')",
    );
    const [[{ bookingRevenue }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS bookingRevenue FROM bookings WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid')",
    );
    const totalRevenue = Number(orderRevenue) + Number(bookingRevenue);

    // 4. Lượt khách đặt bàn
    const [[{ totalBookingGuests }]] = await db.query(
      "SELECT COALESCE(SUM(guests), 0) AS totalBookingGuests FROM bookings WHERE deleted_at IS NULL AND status != 'cancelled'",
    );

    // 5. Số món ăn đang hoạt động (selling)
    const [[{ activeMenuItems }]] = await db.query(
      "SELECT COUNT(*) AS activeMenuItems FROM menu_items WHERE status = 'selling'",
    );

    // 6. Số lượng đơn hàng theo trạng thái
    const [orderStatuses] = await db.query(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status",
    );
    const orderStatusBreakdown = {
      pending: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
    };
    orderStatuses.forEach((row) => {
      const status = row.status || "pending";
      if (Object.prototype.hasOwnProperty.call(orderStatusBreakdown, status)) {
        orderStatusBreakdown[status] = row.count;
      }
    });

    // 7. Danh sách 5 đơn hàng mới nhất
    const [latestOrderRows] = await db.query(
      "SELECT order_code AS id, customer_name AS customerName, total, status, created_at AS createdAt, phone FROM orders ORDER BY created_at DESC LIMIT 5",
    );

    // 8. Lịch đặt bàn hôm nay (hoặc 4 lịch đặt bàn mới nhất)
    const [latestBookingRows] = await db.query(
      "SELECT id, customer_name AS customerName, phone, booking_time AS time, selected_area_title AS selectedAreaTitle, selected_table AS selectedTable, status FROM bookings WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 4",
    );

    // 9. Thống kê món ăn bán chạy từ order_items hoặc menu_items có sold cao nhất
    const [bestFoodRows] = await db.query(
      "SELECT id, name, image, sold AS qty, price FROM menu_items WHERE status = 'selling' ORDER BY sold DESC LIMIT 5",
    );

    // Tải thông tin tất cả món ăn để tra cứu giá vốn/nhóm món
    const [menuItems] = await db.query(`
      SELECT mi.id, mi.code, mi.name, mi.cost_price, c.name AS category_name 
      FROM menu_items mi 
      LEFT JOIN categories c ON c.id = mi.category_id
    `);
    const menuMap = {};
    menuItems.forEach((mi) => {
      if (mi.code) menuMap[String(mi.code).toLowerCase()] = mi;
      if (mi.id) menuMap[String(mi.id)] = mi;
      if (mi.name) menuMap[String(mi.name).toLowerCase()] = mi;
    });

    // Tính toán giá vốn tổng cộng thực tế (đối với đơn đã thanh toán)
    const [[{ orderTotalCost }]] = await db.query(`
      SELECT COALESCE(SUM(oi.unit_cost * oi.qty), 0) AS cost
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE (o.status = 'paid' OR o.status = 'completed' OR o.payment_status = 'paid')
    `);
    const [allPaidBookings] = await db.query(`
      SELECT cart_items FROM bookings
      WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid')
    `);
    let bookingTotalCost = 0;
    allPaidBookings.forEach((row) => {
      const cartItems = parseJson(row.cart_items, []);
      cartItems.forEach((item) => {
        const itemKey = String(item.id || item.code || item.name || "").toLowerCase();
        const matched = menuMap[itemKey];
        const cost = matched ? Number(matched.cost_price || 0) : 0;
        bookingTotalCost += cost * Number(item.qty || 0);
      });
    });
    const totalCost = Number(orderTotalCost) + bookingTotalCost;
    const totalProfit = totalRevenue - totalCost;

    // A. Tính toán tăng trưởng tuần thực tế cho các KPI
    const [[{ thisWeekOrderRev }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS thisWeekOrderRev FROM orders WHERE (status = 'paid' OR status = 'completed' OR payment_status = 'paid') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const [[{ thisWeekBookingRev }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS thisWeekBookingRev FROM bookings WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const thisWeekRev = Number(thisWeekOrderRev) + Number(thisWeekBookingRev);

    const [[{ lastWeekOrderRev }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS lastWeekOrderRev FROM orders WHERE (status = 'paid' OR status = 'completed' OR payment_status = 'paid') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const [[{ lastWeekBookingRev }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS lastWeekBookingRev FROM bookings WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const lastWeekRev = Number(lastWeekOrderRev) + Number(lastWeekBookingRev);

    const [[{ thisWeekOrders }]] = await db.query(
      "SELECT COUNT(*) AS thisWeekOrders FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const [[{ lastWeekOrders }]] = await db.query(
      "SELECT COUNT(*) AS lastWeekOrders FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );

    const [[{ thisWeekBookings }]] = await db.query(
      "SELECT COUNT(*) AS thisWeekBookings FROM bookings WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const [[{ lastWeekBookings }]] = await db.query(
      "SELECT COUNT(*) AS lastWeekBookings FROM bookings WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );

    const [[{ thisWeekUsers }]] = await db.query(
      "SELECT COUNT(*) AS thisWeekUsers FROM users WHERE deleted_at IS NULL AND role = 'user' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );
    const [[{ lastWeekUsers }]] = await db.query(
      "SELECT COUNT(*) AS lastWeekUsers FROM users WHERE deleted_at IS NULL AND role = 'user' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
    );

    // Tính chi phí tuần này
    const [[{ thisWeekOrderCost }]] = await db.query(`
      SELECT COALESCE(SUM(oi.unit_cost * oi.qty), 0) AS cost
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE (o.status = 'paid' OR o.status = 'completed' OR o.payment_status = 'paid')
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    `);
    const [thisWeekBookingsRows] = await db.query(`
      SELECT cart_items FROM bookings
      WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid')
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    `);
    let thisWeekBookingCost = 0;
    thisWeekBookingsRows.forEach((row) => {
      const cartItems = parseJson(row.cart_items, []);
      cartItems.forEach((item) => {
        const itemKey = String(item.id || item.code || item.name || "").toLowerCase();
        const matched = menuMap[itemKey];
        const cost = matched ? Number(matched.cost_price || 0) : 0;
        thisWeekBookingCost += cost * Number(item.qty || 0);
      });
    });
    const thisWeekCost = Number(thisWeekOrderCost) + thisWeekBookingCost;
    const thisWeekProfit = thisWeekRev - thisWeekCost;

    // Tính chi phí tuần trước
    const [[{ lastWeekOrderCost }]] = await db.query(`
      SELECT COALESCE(SUM(oi.unit_cost * oi.qty), 0) AS cost
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE (o.status = 'paid' OR o.status = 'completed' OR o.payment_status = 'paid')
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        AND o.created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    `);
    const [lastWeekBookingsRows] = await db.query(`
      SELECT cart_items FROM bookings
      WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid')
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    `);
    let lastWeekBookingCost = 0;
    lastWeekBookingsRows.forEach((row) => {
      const cartItems = parseJson(row.cart_items, []);
      cartItems.forEach((item) => {
        const itemKey = String(item.id || item.code || item.name || "").toLowerCase();
        const matched = menuMap[itemKey];
        const cost = matched ? Number(matched.cost_price || 0) : 0;
        lastWeekBookingCost += cost * Number(item.qty || 0);
      });
    });
    const lastWeekCost = Number(lastWeekOrderCost) + lastWeekBookingCost;
    const lastWeekProfit = lastWeekRev - lastWeekCost;

    const calcGrowth = (curr, prev) => {
      const curVal = Number(curr) || 0;
      const prevVal = Number(prev) || 0;
      if (prevVal === 0) return curVal > 0 ? "100.0%" : "0.0%";
      const diff = ((curVal - prevVal) / prevVal) * 100;
      return (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
    };

    const revenueGrowth = calcGrowth(thisWeekRev, lastWeekRev);
    const ordersGrowth = calcGrowth(thisWeekOrders, lastWeekOrders);
    const bookingsGrowth = calcGrowth(thisWeekBookings, lastWeekBookings);
    const usersGrowth = calcGrowth(thisWeekUsers, lastWeekUsers);
    const profitGrowth = calcGrowth(thisWeekProfit, lastWeekProfit);

    // 10. Doanh thu theo danh mục món ăn (thực tế theo categoryRange)
    const categoryRange = req.query.categoryRange || "week";
    let categoryTimeConstraint = "";
    if (categoryRange === "today") {
      categoryTimeConstraint = "AND created_at >= CURDATE()";
    } else if (categoryRange === "week") {
      categoryTimeConstraint = "AND created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
    } else if (categoryRange === "month") {
      categoryTimeConstraint = "AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
    } else if (categoryRange === "year") {
      categoryTimeConstraint = "AND created_at >= DATE_FORMAT(CURDATE(), '%Y-01-01')";
    }

    // Query order_items
    const [catOrderRows] = await db.query(`
      SELECT oi.menu_item_code, oi.name, oi.price, oi.qty
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE (o.status = 'paid' OR o.status = 'completed' OR o.payment_status = 'paid')
        ${categoryTimeConstraint.replace(/created_at/g, 'o.created_at')}
    `);

    // Query bookings
    const [catBookingRows] = await db.query(`
      SELECT cart_items
      FROM bookings
      WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid')
        ${categoryTimeConstraint}
    `);

    const catRevenueMap = {};
    catOrderRows.forEach((row) => {
      const itemKey = String(row.menu_item_code || row.name || "").toLowerCase();
      const matched = menuMap[itemKey];
      const catName = matched ? (matched.category_name || "Món chính") : "Món chính";
      catRevenueMap[catName] = (catRevenueMap[catName] || 0) + Number(row.price || 0) * Number(row.qty || 0);
    });

    catBookingRows.forEach((row) => {
      const cartItems = parseJson(row.cart_items, []);
      cartItems.forEach((item) => {
        const itemKey = String(item.id || item.code || item.name || "").toLowerCase();
        const matched = menuMap[itemKey];
        const catName = matched ? (matched.category_name || "Món chính") : "Món chính";
        catRevenueMap[catName] = (catRevenueMap[catName] || 0) + Number(item.price || 0) * Number(item.qty || 0);
      });
    });

    const categoryRevenueRows = Object.keys(catRevenueMap).map((name) => ({
      name,
      revenue: catRevenueMap[name],
    })).sort((a, b) => b.revenue - a.revenue);

    // 11. Doanh thu và lợi nhuận thực tế theo khoảng thời gian được lọc (revenueRange)
    const revenueRange = req.query.revenueRange || "7";
    let revenueTimeConstraint = "";
    let dateFormat = "%d/%m";
    let dateLabelsGenerator = [];

    if (revenueRange === "30") {
      revenueTimeConstraint = "AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)";
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        dateLabelsGenerator.push(`${day}/${month}`);
      }
    } else if (revenueRange === "month") {
      revenueTimeConstraint = "AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
      const today = new Date();
      const endDay = today.getDate();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      for (let i = 1; i <= endDay; i++) {
        const day = String(i).padStart(2, "0");
        dateLabelsGenerator.push(`${day}/${month}`);
      }
    } else if (revenueRange === "year") {
      revenueTimeConstraint = "AND created_at >= DATE_FORMAT(CURDATE(), '%Y-01-01')";
      dateFormat = "%m";
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      for (let i = 1; i <= currentMonth; i++) {
        dateLabelsGenerator.push(`Tháng ${String(i).padStart(2, "0")}`);
      }
    } else {
      revenueTimeConstraint = "AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        dateLabelsGenerator.push(`${day}/${month}`);
      }
    }

    const dailyDataMap = {};
    dateLabelsGenerator.forEach((label) => {
      dailyDataMap[label] = { revenue: 0, cost: 0 };
    });

    // Lấy doanh thu & cost từ orders theo ngày
    const [ordersDaily] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') AS date_label,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE (status = 'paid' OR status = 'completed' OR payment_status = 'paid')
        ${revenueTimeConstraint}
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '${dateFormat}')
    `);
    ordersDaily.forEach((row) => {
      let key = row.date_label;
      if (revenueRange === "year") key = `Tháng ${String(row.date_label).padStart(2, "0")}`;
      if (dailyDataMap[key]) dailyDataMap[key].revenue += Number(row.revenue || 0);
    });

    const [ordersDailyCosts] = await db.query(`
      SELECT 
        DATE_FORMAT(o.created_at, '${dateFormat}') AS date_label,
        COALESCE(SUM(oi.unit_cost * oi.qty), 0) AS cost
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE (o.status = 'paid' OR o.status = 'completed' OR o.payment_status = 'paid')
        ${revenueTimeConstraint.replace(/created_at/g, 'o.created_at')}
      GROUP BY DATE(o.created_at), DATE_FORMAT(o.created_at, '${dateFormat}')
    `);
    ordersDailyCosts.forEach((row) => {
      let key = row.date_label;
      if (revenueRange === "year") key = `Tháng ${String(row.date_label).padStart(2, "0")}`;
      if (dailyDataMap[key]) dailyDataMap[key].cost += Number(row.cost || 0);
    });

    // Lấy doanh thu & cost từ bookings theo ngày
    const [bookingsDaily] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') AS date_label,
        total,
        cart_items
      FROM bookings
      WHERE deleted_at IS NULL AND (status = 'completed' OR payment_status = 'paid')
        ${revenueTimeConstraint}
    `);
    bookingsDaily.forEach((row) => {
      let key = row.date_label;
      if (revenueRange === "year") key = `Tháng ${String(row.date_label).padStart(2, "0")}`;
      if (dailyDataMap[key]) {
        dailyDataMap[key].revenue += Number(row.total || 0);

        const cartItems = parseJson(row.cart_items, []);
        let bookingCost = 0;
        cartItems.forEach((item) => {
          const itemKey = String(item.id || item.code || item.name || "").toLowerCase();
          const matched = menuMap[itemKey];
          const cost = matched ? Number(matched.cost_price || 0) : 0;
          bookingCost += cost * Number(item.qty || 0);
        });
        dailyDataMap[key].cost += bookingCost;
      }
    });

    const dailyLabels = dateLabelsGenerator;
    const dailyRevenues = [];
    const dailyProfits = [];

    dailyLabels.forEach((label) => {
      const dayData = dailyDataMap[label] || { revenue: 0, cost: 0 };
      dailyRevenues.push(Math.round(dayData.revenue));
      dailyProfits.push(Math.round(dayData.revenue - dayData.cost));
    });

    const isStaff = req.user.role === "staff";

    res.json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers),
        totalOrders: Number(totalOrders),
        totalBookings: Number(totalBookings),
        totalRevenue: isStaff ? 0 : totalRevenue,
        totalProfit: isStaff ? 0 : totalProfit,
        totalBookingGuests: Number(totalBookingGuests),
        activeMenuItems: Number(activeMenuItems),
        orderStatusBreakdown,
        latestOrders: latestOrderRows.map((row) => ({
          ...row,
          total: isStaff ? 0 : Number(row.total),
        })),
        latestBookings: latestBookingRows.map((row) => ({
          ...row,
          id: String(row.id),
        })),
        bestFoods: bestFoodRows.map((row) => ({
          id: String(row.id),
          name: row.name,
          image: row.image,
          qty: Number(row.qty),
          price: Number(row.price || 0),
        })),
        categoryRevenue: isStaff
          ? []
          : categoryRevenueRows.map((row) => ({
              name: row.name,
              revenue: Number(row.revenue),
            })),
        dailyLabels: isStaff ? [] : dailyLabels,
        dailyRevenues: isStaff ? [] : dailyRevenues,
        dailyProfits: isStaff ? [] : dailyProfits,
        growths: {
          revenue: isStaff ? "0.0%" : revenueGrowth,
          orders: ordersGrowth,
          bookings: bookingsGrowth,
          users: usersGrowth,
          profit: isStaff ? "0.0%" : profitGrowth,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi tổng hợp thống kê dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi tổng hợp thống kê dashboard",
      error: error.message,
    });
  }
});
router.get(
  "/notifications",
  requireAuth,
  requireBackOffice,
  async (req, res) => {
    try {
      // 1. Lấy danh sách đặt bàn mới (pending) từ ngày hôm nay trở đi
      const [bookings] = await db.query(
        "SELECT id, customer_name, booking_code, booking_date, booking_time, created_at FROM bookings WHERE deleted_at IS NULL AND status = 'pending' AND booking_date >= CURDATE() ORDER BY created_at DESC",
      );

      // 2. Lấy danh sách đơn hàng mới (pending) được tạo trong 24 giờ gần nhất
      const [orders] = await db.query(
        "SELECT id, order_code, customer_name, total, created_at FROM orders WHERE status = 'pending' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY created_at DESC",
      );

      const notifications = [];
      bookings.forEach((b) => {
        const dateStr = b.booking_date
          ? new Date(b.booking_date).toLocaleDateString("vi-VN")
          : "";
        notifications.push({
          id: `booking-${b.id}`,
          type: "booking",
          title: "Đặt bàn mới",
          link: "/admin/bookings",
          createdAt: b.created_at,
          details: {
            customerName: b.customer_name,
            time: b.booking_time,
            date: dateStr,
            bookingCode: b.booking_code || `DB${b.id}`,
          },
        });
      });

      orders.forEach((o) => {
        notifications.push({
          id: `order-${o.id}`,
          type: "order",
          title: "Đơn hàng mới",
          link: "/admin/orders",
          createdAt: o.created_at,
          details: {
            orderCode: o.order_code || o.id,
            customerName: o.customer_name || "Khách vãng lai",
            total: o.total,
          },
        });
      });
      // Sắp xếp theo thời gian giảm dần
      notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      res.json({
        success: true,
        notifications,
      });
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy thông báo",
        error: error.message,
      });
    }
  },
);

module.exports = router;
