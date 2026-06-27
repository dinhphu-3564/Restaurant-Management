const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const firebaseAdmin = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/authMiddleware");
const { createActivityLog } = require("../utils/activityLog");
const crypto = require("crypto");
const { sendVerifyEmail } = require("../utils/mail");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

function mapUser(row) {
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
    createdAt: row.created_at,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || req.body.fullName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu tối thiểu 8 ký tự.",
      });
    }

    const [existedRows] = await db.query(
      `
  SELECT id
  FROM users
  WHERE deleted_at IS NULL
    AND (
      email = ?
      OR (phone IS NOT NULL AND phone != '' AND phone = ?)
    )
  LIMIT 1
  `,
      [email, phone],
    );

    if (existedRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email hoặc số điện thoại đã được đăng ký.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `
  INSERT INTO users (
  name,
  full_name,
  phone,
  email,
  password_hash,
  role,
  status,
  email_verified
)
VALUES (?, ?, ?, ?, ?, 'user', 'active', 0)
  `,
      [name, name, phone || null, email, passwordHash],
    );
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenHash = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    await db.query(
      `
  UPDATE users
  SET
    email_verify_token_hash = ?,
    email_verify_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
  WHERE id = ?
  `,
      [verifyTokenHash, result.insertId],
    );

    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${verifyToken}`;

    try {
      await sendVerifyEmail({
        to: email,
        name,
        verifyUrl,
      });
    } catch (mailError) {
      console.error("Lỗi gửi email xác thực:", mailError);
    }
    await createActivityLog({
      targetUserId: result.insertId,
      actorUserId: result.insertId,
      action: "account_created",
      oldValue: null,
      newValue: "user",
      message: "Tài khoản được tạo",
    });

    const [rows] = await db.query(
      `
  SELECT id, name, full_name, phone, email, address, avatar, role, status, email_verified, created_at
FROM users
WHERE id = ? AND deleted_at IS NULL
LIMIT 1
  `,
      [result.insertId],
    );

    const user = mapUser(rows[0]);
    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công.",
      token,
      user,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký.",
      error: error.message,
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const account = String(req.body.account || req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!account || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tài khoản và mật khẩu.",
      });
    }

    const [rows] = await db.query(
      `
  SELECT id, name, full_name, phone, email, address, avatar, password_hash, role, status, email_verified, created_at
  FROM users
  WHERE (email = ? OR phone = ?)
    AND deleted_at IS NULL
  LIMIT 1
  `,
      [account, account],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không đúng.",
      });
    }

    const userRow = rows[0];

    if (userRow.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa.",
      });
    }

    if (!userRow.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản này đang dùng đăng nhập Google/Facebook.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userRow.password_hash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không đúng.",
      });
    }

    if (!userRow.email_verified) {
      return res.status(403).json({
        success: false,
        message: "Vui lòng xác thực email trước khi đăng nhập.",
      });
    }

    const loginUser = mapUser(userRow);
    const token = createToken(loginUser);

    res.json({
      success: true,
      message: "Đăng nhập thành công.",
      token,
      user: loginUser,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập.",
      error: error.message,
    });
  }
});

// POST /api/auth/social-login
router.post("/social-login", async (req, res) => {
  try {
    const idToken = String(req.body.idToken || "");
    const provider = String(req.body.provider || "")
      .trim()
      .toLowerCase();

    if (!idToken || !provider) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đăng nhập mạng xã hội.",
      });
    }

    if (!["google", "facebook"].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Nhà cung cấp đăng nhập không hợp lệ.",
      });
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    const providerUid = decodedToken.uid;
    const email = String(decodedToken.email || "")
      .trim()
      .toLowerCase();

    const name =
      decodedToken.name ||
      decodedToken.displayName ||
      email.split("@")[0] ||
      "Người dùng";

    const avatar = decodedToken.picture || "";
    const phone = decodedToken.phone_number || "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản này chưa có email xác thực.",
      });
    }

    const [existedRows] = await db.query(
      `
  SELECT id, name, full_name, phone, email, address, avatar, role, status, email_verified, created_at
