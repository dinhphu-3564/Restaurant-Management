const express = require("express");
const db = require("../config/db");
const { getIO } = require("../config/socket");
const { createActivityLog } = require("../utils/activityLog");
const { requireAuth, requireStaffOrHigher, requireCashierOrHigher } = require("../middleware/authMiddleware");

const router = express.Router();

function parseJson(value, fallback = null) {
  if (!value) return fallback;

  try {
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatDateTime(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function toMysqlDateTime(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 19).replace("T", " ");
}

function safeNumber(value, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));

  return Number.isFinite(number) ? number : fallback;
}
//kiểm tra số lượt sử dụng mã
function toJsonString(value, fallback) {
  try {
    return JSON.stringify(value ?? fallback);
  } catch {
    return JSON.stringify(fallback);
  }
}

function formatDateOnly(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

async function consumeDealUsage(
  connection,
  appliedCoupon,
  couponDiscountTotal,
) {
  const discountAmount = safeNumber(couponDiscountTotal);

  if (!appliedCoupon?.code || discountAmount <= 0) {
    return {
      success: true,
    };
  }

  const couponCode = String(appliedCoupon.code || "")
    .trim()
    .toUpperCase();

  const [dealRows] = await connection.query(
    `
    SELECT
      id,
      code,
      status,
      usage_limit,
      used_count,
      total_discount,
      usage_history
    FROM deals
    WHERE UPPER(code) = UPPER(?)
    LIMIT 1
    FOR UPDATE
    `,
    [couponCode],
  );

  if (dealRows.length === 0) {
    return {
      success: false,
      status: 404,
      message: "Mã ưu đãi không tồn tại.",
    };
  }

  const deal = dealRows[0];

  if (deal.status !== "active") {
    return {
      success: false,
      status: 400,
      message: "Mã ưu đãi hiện không còn hiệu lực.",
    };
  }

  const usageLimit = Number(deal.usage_limit || 0);
  const usedCount = Number(deal.used_count || 0);

  if (usageLimit > 0 && usedCount >= usageLimit) {
    return {
      success: false,
      status: 409,
      message: "Mã ưu đãi đã hết lượt sử dụng.",
    };
  }

  const today = formatDateOnly(new Date());
  const usageHistory = parseJson(deal.usage_history, []);

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

  await connection.query(
    `
    UPDATE deals
    SET
      used_count = used_count + 1,
      total_discount = COALESCE(total_discount, 0) + ?,
      usage_history = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [discountAmount, toJsonString(usageHistory, []), deal.id],
  );

  return {
    success: true,
  };
}

function mapOrder(row, items = []) {
  const appliedCoupon = parseJson(row.applied_coupon, null);
  const sepayTransaction = parseJson(row.sepay_transaction, null);
  const rawData = parseJson(row.raw_data, {});

  const cartItems = items.map((item) => ({
    id: item.menu_item_code,
    code: item.menu_item_code,
    name: item.name,
    image: item.image,
    price: Number(item.price || 0),
    qty: Number(item.qty || 1),
    note: item.note || "",
  }));

  return {
    ...rawData,
    dbId: row.id,
    id: row.order_code,

    customerName:
      row.customer_name || rawData.customerName || rawData.name || "",
    fullName: row.customer_name || rawData.fullName || rawData.name || "",
    name: row.customer_name || rawData.name || "",
    phone: row.phone || rawData.phone || "",
    email: row.email || rawData.email || "",

    serviceType: row.service_type || rawData.serviceType || rawData.type || "",
    type: row.service_type || rawData.type || "",
    table: row.table_code || rawData.table || "",
    tableCode: row.table_code || rawData.tableCode || "",
    guests: Number(row.guests || rawData.guests || 0),
    address: row.address || rawData.address || "",
    receiver: row.receiver || rawData.receiver || "",

    paymentMethod: row.payment_method || rawData.paymentMethod || "",
    paymentStatus: row.payment_status || rawData.paymentStatus || "",
    status: row.status || rawData.status || "pending",

    subtotal: Number(row.subtotal || rawData.subtotal || 0),
    shippingFee: Number(row.shipping_fee || rawData.shippingFee || 0),
    discountTotal: Number(row.discount_total || rawData.discountTotal || 0),
    couponDiscountTotal: Number(
      row.coupon_discount_total || rawData.couponDiscountTotal || 0,
    ),
    total: Number(row.total || rawData.total || rawData.totalPrice || 0),
    totalPrice: Number(row.total || rawData.totalPrice || rawData.total || 0),

    appliedCoupon,
    paymentContent: row.payment_content || rawData.paymentContent || "",
    sepayTransaction,
    sepayAmount: Number(row.sepay_amount || rawData.sepayAmount || 0),
    paidAt: formatDateTime(row.paid_at) || rawData.paidAt || null,

    cartItems,
    items: cartItems,
    images: cartItems.map((item) => item.image).filter(Boolean),

    note: rawData.note || "",
    createdAt: formatDateTime(row.created_at) || rawData.createdAt || null,
    updatedAt: formatDateTime(row.updated_at) || rawData.updatedAt || null,
  };
}

async function getOrderByCode(orderCode) {
  const [orderRows] = await db.query(
    `
    SELECT *
    FROM orders
    WHERE order_code = ?
    LIMIT 1
    `,
    [orderCode],
  );

  if (orderRows.length === 0) return null;

  const order = orderRows[0];

  const [itemRows] = await db.query(
    `
    SELECT *
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
    `,
    [order.id],
  );

  const [paymentRows] = await db.query(
    `
    SELECT *
    FROM order_payments
    WHERE order_id = ?
    ORDER BY created_at ASC
    `,
    [order.id],
  );

  const mappedOrder = mapOrder(order, itemRows);
  mappedOrder.payments = paymentRows;
  
  const totalPaid = paymentRows.reduce((sum, p) => sum + Number(p.amount), 0);
  mappedOrder.totalPaid = totalPaid;
  mappedOrder.remainingAmount = Math.max(0, mappedOrder.total - totalPaid);

  return mappedOrder;
}

// Lấy danh sách đơn hàng
router.get("/", requireAuth, requireStaffOrHigher, async (req, res) => {
  try {
    const [orderRows] = await db.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `);

    const orderIds = orderRows.map((order) => order.id);

    let itemRows = [];

    if (orderIds.length > 0) {
      const [rows] = await db.query(
        `
        SELECT *
        FROM order_items
        WHERE order_id IN (?)
        ORDER BY id ASC
        `,
        [orderIds],
      );

      itemRows = rows;
    }

    let paymentRows = [];
    if (orderIds.length > 0) {
      const [pRows] = await db.query(
        `
        SELECT *
        FROM order_payments
        WHERE order_id IN (?)
        ORDER BY created_at DESC
        `,
        [orderIds],
      );
      paymentRows = pRows;
    }

    const itemMap = itemRows.reduce((map, item) => {
      if (!map[item.order_id]) map[item.order_id] = [];
      map[item.order_id].push(item);
      return map;
    }, {});

    const paymentMap = paymentRows.reduce((map, payment) => {
      if (!map[payment.order_id]) map[payment.order_id] = [];
      map[payment.order_id].push(payment);
      return map;
    }, {});

    const orders = orderRows.map((order) => {
      const mapped = mapOrder(order, itemMap[order.id] || []);
      const payments = paymentMap[order.id] || [];
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      
      mapped.payments = payments;
      mapped.totalPaid = totalPaid;
      mapped.remainingAmount = Math.max(0, mapped.total - totalPaid);
      return mapped;
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
});

// Lấy lịch sử đơn hàng của tài khoản đang đăng nhập
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [allOrderRows] = await db.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `);

    const orderRows = allOrderRows.filter((order) => {
      const rawData = parseJson(order.raw_data, {});

      const sameUserId =
        rawData.userId && String(rawData.userId) === String(req.user.id);

      const sameEmail =
        order.email &&
        req.user.email &&
        String(order.email).toLowerCase() ===
          String(req.user.email).toLowerCase();

      const samePhone =
        order.phone &&
        req.user.phone &&
        String(order.phone) === String(req.user.phone);

      return sameUserId || sameEmail || samePhone;
    });

    const orderIds = orderRows.map((order) => order.id);

    let itemRows = [];

    if (orderIds.length > 0) {
      const [rows] = await db.query(
        `
        SELECT *
        FROM order_items
        WHERE order_id IN (?)
        ORDER BY id ASC
        `,
        [orderIds],
      );

      itemRows = rows;
    }

    const itemMap = itemRows.reduce((map, item) => {
      if (!map[item.order_id]) map[item.order_id] = [];
      map[item.order_id].push(item);
      return map;
    }, {});

    const orders = orderRows.map((order) =>
      mapOrder(order, itemMap[order.id] || []),
    );

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử đơn hàng của tôi:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử đơn hàng.",
      error: error.message,
    });
  }
});

// Lấy chi tiết đơn hàng của tài khoản đang đăng nhập
router.get("/me/:id", requireAuth, async (req, res) => {
  try {
    const order = await getOrderByCode(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    const sameUserId =
      order.userId && String(order.userId) === String(req.user.id);

    const sameEmail =
      order.email &&
      req.user.email &&
      String(order.email).toLowerCase() ===
        String(req.user.email).toLowerCase();

    const samePhone =
      order.phone &&
      req.user.phone &&
      String(order.phone) === String(req.user.phone);

    if (!sameUserId && !sameEmail && !samePhone) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này.",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng của tôi:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết đơn hàng.",
      error: error.message,
    });
  }
});

// Lấy chi tiết đơn hàng
router.get("/:id", requireAuth, requireStaffOrHigher, async (req, res) => {
  try {
    const order = await getOrderByCode(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
});

// Tạo đơn hàng
router.post("/", requireAuth, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const body = req.body;
    const orderCode = body.id || `DH${Date.now()}`;

    const cartItems = Array.isArray(body.cartItems)
      ? body.cartItems
      : Array.isArray(body.items)
        ? body.items
        : [];

    const status = body.status || "pending";

    const paymentStatus =
      body.paymentStatus ||
      (body.paymentMethod === "cash" ? "unpaid" : "pending");

    const paymentMethod =
      body.paymentMethod ||
      (body.paymentStatus === "pending_payment" ? "bank" : "");

    const appliedCoupon = body.appliedCoupon || null;
    const couponDiscountTotal = safeNumber(body.couponDiscountTotal);

    const dealUsageResult = await consumeDealUsage(
      connection,
      appliedCoupon,
      couponDiscountTotal,
    );

    if (!dealUsageResult.success) {
      await connection.rollback();

      return res.status(dealUsageResult.status || 400).json({
        success: false,
        message: dealUsageResult.message || "Không thể sử dụng mã ưu đãi.",
      });
    }

    await connection.query(
      `
      INSERT INTO orders (
        order_code,
        customer_name,
        phone,
        email,
        service_type,
        table_code,
        guests,
        address,
        receiver,
        payment_method,
        payment_status,
        status,
        subtotal,
        shipping_fee,
        discount_total,
        coupon_discount_total,
        total,
        applied_coupon,
        payment_content,
        sepay_transaction,
        sepay_amount,
        paid_at,
        raw_data,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderCode,
        body.customerName || body.fullName || body.name || body.receiver || "",
        body.phone || "",
        body.email || "",
        body.serviceType || body.type || "",
        body.table || body.tableCode || "",

        safeNumber(body.guests),
        body.address || "",
        body.receiver || body.name || "",

        paymentMethod,
        paymentStatus,
        status,

        safeNumber(body.subtotal),
        safeNumber(body.shippingFee),
        safeNumber(body.discountTotal),
        safeNumber(body.couponDiscountTotal),
        safeNumber(body.total || body.totalPrice),

        toJsonString(appliedCoupon, null),
        body.paymentContent || "",
        JSON.stringify(body.sepayTransaction || null),
        safeNumber(body.sepayAmount),
        toMysqlDateTime(body.paidAt),

        JSON.stringify({
          ...body,
          id: orderCode,
          status,
          paymentMethod,
          paymentStatus,
        }),

        toMysqlDateTime(body.createdAt) || toMysqlDateTime(new Date()),
        toMysqlDateTime(body.updatedAt) || toMysqlDateTime(new Date()),
      ],
    );

    const [orderRows] = await connection.query(
      "SELECT id FROM orders WHERE order_code = ? LIMIT 1",
      [orderCode],
    );

    const orderDbId = orderRows[0].id;

    for (const item of cartItems) {
      await connection.query(
        `
        INSERT INTO order_items (
          order_id,
          menu_item_code,
          name,
          image,
          price,
          qty,
          note,
          raw_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderDbId,
          item.id || item.code || item.menuItemCode || "",
          item.name || "",
          item.image || "",
          safeNumber(item.price),
          safeNumber(item.qty || item.quantity, 1),
          item.note || "",
          JSON.stringify(item),
        ],
      );
    }

    await connection.commit();

    const order = await getOrderByCode(orderCode);

    if (appliedCoupon && appliedCoupon.code) {
      await createActivityLog({
        targetUserId: req.user.id,
        actorUserId: req.user.id,
        action: "apply_discount",
        message: `Đã áp dụng mã giảm giá ${appliedCoupon.code} cho đơn hàng ${orderCode}`,
      }).catch(err => console.error("Log error:", err));
    }

    try {
      getIO().emit("new_order", order);
    } catch (socketErr) {
      console.error("Socket error:", socketErr);
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Lỗi tạo đơn hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// Cập nhật đơn hàng
router.patch("/:id", requireAuth, requireStaffOrHigher, async (req, res) => {
  try {
    const orderCode = req.params.id;
    const updates = req.body;

    if (["staff", "waiter", "cashier", "chef"].includes(req.user.role)) {
      let allowedKeys = [];
      if (req.user.role === "chef") {
        allowedKeys = ["status", "updatedAt", "updated_at", "note"];
      } else if (req.user.role === "waiter") {
        allowedKeys = ["status", "paymentStatus", "payment_status", "updatedAt", "updated_at", "note"];
      } else {
        // staff or cashier
        allowedKeys = ["status", "paymentStatus", "paymentMethod", "payment_status", "payment_method", "updatedAt", "updated_at", "note"];
      }

      const requestedKeys = Object.keys(updates).filter((k) => updates[k] !== undefined);
      const isViolation = requestedKeys.some((k) => !allowedKeys.includes(k));
      if (isViolation) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "Bạn không có quyền cập nhật trường thông tin này.",
        });
      }
    }

    const currentOrder = await getOrderByCode(orderCode);

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const nextStatus = updates.status || currentOrder.status;
    const nextPaymentStatus = updates.paymentStatus || currentOrder.paymentStatus;

    if (nextStatus === "completed" && nextPaymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Không thể hoàn thành đơn hàng chưa thanh toán đủ.",
      });
    }

    const mergedRawData = {
      ...currentOrder,
      ...updates,
      id: orderCode,
      updatedAt: updates.updatedAt || new Date().toISOString(),
    };

    await db.query(
      `
      UPDATE orders
      SET
        status = COALESCE(?, status),
        payment_method = COALESCE(?, payment_method),
        payment_status = COALESCE(?, payment_status),
        raw_data = ?,
        updated_at = ?
      WHERE order_code = ?
      `,
      [
        updates.status || null,
        updates.paymentMethod || null,
        updates.paymentStatus || null,
        JSON.stringify(mergedRawData),
        toMysqlDateTime(updates.updatedAt) || toMysqlDateTime(new Date()),
        orderCode,
      ],
    );

    const order = await getOrderByCode(orderCode);

    if (updates.status === "cancelled" && currentOrder.status !== "cancelled") {
      await createActivityLog({
        targetUserId: req.user.id,
        actorUserId: req.user.id,
        action: "cancel_order",
        message: `Đã hủy đơn hàng ${orderCode}`,
      }).catch(err => console.error("Log error:", err));
    } else {
      await createActivityLog({
        targetUserId: req.user.id,
        actorUserId: req.user.id,
        action: "edit_order",
        message: `Đã cập nhật đơn hàng ${orderCode}`,
      }).catch(err => console.error("Log error:", err));
    }

    try {
      getIO().emit("order_updated", order);
    } catch (socketErr) {
      console.error("Socket error:", socketErr);
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Lỗi cập nhật đơn hàng:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật đơn hàng",
      error: error.message,
    });
  }
});

// Thêm thanh toán (chia bill / trả trước)
router.post("/:id/payments", requireAuth, requireCashierOrHigher, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const orderCode = req.params.id;
    const { amount, paymentMethod, transactionId, note } = req.body;
    const payAmount = Number(amount || 0);

    if (payAmount <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Số tiền không hợp lệ." });
    }

    const currentOrder = await getOrderByCode(orderCode);
    if (!currentOrder) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    // Insert payment
    await connection.query(
      `
      INSERT INTO order_payments (order_id, amount, payment_method, transaction_id, note)
      VALUES (?, ?, ?, ?, ?)
      `,
      [currentOrder.dbId, payAmount, paymentMethod || 'cash', transactionId || null, note || '']
    );

    // Re-evaluate total paid
    const [paymentRows] = await connection.query(
      "SELECT amount FROM order_payments WHERE order_id = ?",
      [currentOrder.dbId]
    );
    const newTotalPaid = paymentRows.reduce((sum, p) => sum + Number(p.amount), 0);

    if (newTotalPaid >= currentOrder.total) {
      if (currentOrder.paymentStatus !== "paid") {
        await connection.query(
          "UPDATE orders SET payment_status = ?, payment_method = ? WHERE id = ?",
          ["paid", paymentMethod || 'cash', currentOrder.dbId]
        );
      }
    } else {
      if (currentOrder.paymentStatus === "pending") {
        await connection.query(
          "UPDATE orders SET payment_status = ?, payment_method = ? WHERE id = ?",
          ["partial", paymentMethod || 'cash', currentOrder.dbId]
        );
      }
    }

    await connection.commit();

    await createActivityLog({
      targetUserId: req.user.id,
      actorUserId: req.user.id,
      action: "add_payment",
      message: `Đã thanh toán ${payAmount.toLocaleString("vi-VN")}đ cho đơn hàng ${orderCode}`,
    }).catch(err => console.error("Log error:", err));

    const updatedOrder = await getOrderByCode(orderCode);

    try {
      getIO().emit("order_updated", updatedOrder);
    } catch (socketErr) {
      console.error("Socket error:", socketErr);
    }

    res.json({
      success: true,
      message: "Thêm thanh toán thành công.",
      order: updatedOrder
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi thêm thanh toán:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm thanh toán",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
