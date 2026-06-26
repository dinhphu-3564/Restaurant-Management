const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const db = require("./src/config/db");
const adminMenuRoutes = require("./src/routes/adminMenuRoutes");
const menuRoutes = require("./src/routes/menuRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin/menu-items", adminMenuRoutes);
app.use("/api/menu-items", menuRoutes);
app.use("/api/orders", orderRoutes);

const PORT = 5001;
const ORDERS_FILE = path.join(__dirname, "orders.json");
const DEALS_FILE = path.join(__dirname, "deals.json");

function readOrders() {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]");
  }

  return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

//hàm đọc/ghi deals
function readDeals() {
  if (!fs.existsSync(DEALS_FILE)) {
    fs.writeFileSync(DEALS_FILE, "[]");
  }

  return JSON.parse(fs.readFileSync(DEALS_FILE, "utf8"));
}

function writeDeals(deals) {
  fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
}

//hàm cập nhật thống kê mã
function updateDealUsage(appliedCoupon, couponDiscountTotal) {
  if (!appliedCoupon?.code || Number(couponDiscountTotal || 0) <= 0) {
    return;
  }

  const deals = readDeals();

  const dealIndex = deals.findIndex(
    (deal) =>
      String(deal.code || "").toUpperCase() ===
      String(appliedCoupon.code || "").toUpperCase(),
  );

  if (dealIndex === -1) return;

  const today = new Date().toISOString().slice(0, 10);
  const discountAmount = Number(couponDiscountTotal || 0);

  const usageHistory = Array.isArray(deals[dealIndex].usageHistory)
    ? deals[dealIndex].usageHistory
    : [];

  const historyIndex = usageHistory.findIndex((item) => item.date === today);

  if (historyIndex !== -1) {
    usageHistory[historyIndex] = {
      ...usageHistory[historyIndex],
      count: Number(usageHistory[historyIndex].count || 0) + 1,
      discountTotal:
        Number(usageHistory[historyIndex].discountTotal || 0) + discountAmount,
    };
  } else {
    usageHistory.push({
      date: today,
      count: 1,
      discountTotal: discountAmount,
    });
  }

  deals[dealIndex] = {
    ...deals[dealIndex],
    used: Number(deals[dealIndex].used || 0) + 1,
    totalDiscount: Number(deals[dealIndex].totalDiscount || 0) + discountAmount,
    usageHistory,
    updatedAt: new Date().toISOString(),
  };

  writeDeals(deals);
}

function parseJsonValue(value, fallback = null) {
  if (!value) return fallback;

  try {
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function recalculateDealStatsFromOrders() {
  const deals = readDeals();

  const [orders] = await db.query(`
    SELECT 
      order_code,
      applied_coupon,
      coupon_discount_total,
      created_at,
      updated_at
    FROM orders
  `);

  const recalculatedDeals = deals.map((deal) => {
    const dealCode = String(deal.code || "").toUpperCase();

    const matchedOrders = orders.filter((order) => {
      const appliedCoupon = parseJsonValue(order.applied_coupon, {});
      const couponCode = String(appliedCoupon?.code || "").toUpperCase();
      const discount = Number(order?.coupon_discount_total || 0);

      return couponCode === dealCode && discount > 0;
    });

    const usageHistoryMap = {};

    matchedOrders.forEach((order) => {
      const date = String(
        order?.created_at || order?.updated_at || new Date().toISOString(),
      ).slice(0, 10);

      const discount = Number(order?.coupon_discount_total || 0);

      if (!usageHistoryMap[date]) {
        usageHistoryMap[date] = {
          date,
          count: 0,
          discountTotal: 0,
        };
      }

      usageHistoryMap[date].count += 1;
      usageHistoryMap[date].discountTotal += discount;
    });

    const usageHistory = Object.values(usageHistoryMap).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    );

    return {
      ...deal,
      used: matchedOrders.length,
      totalDiscount: matchedOrders.reduce(
        (sum, order) => sum + Number(order?.coupon_discount_total || 0),
        0,
      ),
      usageHistory,
      updatedAt: new Date().toISOString(),
    };
  });

  writeDeals(recalculatedDeals);

  return recalculatedDeals;
}

//cấu hình upload ảnh
const uploadDir = path.join(__dirname, "uploads", "deals");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const dealStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `deal-${Date.now()}${ext}`);
  },
});

const uploadDealImage = multer({
  storage: dealStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend SePay is running",
  });
});

// Tạo đơn hàng
// app.post("/api/orders", (req, res) => {
//   const orders = readOrders();

