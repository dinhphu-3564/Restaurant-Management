const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function run() {
  try {
    const sqlPath = path.join(__dirname, "add_revenue_fields.sql");
    const rawSql = fs.readFileSync(sqlPath, "utf8");
    const statements = rawSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (let stmt of statements) {
      console.log(`Đang chạy: ${stmt}`);
      try {
        await db.query(stmt);
      } catch (err) {
        if (err.code === "ER_DUP_FIELDNAME") {
          console.log("Cột đã tồn tại, bỏ qua.");
        } else {
          throw err;
        }
      }
    }
    console.log("Migration thêm trường doanh thu hoàn tất!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
}

run();
