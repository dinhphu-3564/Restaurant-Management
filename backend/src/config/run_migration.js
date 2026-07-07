const fs = require("fs");
const path = require("path");
const db = require("./db");

async function runMigration() {
  console.log(
    "=== Bắt đầu chạy di chuyển dữ liệu (Migration) cho Không gian ===",
  );
  try {
    const sqlPath = path.join(__dirname, "create_spaces_tables.sql");
    const rawSql = fs.readFileSync(sqlPath, "utf8");

    // Clean comment lines and split statements by semicolon
    const statements = rawSql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && line.trim().length > 0)
      .join("\n")
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Đã phát hiện ${statements.length} câu lệnh SQL cần chạy...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(
        `[${i + 1}/${statements.length}] Đang thực thi: ${stmt.substring(0, 50)}...`,
      );
      await db.query(stmt);
    }

    console.log("✔️ Chạy di chuyển dữ liệu (Migration) THÀNH CÔNG!");
    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Lỗi trong quá trình chạy di chuyển dữ liệu (Migration):",
      error,
    );
    process.exit(1);
  }
}

runMigration();
