require('dotenv').config();
const db = require('./config/db');

async function fix() {
    try {
        console.log("Đang nâng cấp bảng library để hỗ trợ Video...");
        
        // Thêm cột type (image/video)
        try {
            await db.query(`ALTER TABLE library ADD COLUMN type VARCHAR(20) DEFAULT 'image'`);
            console.log("✅ Đã thêm cột 'type'");
        } catch (e) { console.log("⚠️ Cột 'type' đã tồn tại."); }

        // Thêm cột video_url
        try {
            await db.query(`ALTER TABLE library ADD COLUMN video_url TEXT`);
            console.log("✅ Đã thêm cột 'video_url'");
        } catch (e) { console.log("⚠️ Cột 'video_url' đã tồn tại."); }

        console.log("✨ Nâng cấp Database hoàn tất!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi:", err.message);
        process.exit(1);
    }
}

fix();
