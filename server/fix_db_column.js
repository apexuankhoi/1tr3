require('dotenv').config();
const db = require('./config/db');

async function fix() {
    try {
        console.log("Đang thêm cột updated_at vào bảng user_pots...");
        await db.query(`
            ALTER TABLE user_pots 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
        console.log("✅ Thành công! Đã thêm cột updated_at.");
        process.exit(0);
    } catch (err) {
        // If IF NOT EXISTS is not supported by the mysql version, handle duplicate column error
        if (err.errno === 1060) {
            console.log("⚠️ Cột updated_at đã tồn tại rồi.");
            process.exit(0);
        }
        console.error("❌ Lỗi:", err.message);
        process.exit(1);
    }
}

fix();