//   const order = {
//     ...req.body,
//     id: req.body.id || "DH" + Date.now(),
//     status: "Chờ xác nhận",
//     paymentStatus: req.body.paymentMethod === "cash" ? "unpaid" : "pending",
//     createdAt: new Date().toISOString(),
//   };

//   orders.unshift(order);
//   writeOrders(orders);

//   updateDealUsage(order.appliedCoupon, order.couponDiscountTotal);

//   res.status(201).json({
//     success: true,
//     order,
//   });
// });

// // Lấy danh sách đơn hàng
// app.get("/api/orders", (req, res) => {
//   const orders = readOrders();

//   res.json({
//     success: true,
//     orders,
//   });
// });

// // Lấy chi tiết đơn hàng
// app.get("/api/orders/:id", (req, res) => {
//   const orders = readOrders();
//   const order = orders.find(
//     (item) => String(item.id) === String(req.params.id),
//   );

//   if (!order) {
//     return res.status(404).json({
//       success: false,
//       message: "Không tìm thấy đơn hàng",
//     });
//   }

//   res.json({
//     success: true,
//     order,
//   });
// });

// // Cập nhật đơn hàng
// app.patch("/api/orders/:id", (req, res) => {
//   const { id } = req.params;
//   const updates = req.body;

//   const orders = readOrders();

//   const index = orders.findIndex((order) => String(order.id) === String(id));

//   if (index === -1) {
//     return res.status(404).json({
//       success: false,
//       message: "Không tìm thấy đơn hàng",
//     });
//   }

//   orders[index] = {
//     ...orders[index],
//     ...updates,
//     updatedAt: updates.updatedAt || new Date().toISOString(),
//   };

//   writeOrders(orders);

//   res.json({
//     success: true,
//     order: orders[index],
//   });
// });
//API deals
// Upload ảnh khuyến mãi
app.post("/api/deals/upload", uploadDealImage.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Chưa có ảnh được upload",
    });
  }

  res.json({
    success: true,
    imageUrl: `http://localhost:${PORT}/uploads/deals/${req.file.filename}`,
  });
});

// Lấy danh sách khuyến mãi
app.get("/api/deals", (req, res) => {
  const deals = readDeals();

  res.json({
    success: true,
    deals,
  });
});

// Thêm khuyến mãi
app.post("/api/deals", (req, res) => {
  const deals = readDeals();

  const newDeal = {
    ...req.body,
    id: req.body.id || Date.now(),
    createdAt: new Date().toISOString(),
  };

  deals.unshift(newDeal);
  writeDeals(deals);

  res.status(201).json({
    success: true,
    deal: newDeal,
  });
});

// Cập nhật khuyến mãi
app.patch("/api/deals/:id", (req, res) => {
  const deals = readDeals();
  const index = deals.findIndex(
    (deal) => String(deal.id) === String(req.params.id),
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy khuyến mãi",
    });
  }

  deals[index] = {
    ...deals[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  writeDeals(deals);

  res.json({
    success: true,
    deal: deals[index],
  });
});

// Xóa khuyến mãi
app.delete("/api/deals/:id", (req, res) => {
  const deals = readDeals();

  const newDeals = deals.filter(
    (deal) => String(deal.id) !== String(req.params.id),
  );

  writeDeals(newDeals);

  res.json({
    success: true,
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
      SELECT order_code, payment_content
      FROM orders
      WHERE payment_status != 'paid'
      ORDER BY created_at DESC
    `);

    const matchedOrder = orders.find((order) => {
      const orderCode = String(
        order.payment_content || order.order_code || "",
      ).replace(/[^A-Z0-9]/gi, "");

      return paymentContent.includes(orderCode);
    });

    if (matchedOrder) {
      await db.query(
        `
        UPDATE orders
SET
  payment_method = 'bank',
  payment_status = 'paid',
  status = 'pending',
  paid_at = NOW(),
  sepay_transaction = ?,
  sepay_amount = ?,
  updated_at = NOW()
WHERE order_code = ?
        `,
        [JSON.stringify(payment), transferAmount, matchedOrder.order_code],
      );

      console.log("Đã cập nhật đơn:", matchedOrder.order_code);
    } else {
      console.log("Không tìm thấy đơn phù hợp:", paymentContent);
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

app.post("/api/deals/recalculate-stats", async (req, res) => {
  try {
    const deals = await recalculateDealStatsFromOrders();

    res.json({
      success: true,
      message: "Đã tính lại thống kê khuyến mãi từ đơn hàng.",
      deals,
    });
  } catch (error) {
    console.error("Lỗi tính lại thống kê:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi tính lại thống kê khuyến mãi.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