FROM users
  WHERE deleted_at IS NULL
    AND (
      email = ?
      OR (auth_provider = ? AND provider_uid = ?)
    )
  LIMIT 1
  `,
      [email, provider, providerUid],
    );

    let userRow;
    let isNewUser = false;

    if (existedRows.length > 0) {
      userRow = existedRows[0];

      if (userRow.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Tài khoản đã bị khóa.",
        });
      }

      await db.query(
        `
  UPDATE users
  SET
    name = COALESCE(NULLIF(name, ''), ?),
    full_name = COALESCE(NULLIF(full_name, ''), ?),
    avatar = COALESCE(NULLIF(avatar, ''), ?),
    auth_provider = ?,
    provider_uid = ?,
    email_verified = CASE
      WHEN ? = 1 THEN 1
      ELSE email_verified
    END,
    updated_at = NOW()
  WHERE id = ?
  `,
        [
          name,
          name,
          avatar,
          provider,
          providerUid,
          decodedToken.email_verified ? 1 : 0,
          userRow.id,
        ],
      );

      const [updatedRows] = await db.query(
        `
        SELECT id, name, full_name, phone, email, address, avatar, role, status, email_verified, created_at
FROM users
WHERE id = ?
        LIMIT 1
        `,
        [userRow.id],
      );

      userRow = updatedRows[0];
    } else {
      isNewUser = true;

      const [result] = await db.query(
        `
    INSERT INTO users (
  name,
  full_name,
  phone,
  email,
  avatar,
  password_hash,
  role,
  status,
  auth_provider,
  provider_uid,
  email_verified
)
VALUES (?, ?, ?, ?, ?, NULL, 'user', 'active', ?, ?, ?)
    `,
        [
          name,
          name,
          phone || null,
          email,
          avatar,
          provider,
          providerUid,
          decodedToken.email_verified ? 1 : 0,
        ],
      );

      const [rows] = await db.query(
        `
  SELECT id, name, full_name, phone, email, address, avatar, role, status, email_verified, created_at
FROM users
WHERE id = ?
  LIMIT 1
  `,
        [result.insertId],
      );
      await createActivityLog({
        targetUserId: result.insertId,
        actorUserId: result.insertId,
        action: "account_created",
        oldValue: null,
        newValue: "user",
        message: "Tài khoản được tạo bằng đăng nhập mạng xã hội",
      });
      userRow = rows[0];
    }

    const user = mapUser(userRow);
    const token = createToken(user);

    res.json({
      success: true,
      message: isNewUser
        ? "Đăng ký mạng xã hội thành công."
        : "Đăng nhập mạng xã hội thành công.",
      isNewUser,
      token,
      user,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập mạng xã hội:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập mạng xã hội.",
      error: error.message,
    });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// GET /api/auth/verify-email?token=...
router.get("/verify-email", async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã xác thực email.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [rows] = await db.query(
      `
      SELECT
        id,
        email,
        email_verified,
        email_verify_expires_at
      FROM users
      WHERE email_verify_token_hash = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [tokenHash],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Liên kết xác thực không hợp lệ.",
      });
    }

    const user = rows[0];

    if (user.email_verified) {
      return res.json({
        success: true,
        message: "Email này đã được xác thực trước đó.",
      });
    }

    const expiresAt = new Date(user.email_verify_expires_at);
    const now = new Date();

    if (!user.email_verify_expires_at || expiresAt <= now) {
      return res.status(400).json({
        success: false,
        message: "Liên kết xác thực đã hết hạn.",
      });
    }

    await db.query(
      `
      UPDATE users
      SET
        email_verified = 1,
        updated_at = NOW()
      WHERE id = ?
      `,
      [user.id],
    );

    await createActivityLog({
      targetUserId: user.id,
      actorUserId: user.id,
      action: "email_verified",
      oldValue: "0",
      newValue: "1",
      message: "Email đã được xác thực",
    });

    res.json({
      success: true,
      message: "Xác thực email thành công.",
    });
  } catch (error) {
    console.error("Lỗi xác thực email:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực email.",
      error: error.message,
    });
  }
});

module.exports = router;
