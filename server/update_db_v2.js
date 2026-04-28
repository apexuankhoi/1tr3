const db = require('./config/db');

async function migrate() {
    console.log('--- Bắt đầu cập nhật Database (V2) ---');
    try {
        // 1. Cập nhật bảng user_pots
        console.log('1. Cập nhật bảng user_pots...');
        
        // Thêm các cột mới nếu chưa có
        const addCols = [
            "ALTER TABLE user_pots ADD COLUMN plant_type VARCHAR(50) DEFAULT 'cafe'",
            "ALTER TABLE user_pots ADD COLUMN growth_progress INT DEFAULT 0",
            "ALTER TABLE user_pots ADD COLUMN is_wilted BOOLEAN DEFAULT FALSE",
            "ALTER TABLE user_pots ADD COLUMN skin_id VARCHAR(50) DEFAULT 'default'",
            "ALTER TABLE user_pots ADD COLUMN has_pot BOOLEAN DEFAULT FALSE"
        ];

        for (const sql of addCols) {
            try { await db.query(sql); } catch (e) { /* console.log('Skip:', sql); */ }
        }

        // Xóa các cột cũ
        const dropCols = [
            "ALTER TABLE user_pots DROP COLUMN water_level",
            "ALTER TABLE user_pots DROP COLUMN fertilizer_level"
        ];
        for (const sql of dropCols) {
            try { await db.query(sql); } catch (e) { /* console.log('Skip:', sql); */ }
        }

        // 2. Cập nhật bảng users
        console.log('2. Cập nhật bảng users...');
        try {
            await db.query("ALTER TABLE users ADD COLUMN last_activity_date DATE DEFAULT NULL");
            await db.query("ALTER TABLE users ADD COLUMN last_lat DOUBLE DEFAULT NULL");
            await db.query("ALTER TABLE users ADD COLUMN last_lng DOUBLE DEFAULT NULL");
            await db.query("ALTER TABLE users ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        } catch (e) {}

        // 3. Cập nhật bảng shop_items để phân loại
        console.log('3. Cập nhật bảng shop_items...');
        try {
            await db.query("ALTER TABLE shop_items ADD COLUMN item_type VARCHAR(50) DEFAULT 'general'");
        } catch (e) {}

        console.log('✅ Cập nhật Database thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi cập nhật Database:', error.message);
        process.exit(1);
    }
}

migrate();
