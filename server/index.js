const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// ── Gemini AI Setup ─────────────────────────────────────────────────────────
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

async function verifyTaskImage(imageUrl, taskTitle, taskDescription) {
    if (!genAI) {
        console.log('[AI] Gemini API key not configured, skipping verification');
        return { verified: true, confidence: 0, reason: 'AI verification not configured' };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        // Fetch the image as base64
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        const prompt = `Bạn là hệ thống xác minh hình ảnh cho ứng dụng nông nghiệp "Nông Nghiệp Xanh". 
Nhiệm vụ mà người dùng cần hoàn thành: "${taskTitle}"
Mô tả nhiệm vụ: "${taskDescription}"

Hãy phân tích hình ảnh và cho biết:
1. Hình ảnh có liên quan đến nhiệm vụ trên không? (true/false)
2. Mức độ tin cậy từ 0-100
3. Lý do ngắn gọn (bằng tiếng Việt)

Trả lời CHÍNH XÁC theo định dạng JSON (không markdown):
{"verified": true/false, "confidence": 0-100, "reason": "lý do"}`;
        
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType } }
        ]);
        
        const text = result.response.text().trim();
        // Parse JSON from response (handle possible markdown wrapper)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`[AI] Verification result for "${taskTitle}": verified=${parsed.verified}, confidence=${parsed.confidence}, reason=${parsed.reason}`);
            return parsed;
        }
        return { verified: true, confidence: 50, reason: 'Không thể phân tích phản hồi AI' };
    } catch (error) {
        console.error('[AI] Verification error:', error.message);
        return { verified: true, confidence: 0, reason: 'Lỗi xác minh AI: ' + error.message };
    }
}

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const PORT = process.env.PORT || 3000;

async function ensureUserColumns() {
    const [fullNameColumns] = await db.query("SHOW COLUMNS FROM users LIKE 'full_name'");
    if (fullNameColumns.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT '' AFTER password");
    }

    const [emailColumns] = await db.query("SHOW COLUMNS FROM users LIKE 'email'");
    if (emailColumns.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER full_name");
    }

    const [dobColumns] = await db.query("SHOW COLUMNS FROM users LIKE 'dob'");
    if (dobColumns.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN dob VARCHAR(50) AFTER email");
    }

    const [roleColumns] = await db.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (roleColumns.length > 0 && !String(roleColumns[0].Type).includes("buyer")) {
        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'buyer', 'moderator', 'admin') DEFAULT 'farmer'");
    }

    // Ensure tasks columns
    const [taskDescColumns] = await db.query("SHOW COLUMNS FROM tasks LIKE 'description'");
    if (taskDescColumns.length === 0) {
        await db.query("ALTER TABLE tasks ADD COLUMN description TEXT AFTER category");
    }
    const [taskIconColumns] = await db.query("SHOW COLUMNS FROM tasks LIKE 'icon'");
    if (taskIconColumns.length === 0) {
        await db.query("ALTER TABLE tasks ADD COLUMN icon VARCHAR(100) AFTER description");
    }

    // Ensure shop_items columns
    const [shopDescColumns] = await db.query("SHOW COLUMNS FROM shop_items LIKE 'description'");
    if (shopDescColumns.length === 0) {
        await db.query("ALTER TABLE shop_items ADD COLUMN description TEXT AFTER price");
    }

    // Đảm bảo có các cột chỉ số sinh trưởng trong bảng users
    const [coinsCols] = await db.query("SHOW COLUMNS FROM users LIKE 'coins'");
    if (coinsCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN coins INT DEFAULT 0 AFTER role");
    } else {
        await db.query("ALTER TABLE users MODIFY COLUMN coins INT DEFAULT 0");
    }

    const [waterCols] = await db.query("SHOW COLUMNS FROM users LIKE 'water_level'");
    if (waterCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN water_level FLOAT DEFAULT 0 AFTER coins");
    } else {
        await db.query("ALTER TABLE users MODIFY COLUMN water_level FLOAT DEFAULT 0");
    }

    const [energyCols] = await db.query("SHOW COLUMNS FROM users LIKE 'energy_level'");
    if (energyCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN energy_level FLOAT DEFAULT 1 AFTER water_level");
    } else {
        await db.query("ALTER TABLE users MODIFY COLUMN energy_level FLOAT DEFAULT 1");
    }

    const [growthCols] = await db.query("SHOW COLUMNS FROM users LIKE 'growth_stage'");
    if (growthCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN growth_stage VARCHAR(100) DEFAULT 'Nảy mầm' AFTER energy_level");
    } else {
        await db.query("ALTER TABLE users MODIFY COLUMN growth_stage VARCHAR(100) DEFAULT 'Nảy mầm'");
    }

    // Ensure Location columns for Map
    const [latCols] = await db.query("SHOW COLUMNS FROM users LIKE 'last_lat'");
    if (latCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN last_lat DOUBLE AFTER growth_stage, ADD COLUMN last_lng DOUBLE AFTER last_lat, ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_lng");
    }

    const [coverCols] = await db.query("SHOW COLUMNS FROM users LIKE 'cover_url'");
    if (coverCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN cover_url VARCHAR(255) AFTER avatar_url");
    }

    const [bioCols] = await db.query("SHOW COLUMNS FROM users LIKE 'bio'");
    if (bioCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN bio TEXT AFTER cover_url, ADD COLUMN location VARCHAR(255) AFTER bio");
    }
}

// ── Ensure Garden tables (user_pots + push_tokens) ──────────────────────────
async function ensureGardenTables() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS user_pots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            pot_id VARCHAR(50) NOT NULL,
            floor_id INT DEFAULT 1,
            has_plant BOOLEAN DEFAULT FALSE,
            water_level FLOAT DEFAULT 0,
            fertilizer_level FLOAT DEFAULT 0,
            growth_stage VARCHAR(50) DEFAULT 'Nảy mầm',
            growing_until BIGINT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_pot (user_id, pot_id)
        )
    `);

    // Seeds count column in users
    const [seedCols] = await db.query("SHOW COLUMNS FROM users LIKE 'seeds'");
    if (seedCols.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN seeds INT DEFAULT 2 AFTER coins");
    }

    // Push notification tokens
    await db.query(`
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            platform VARCHAR(20) DEFAULT 'android',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_token (user_id, token)
        )
    `);

    // AI verification log
    await db.query(`
        CREATE TABLE IF NOT EXISTS ai_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            submission_id INT NOT NULL,
            verified BOOLEAN DEFAULT TRUE,
            confidence INT DEFAULT 0,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ensure library table exists (it was only created in seedAllTasks before)
    await db.query(`
        CREATE TABLE IF NOT EXISTS library (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            duration VARCHAR(50),
            description TEXT,
            image_url TEXT,
            category_color VARCHAR(20) DEFAULT '#154212',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    const [libVideoCols] = await db.query("SHOW COLUMNS FROM library LIKE 'video_url'");
    if (libVideoCols.length === 0) {
        await db.query("ALTER TABLE library ADD COLUMN video_url TEXT AFTER image_url, ADD COLUMN type ENUM('image', 'video') DEFAULT 'image' AFTER video_url");
    }

    // Ensure task_submissions table exists
    await db.query(`
        CREATE TABLE IF NOT EXISTS task_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            task_id INT NOT NULL,
            image_url TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Garden + Push + AI + Library tables verified.');
}

async function startServer() {
    console.log("--- ĐANG KHỞI ĐỘNG SERVER ---");
    try {
        console.log("1. Đang kiểm tra kết nối Database...");
        await ensureUserColumns();
        await ensureTaskColumns();
        await ensureShopTables();
        await ensureGardenTables();
        console.log("2. Kết nối Database thành công!");
        console.log(`   AI Verification: ${genAI ? '✅ Enabled' : '⚠️ Disabled (set GEMINI_API_KEY in .env)'}`);

        app.listen(PORT, () => {
            console.log(`✅ 3. Server đã chạy thành công tại port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Lỗi trong quá trình khởi động:");
        console.error(error);
    }
}

// API Endpoints
// Image Upload to Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
    console.log('[Upload] Request received');
    try {
        if (!req.file) {
            console.log('[Upload] No file');
            return res.status(400).json({ message: 'No file uploaded' });
        }
        console.log('[Upload] Buffer size:', req.file.size);
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'nong_nghiep_xanh' },
            (error, result) => {
                if (error) {
                    console.error('[Upload] Cloudinary error:', error);
                    return res.status(500).json({ error: error.message });
                }
                console.log('[Upload] Success:', result.secure_url);
                res.json({ url: result.secure_url });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (err) {
        console.error('[Upload] Server error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role, fullName, email, dob } = req.body;
    if (!username || !password || !fullName) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin đăng ký' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO users (username, password, role, full_name, email, dob) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, role || 'farmer', fullName, email || null, dob || null]
        );

        const [rows] = await db.query(
            'SELECT id, username, full_name, email, dob, role, coins, water_level, energy_level, growth_stage, growing_until, avatar_url, cover_url, bio, location, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        const user = rows[0];
        user.coins = user.coins ?? 0;
        user.water_level = user.water_level ?? 0;
        user.energy_level = user.energy_level ?? 1;
        user.growing_until = user.growing_until ?? 0;

        res.status(201).json(user);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query(
            'SELECT id, username, full_name, role, coins, water_level, energy_level, growth_stage, growing_until, avatar_url, cover_url, bio, location, created_at FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        if (users.length === 0) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
        
        const user = users[0];
        user.coins = user.coins ?? 0;
        user.water_level = user.water_level ?? 0;
        user.energy_level = user.energy_level ?? 1;
        user.growing_until = user.growing_until ?? 0;
        
        console.log(`[Login] User ${user.username} logged in. Coins: ${user.coins}`);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Info
app.get('/api/user/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, email, dob, role, coins, water_level, energy_level, growth_stage, growing_until, avatar_url, cover_url, bio, location, created_at FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = rows[0];
        
        // Fetch stats
        const [[taskCount]] = await db.query('SELECT COUNT(*) as n FROM task_submissions WHERE user_id = ? AND status = "approved"', [req.params.id]);
        const [[redemptionCount]] = await db.query('SELECT COUNT(*) as n FROM redemptions WHERE user_id = ?', [req.params.id]);
        
        user.coins = user.coins ?? 0;
        user.water_level = user.water_level ?? 0;
        user.energy_level = user.energy_level ?? 1;
        user.growing_until = user.growing_until ?? 0;
        
        user.stats = {
            tasksCompleted: taskCount.n,
            redemptions: redemptionCount.n
        };
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
app.patch('/api/user/profile/:id', async (req, res) => {
    const { fullName, email, avatarUrl, coverUrl, bio, location } = req.body;
    try {
        await db.query(
            'UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), avatar_url = COALESCE(?, avatar_url), cover_url = COALESCE(?, cover_url), bio = COALESCE(?, bio), location = COALESCE(?, location) WHERE id = ?',
            [fullName, email, avatarUrl, coverUrl, bio, location, req.params.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Stats (Coins + Seeds) — using /api/stats/ to avoid Express v5 param conflict
app.patch('/api/stats/:id', async (req, res) => {
    const { coins, seeds, waterLevel, energyLevel, growthStage, growingUntil } = req.body;
    console.log(`[Sync] Updating stats for user ${req.params.id}: Coins=${coins}, Seeds=${seeds}`);
    try {
        await db.query(
            'UPDATE users SET coins = ?, seeds = ?, water_level = ?, energy_level = ?, growth_stage = ?, growing_until = ? WHERE id = ?',
            [coins, seeds ?? 2, waterLevel, energyLevel, growthStage, growingUntil || 0, req.params.id]
        );
        res.json({ message: 'Stats updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Garden Pot Sync (using /api/garden/ prefix) ─────────────────────────────
// GET: Load all pots for a user
app.get('/api/garden/:userId/pots', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT pot_id, floor_id, has_plant, water_level, fertilizer_level, growth_stage, growing_until FROM user_pots WHERE user_id = ? ORDER BY floor_id, pot_id',
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Save all pots for a user (full sync)
app.put('/api/garden/:userId/pots', async (req, res) => {
    const userId = req.params.userId;
    const { pots, seeds } = req.body; // pots = array of PotData, seeds = number
    
    if (!Array.isArray(pots)) {
        return res.status(400).json({ message: 'pots must be an array' });
    }
    
    try {
        // Upsert each pot
        for (const pot of pots) {
            await db.query(`
                INSERT INTO user_pots (user_id, pot_id, floor_id, has_plant, water_level, fertilizer_level, growth_stage, growing_until)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    floor_id = VALUES(floor_id),
                    has_plant = VALUES(has_plant),
                    water_level = VALUES(water_level),
                    fertilizer_level = VALUES(fertilizer_level),
                    growth_stage = VALUES(growth_stage),
                    growing_until = VALUES(growing_until)
            `, [
                userId, pot.id, pot.floorId, pot.hasPlant ? 1 : 0,
                pot.waterLevel, pot.fertilizerLevel, pot.growthStage, pot.growingUntil || 0
            ]);
        }
        
        // Also sync seeds count
        if (seeds !== undefined) {
            await db.query('UPDATE users SET seeds = ? WHERE id = ?', [seeds, userId]);
        }
        
        console.log(`[Garden] Synced ${pots.length} pots for user ${userId}`);
        res.json({ message: 'Garden synced successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Location (for Map) — using /api/location/ prefix
app.patch('/api/location/:id', async (req, res) => {
    const { id } = req.params;
    const { lat, lng } = req.body;
    try {
        await db.query('UPDATE users SET last_lat = ?, last_lng = ?, last_seen = NOW() WHERE id = ?', [lat, lng, id]);
        res.json({ message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Push Notification Token Registration ─────────────────────────────────────
app.post('/api/push/register', async (req, res) => {
    const { userId, token, platform } = req.body;
    if (!userId || !token) return res.status(400).json({ message: 'userId and token required' });
    try {
        await db.query(`
            INSERT INTO push_tokens (user_id, token, platform)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE token = VALUES(token), platform = VALUES(platform)
        `, [userId, token, platform || 'android']);
        res.json({ message: 'Push token registered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Shop Items
app.get('/api/shop', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shop_items');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buy Item
app.post('/api/shop/buy', async (req, res) => {
    const { userId, itemId, price } = req.body;
    try {
        // 1. Check user coins
        const [users] = await db.query('SELECT coins FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        if (users[0].coins < price) {
            return res.status(400).json({ message: 'Not enough coins' });
        }

        // 2. Subtract coins
        await db.query('UPDATE users SET coins = coins - ? WHERE id = ?', [price, userId]);
        
        // 3. Add to inventory
        await db.query('INSERT IGNORE INTO inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId]);
        
        // 4. Create a redemption record with a unique QR code
        const qrCode = `REDEEM-${userId}-${itemId}-${Date.now()}`;
        await db.query('INSERT INTO redemptions (user_id, item_id, qr_code) VALUES (?, ?, ?)', [userId, itemId, qrCode]);
        
        res.json({ message: 'Purchase successful', remainingCoins: users[0].coins - price, qrCode });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Moderator: Verify and Collect QR
app.post('/api/moderator/collect', async (req, res) => {
    const { qrCode, moderatorId } = req.body;
    try {
        // 1. Check QR code
        const [redemptions] = await db.query('SELECT * FROM redemptions WHERE qr_code = ? AND status = "pending"', [qrCode]);
        if (redemptions.length === 0) return res.status(404).json({ message: 'Mã QR không hợp lệ hoặc đã được sử dụng' });
        
        const red = redemptions[0];

        // 2. Check stock
        const [stocks] = await db.query('SELECT quantity FROM inventory_stock WHERE item_id = ?', [red.item_id]);
        if (stocks.length > 0 && stocks[0].quantity <= 0) {
            return res.status(400).json({ message: 'Sản phẩm trong kho đã hết' });
        }

        // 3. Update redemption status
        await db.query('UPDATE redemptions SET status = "collected", collected_at = CURRENT_TIMESTAMP WHERE id = ?', [red.id]);

        // 4. Subtract from inventory_stock
        await db.query('UPDATE inventory_stock SET quantity = quantity - 1 WHERE item_id = ?', [red.item_id]);

        res.json({ message: 'Xác nhận đổi quà thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Ensure shop tables exist ───────────────────────────────────────────────
async function ensureShopTables() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS shop_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            description TEXT,
            image_url VARCHAR(255)
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            item_id INT NOT NULL,
            UNIQUE KEY unique_user_item (user_id, item_id)
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS redemptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            item_id INT NOT NULL,
            qr_code VARCHAR(255) UNIQUE NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            collected_at TIMESTAMP NULL
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS inventory_stock (
            item_id INT PRIMARY KEY,
            quantity INT DEFAULT 100
        )
    `);
    // Seed shop_items if empty
    const [count] = await db.query('SELECT COUNT(*) as n FROM shop_items');
    if (count[0].n === 0) {
        const items = [
            ['Hạt giống Cà chua', 50, 'Hạt giống F1 nảy mầm nhanh', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400'],
            ['Phân hữu cơ vi sinh 5kg', 200, 'Phân bón giàu dinh dưỡng', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400'],
            ['Bình tưới cây 2L', 150, 'Bình xịt áp suất cao', 'https://images.unsplash.com/photo-1416879598056-0cbb04922ba4?w=400'],
            ['Bộ cuốc xẻng mini', 300, 'Dụng cụ làm vườn tiện lợi', 'https://images.unsplash.com/photo-1416879598056-0cbb04922ba4?w=400'],
        ];
        for (const item of items) {
            const [res] = await db.query('INSERT INTO shop_items (name, price, description, image_url) VALUES (?, ?, ?, ?)', item);
            await db.query('INSERT INTO inventory_stock (item_id, quantity) VALUES (?, ?)', [res.insertId, 100]);
        }
    }
}

// ── Ensure tasks have group/type columns ────────────────────────────────────
async function ensureTaskColumns() {
    const checks = [
        { col: 'task_group', sql: "ALTER TABLE tasks ADD COLUMN task_group VARCHAR(50) DEFAULT 'action'" },
        { col: 'task_type',  sql: "ALTER TABLE tasks ADD COLUMN task_type  VARCHAR(50) DEFAULT 'photo'" },
        { col: 'frequency',  sql: "ALTER TABLE tasks ADD COLUMN frequency  VARCHAR(50) DEFAULT 'daily'" },
        { col: 'needs_gps',  sql: "ALTER TABLE tasks ADD COLUMN needs_gps  BOOLEAN DEFAULT FALSE" },
        { col: 'needs_moderator', sql: "ALTER TABLE tasks ADD COLUMN needs_moderator BOOLEAN DEFAULT TRUE" },
        { col: 'quiz_options',    sql: "ALTER TABLE tasks ADD COLUMN quiz_options JSON NULL" },
        { col: 'quiz_answer',     sql: "ALTER TABLE tasks ADD COLUMN quiz_answer VARCHAR(10) NULL" },
    ];
    for (const c of checks) {
        const [cols] = await db.query(`SHOW COLUMNS FROM tasks LIKE '${c.col}'`);
        if (cols.length === 0) await db.query(c.sql);
    }
    // Seed 50 tasks if table is mostly empty
    const [count] = await db.query('SELECT COUNT(*) as n FROM tasks');
    if (count[0].n < 10) await seedAllTasks();
}

async function seedAllTasks() {
    const tasks = [
        // GROUP 1: Action (needs photo, needs moderator)
        ['Gom rơm rạ/vỏ cà phê', 60, 'Action', 'Chụp ảnh gom rơm rạ/vỏ cà phê thành đống sau thu hoạch.', 'camera', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Trộn men vi sinh', 70, 'Action', 'Chụp ảnh đang trộn men vi sinh vào đống ủ.', 'camera', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Tưới giữ ẩm đống ủ', 50, 'Action', 'Chụp ảnh đang tưới nước giữ ẩm cho đống ủ phân.', 'water', 'action', 'photo', 'daily', 0, 1, null, null],
        ['Che đậy bạt đống ủ', 50, 'Action', 'Chụp ảnh/quay video (5s) che đậy bạt bảo vệ đống ủ.', 'camera', 'action', 'video', 'weekly', 0, 1, null, null],
        ['Đảo đống ủ cho thoáng', 60, 'Action', 'Quay video ngắn cảnh dùng xẻng đảo đống ủ cho thoáng khí.', 'camera', 'action', 'video', 'weekly', 0, 1, null, null],
        ['Phân hoai mục thành công', 100, 'Action', 'Chụp ảnh đống phân hữu cơ đã hoai mục thành công (đen, tơi xốp).', 'leaf', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Bón phân tự ủ cho cây', 80, 'Action', 'Chụp ảnh đang bón phân tự ủ cho gốc cây cà phê / hoa màu.', 'leaf', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Phân loại rác tại bếp', 60, 'Action', 'Chụp ảnh phân loại rác hữu cơ (rau củ thừa) và vô cơ (túi nilon) tại bếp.', 'recycle', 'action', 'photo', 'daily', 0, 1, null, null],
        ['Vứt rác vô cơ đúng nơi', 40, 'Action', 'Chụp ảnh vứt rác vô cơ đúng nơi quy định của buôn làng.', 'trash-can', 'action', 'photo', 'daily', 0, 1, null, null],
        ['Nhặt vỏ chai thuốc trên rẫy', 70, 'Action', 'Chụp ảnh nhặt vỏ chai/bao bì thuốc bảo vệ thực vật trên rẫy.', 'delete-sweep', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Nộp bao bì thuốc trừ sâu', 80, 'Action', 'Chụp ảnh đem bao bì thuốc trừ sâu nộp tại điểm thu gom chung.', 'truck-delivery', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Tái chế đồ cũ thành chậu', 90, 'Action', 'Chụp ảnh tái chế (dùng chai nhựa cũ làm chậu ươm hạt mầm).', 'recycle', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Quét dọn đường làng', 60, 'Action', 'Chụp ảnh tham gia quét dọn đường làng ngõ xóm.', 'broom', 'action', 'photo', 'weekly', 0, 1, null, null],
        ['Giới thiệu app cho hàng xóm', 120, 'Action', 'Quét mã QR giới thiệu app thành công cho một người hàng xóm.', 'qrcode', 'action', 'qr', 'weekly', 0, 1, null, null],
        ['Buộc kín túi rác trước khi vứt', 40, 'Action', 'Chụp ảnh túi rác hoặc bao tải rác đã được buộc kín trước khi vứt.', 'bag-checked', 'action', 'photo', 'daily', 0, 1, null, null],
        // GROUP 2: Report (needs GPS + moderator)
        ['Báo cáo đốt rơm rạ', 100, 'Report', 'Báo cáo tọa độ đang có đống rơm rạ bị đốt (kèm ảnh khói).', 'fire-alert', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Báo cáo đốt rác nông nghiệp', 100, 'Report', 'Báo cáo tọa độ đang đốt vỏ cà phê / rác thải nông nghiệp.', 'fire', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Báo cáo bãi rác tự phát', 80, 'Report', 'Báo cáo một bãi rác tự phát mới xuất hiện cạnh đường/kênh rạch.', 'map-marker-alert', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Báo cáo vỏ chai thuốc vứt bừa', 80, 'Report', 'Báo cáo khu vực có nhiều vỏ chai thuốc trừ sâu vứt bừa bãi.', 'alert', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Cập nhật điểm ô nhiễm đã sạch', 120, 'Report', 'Chụp ảnh điểm ô nhiễm (đã báo cáo trước đó) nay đã được dọn sạch.', 'check-circle', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Báo cáo khói mù không rõ nguồn', 90, 'Report', 'Báo cáo khói mù mịt không rõ nguồn gốc gây ảnh hưởng tầm nhìn.', 'weather-fog', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Báo cáo xả rác xuống suối', 100, 'Report', 'Báo cáo hành vi xả rác sinh hoạt thẳng xuống suối/nguồn nước.', 'water-off', 'report', 'photo', 'daily', 1, 1, null, null],
        ['Đánh dấu đống ủ lên bản đồ', 60, 'Report', 'Đánh dấu vị trí đống ủ phân sinh học chuẩn của nhà mình lên bản đồ.', 'map-marker-plus', 'report', 'gps', 'weekly', 1, 1, null, null],
        ['Báo cáo điểm tập kết rác quá tải', 70, 'Report', 'Báo cáo điểm tập kết rác của buôn làng đang bị quá tải, chưa có xe thu gom.', 'trash-can-outline', 'report', 'photo', 'daily', 1, 1, null, null],
        ['SOS: Báo cháy lan rộng', 150, 'Report', 'Báo cáo nhanh (SOS) đám cháy có nguy cơ lan rộng.', 'fire-extinguisher', 'report', 'photo', 'daily', 1, 1, null, null],
        // GROUP 3: Quiz
        ['Quiz: Ủ rơm mất bao lâu?', 50, 'Quiz', 'Rơm rạ ủ men vi sinh mất bao lâu thì bón được cho cây?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. 1 tuần","B. 30-45 ngày","C. 3 tháng","D. 1 năm"]', 'B'],
        ['Quiz: Khói nilon chứa chất gì?', 50, 'Quiz', 'Khói đốt rác nilon chứa chất độc gì gây ung thư?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. CO2","B. Dioxin","C. Metan","D. Oxy"]', 'B'],
        ['Quiz: Đốt rẫy làm đất tốt hơn?', 50, 'Quiz', 'Đất rẫy bị đốt thường xuyên sẽ màu mỡ hơn hay bạc màu đi?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Màu mỡ hơn","B. Bạc màu đi"]', 'B'],
        ['Quiz: Men vi sinh khử mùi?', 40, 'Quiz', 'Men vi sinh có tác dụng khử mùi hôi đống ủ, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Đúng'],
        ['Quiz: Ủ kín không cần tưới?', 40, 'Quiz', 'Vỏ cà phê đậy bạt kín hoàn toàn không cần tưới nước, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Sai'],
        ['Quiz: Đốt bao bì thuốc được không?', 60, 'Quiz', 'Bao bì thuốc trừ sâu đã dùng hết có được mang đốt chung với rác sinh hoạt không?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Được","Không được"]', 'Không được'],
        ['Quiz: Phân hữu cơ vs hóa học?', 50, 'Quiz', 'Phân hữu cơ hoai mục giúp rễ cây hấp thụ nước tốt hơn phân hóa học, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Đúng'],
        ['Quiz: Tỷ lệ pha men vi sinh?', 50, 'Quiz', 'Tỷ lệ pha men vi sinh với nước chuẩn là bao nhiêu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. 1:10","B. 1:100","C. 1:500","D. 1:1000"]', 'C'],
        // GROUP 3: Media
        ['Xem video Già làng kể chuyện', 60, 'Quiz', 'Xem hết 1 video "Già làng kể chuyện bảo vệ đất" (thời lượng 1-2 phút).', 'play-circle', 'learn', 'media', 'daily', 0, 0, null, null],
        ['Nghe audio tiếng Ê Đê', 60, 'Quiz', 'Nghe trọn vẹn 1 file audio tiếng Ê Đê hướng dẫn trộn phân.', 'headphones', 'learn', 'media', 'daily', 0, 0, null, null],
        ['Xem infographic ủ vỏ cà phê', 50, 'Quiz', 'Xem và vuốt chạm hết 1 Infographic "4 bước ủ vỏ cà phê".', 'image', 'learn', 'media', 'daily', 0, 0, null, null],
        ['Đọc mẹo nông nghiệp xanh hôm nay', 40, 'Quiz', 'Đọc "Mẹo nông nghiệp xanh" hiển thị dưới dạng pop-up của ngày hôm nay.', 'book-open', 'learn', 'media', 'daily', 0, 0, null, null],
        ['Xem video tác hại khói đốt rẫy', 70, 'Quiz', 'Xem video cảnh báo tác hại của khói đốt rẫy đến hệ hô hấp của trẻ em.', 'play-circle', 'learn', 'media', 'daily', 0, 0, null, null],
        // GROUP 3: Retention
        ['Điểm danh hôm nay', 20, 'Quiz', 'Điểm danh: Đăng nhập mở app ngày hôm nay.', 'calendar-today', 'learn', 'checkin', 'daily', 0, 0, null, null],
        ['Streak 3 ngày liên tiếp', 80, 'Quiz', 'Chuỗi (Streak): Đăng nhập liên tiếp 3 ngày.', 'fire', 'learn', 'streak', 'daily', 0, 0, null, null],
        ['Streak 7 ngày liên tiếp', 200, 'Quiz', 'Chuỗi (Streak): Đăng nhập liên tiếp 7 ngày (thưởng rương Xu ngẫu nhiên).', 'trophy', 'learn', 'streak', 'daily', 0, 0, null, null],
        ['Tưới/bón phân cây ảo', 30, 'Quiz', 'Click tưới nước/bón phân cho "Cây ảo" trên trang chủ.', 'leaf', 'learn', 'interact', 'daily', 0, 0, null, null],
        ['Nhiệm vụ Combo trong ngày', 150, 'Quiz', 'Hoàn thành ít nhất 1 task Hành động + 1 task Học tập trong cùng 1 ngày (Bonus thêm Xu).', 'star-circle', 'learn', 'combo', 'daily', 0, 0, null, null],
    ];

    for (const t of tasks) {
        await db.query(
            `INSERT IGNORE INTO tasks (title, reward, category, description, icon, task_group, task_type, frequency, needs_gps, needs_moderator, quiz_options, quiz_answer)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            t
        );
    }
    // 6. Library Table
    await db.query(`
        CREATE TABLE IF NOT EXISTS library (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            duration VARCHAR(50),
            description TEXT,
            image_url TEXT,
            category_color VARCHAR(20) DEFAULT '#154212',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 7. Seed Initial Library Data
    const [libItems] = await db.query('SELECT COUNT(*) as count FROM library');
    if (libItems[0].count === 0) {
        const seedLibrary = [
            ["Kỹ thuật ủ phân hữu cơ", "KỸ THUẬT", "5:20", "Hướng dẫn chi tiết cách ủ phân từ rác thải sinh hoạt và phụ phẩm nông nghiệp.", "https://images.unsplash.com/photo-1592724212522-88806a03c136?w=800", "#154212"],
            ["Phân loại rác tại nguồn", "MÔI TRƯỜNG", "3:45", "Tại sao nông dân cần phân loại rác và cách thực hiện đúng chuẩn 3R.", "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800", "#d97706"],
            ["Bảo vệ nguồn nước buôn làng", "SINH HOẠT", "4:12", "Các biện pháp bảo vệ giếng nước và hệ thống thủy lợi khỏi ô nhiễm thuốc trừ sâu.", "https://images.unsplash.com/photo-1548504769-900b700126a1?w=800", "#2563eb"]
        ];
        await db.query('INSERT INTO library (title, category, duration, description, image_url, category_color) VALUES ?', [seedLibrary]);
    }

    console.log('✅ Database tables verified and seeded.');
}

// ── Get all tasks ─────────────────────────────────────────────────────────────
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks ORDER BY task_group, id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Weekly rotation: 5 tasks seeded deterministically by week number ──────────
app.get('/api/tasks/weekly/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId) || 1;
        const now = new Date();
        // Week number (ISO)
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        const seed = userId * 31 + weekNum * 97; // deterministic but varies per user & week

        const [allTasks] = await db.query('SELECT id, title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, quiz_options, quiz_answer FROM tasks');

        // Split into groups
        const actionTasks  = allTasks.filter(t => t.task_group === 'action');
        const reportTasks  = allTasks.filter(t => t.task_group === 'report');
        const learnTasks   = allTasks.filter(t => t.task_group === 'learn');

        // Seeded shuffle helper
        const pick = (arr, n, offset) => {
            const shuffled = [...arr].sort((a, b) => ((a.id * seed + offset) % 97) - ((b.id * seed + offset) % 97));
            return shuffled.slice(0, n);
        };

        const weekly = [
            ...pick(actionTasks, 2, 1),
            ...pick(reportTasks, 1, 2),
            ...pick(learnTasks, 2, 3),
        ].slice(0, 5);

        // Attach submission status for this user
        const [subs] = await db.query(
            'SELECT task_id, status FROM task_submissions WHERE user_id = ? ORDER BY submitted_at DESC',
            [userId]
        );
        const subMap = {};
        for (const s of subs) { if (!subMap[s.task_id]) subMap[s.task_id] = s.status; }

        const result = weekly.map(t => ({ ...t, submissionStatus: subMap[t.id] || 'none' }));
        res.json({ weekNum, tasks: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Get user submissions ───────────────────────────────────────────────────────
app.get('/api/tasks/submissions/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT ts.task_id, ts.status, ts.submitted_at, t.title
             FROM task_submissions ts JOIN tasks t ON ts.task_id = t.id
             WHERE ts.user_id = ? ORDER BY ts.submitted_at DESC`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Task Evidence (with AI verification)
app.post('/api/tasks/submit', async (req, res) => {
    const { userId, taskId, imageUrl } = req.body;
    try {
        const [tasks] = await db.query('SELECT title, description, needs_moderator, reward, task_type FROM tasks WHERE id = ?', [taskId]);
        if (tasks.length === 0) return res.status(404).json({ message: 'Task not found' });
        
        const task = tasks[0];
        let aiResult = null;
        let status = task.needs_moderator ? 'pending' : 'approved';
        
        // AI verification for photo/video submissions (not quiz, checkin, etc)
        if (imageUrl && imageUrl !== 'auto' && imageUrl !== 'quiz-correct' && (task.task_type === 'photo' || task.task_type === 'video')) {
            // Extract actual image URL (before |GPS: part)
            const cleanImageUrl = imageUrl.split('|GPS:')[0];
            if (cleanImageUrl.startsWith('http')) {
                aiResult = await verifyTaskImage(cleanImageUrl, task.title, task.description);
                
                // If AI is confident the image is NOT related (confidence > 70 and not verified)
                if (aiResult && !aiResult.verified && aiResult.confidence >= 70) {
                    status = 'ai_rejected';
                    console.log(`[AI] AUTO-REJECTED submission for task "${task.title}": ${aiResult.reason}`);
                }
            }
        }

        const [insertResult] = await db.query(
            'INSERT INTO task_submissions (user_id, task_id, image_url, status) VALUES (?, ?, ?, ?)',
            [userId, taskId, imageUrl, status]
        );
        
        // Log AI verification
        if (aiResult) {
            await db.query(
                'INSERT INTO ai_verifications (submission_id, verified, confidence, reason) VALUES (?, ?, ?, ?)',
                [insertResult.insertId, aiResult.verified, aiResult.confidence, aiResult.reason]
            );
        }
        
        if (status === 'ai_rejected') {
            res.json({ 
                message: 'Ảnh không phù hợp với nhiệm vụ. Vui lòng chụp lại.', 
                autoApproved: false, 
                aiRejected: true,
                aiReason: aiResult?.reason || 'Ảnh không liên quan đến nhiệm vụ'
            });
        } else if (!task.needs_moderator) {
            await db.query('UPDATE users SET coins = coins + ? WHERE id = ?', [task.reward, userId]);
            res.json({ 
                message: 'Task completed and reward granted', 
                autoApproved: true, 
                reward: task.reward,
                aiVerified: aiResult ? aiResult.verified : null,
                aiConfidence: aiResult ? aiResult.confidence : null
            });
        } else {
            res.json({ 
                message: 'Submission received, waiting for admin approval', 
                autoApproved: false,
                aiVerified: aiResult ? aiResult.verified : null,
                aiConfidence: aiResult ? aiResult.confidence : null,
                aiReason: aiResult ? aiResult.reason : null
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Pending Submissions for Admin (include AI verification data)
app.get('/api/admin/submissions', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT ts.*, u.username, t.title, t.reward,
                   av.verified as ai_verified, av.confidence as ai_confidence, av.reason as ai_reason
            FROM task_submissions ts
            JOIN users u ON ts.user_id = u.id
            JOIN tasks t ON ts.task_id = t.id
            LEFT JOIN ai_verifications av ON av.submission_id = ts.id
            WHERE ts.status = 'pending' OR ts.status = 'ai_rejected'
            ORDER BY ts.submitted_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve Submission
app.post('/api/admin/approve', async (req, res) => {
    const { submissionId } = req.body;
    try {
        // 1. Get submission details
        const [submissions] = await db.query('SELECT * FROM task_submissions WHERE id = ?', [submissionId]);
        if (submissions.length === 0) return res.status(404).json({ message: 'Submission not found' });
        
        const sub = submissions[0];
        const [tasks] = await db.query('SELECT reward FROM tasks WHERE id = ?', [sub.task_id]);
        const reward = tasks[0].reward;

        // 2. Update status
        await db.query('UPDATE task_submissions SET status = "approved" WHERE id = ?', [submissionId]);

        // 3. Add coins to user
        await db.query('UPDATE users SET coins = coins + ? WHERE id = ?', [reward, sub.user_id]);

        res.json({ message: 'Submission approved and coins granted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Get all library items ───────────────────────────────────────────────────
app.get('/api/library', async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM library ORDER BY created_at DESC');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Get rankings ────────────────────────────────────────────────────────────
app.get('/api/rankings', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, full_name as name, coins as points, avatar_url as imageUri FROM users ORDER BY coins DESC LIMIT 20');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Map Data (Users + POIs from Submissions)
app.get('/api/map/data', async (req, res) => {
    try {
        // 1. Get all users with location + online status (active in last 5 min)
        const [users] = await db.query(`
            SELECT id, username, full_name, role, last_lat as lat, last_lng as lng,
            (last_seen > NOW() - INTERVAL 5 MINUTE) as isOnline
            FROM users 
            WHERE last_lat IS NOT NULL
        `);

        // 2. Get submissions with GPS data (parsing from image_url which has |GPS:...)
        const [submissions] = await db.query(`
            SELECT ts.id, ts.image_url, ts.status, u.username, t.title
            FROM task_submissions ts
            JOIN users u ON ts.user_id = u.id
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.image_url LIKE '%|GPS:%'
        `);

        // Parse GPS from string
        const pois = submissions.map(s => {
            const parts = s.image_url.split('|GPS:');
            const gpsData = parts[1].split('|ADDR:');
            const coords = gpsData[0].split(',');
            const address = gpsData[1] || 'Vị trí không xác định';

            return {
                id: s.id,
                title: s.title,
                username: s.username,
                lat: parseFloat(coords[0]),
                lng: parseFloat(coords[1]),
                address: address,
                imageUrl: parts[0],
                status: s.status
            };
        });

        res.json({ users, pois });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[users]] = await db.query('SELECT COUNT(*) as count FROM users');
        const [[tasks]] = await db.query('SELECT COUNT(*) as count FROM tasks');
        const [[submissions]] = await db.query('SELECT COUNT(*) as count FROM task_submissions WHERE status = "pending"');
        const [[items]] = await db.query('SELECT COUNT(*) as count FROM shop_items');
        
        res.json({
            userCount: users.count,
            taskCount: tasks.count,
            pendingSubmissions: submissions.count,
            itemCount: items.count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manage Tasks (Create/Update)
app.post('/api/admin/tasks', async (req, res) => {
    const { id, title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, quiz_options, quiz_answer } = req.body;
    try {
        if (id) {
            await db.query(`
                UPDATE tasks SET 
                title = ?, reward = ?, category = ?, description = ?, icon = ?, 
                task_group = ?, task_type = ?, needs_gps = ?, needs_moderator = ?, 
                quiz_options = ?, quiz_answer = ?
                WHERE id = ?
            `, [title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, JSON.stringify(quiz_options), quiz_answer, id]);
            res.json({ message: 'Cập nhật nhiệm vụ thành công' });
        } else {
            await db.query(`
                INSERT INTO tasks (title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, quiz_options, quiz_answer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, JSON.stringify(quiz_options), quiz_answer]);
            res.json({ message: 'Tạo nhiệm vụ thành công' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manage Library (Create/Update)
app.post('/api/admin/library', async (req, res) => {
    const { id, title, category, duration, description, image_url, category_color } = req.body;
    try {
        if (id) {
            await db.query(`
                UPDATE library SET 
                title = ?, category = ?, duration = ?, description = ?, image_url = ?, category_color = ?
                WHERE id = ?
            `, [title, category, duration, description, image_url, category_color, id]);
            res.json({ message: 'Cập nhật thư viện thành công' });
        } else {
            await db.query(`
                INSERT INTO library (title, category, duration, description, image_url, category_color)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [title, category, duration, description, image_url, category_color]);
            res.json({ message: 'Thêm bài đăng thành công' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Redemptions (Purchased Items with QR)
app.get('/api/redemptions/:userId', async (req, res) => {
    try {
        console.log(`[Redemptions] Fetching for user: ${req.params.userId}`);
        const [rows] = await db.query(`
            SELECT r.*, s.name, s.image_url, s.description 
            FROM redemptions r
            JOIN shop_items s ON r.item_id = s.id
            WHERE r.user_id = ?
            ORDER BY r.redeemed_at DESC
        `, [req.params.userId]);
        res.json(rows);
    } catch (err) {
        console.error('[Redemptions] Error fetching redemptions:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách đổi thưởng: ' + err.message });
    }
});

// Admin: Manage Shop Items
app.post('/api/admin/shop', async (req, res) => {
    const { id, name, price, description, image_url } = req.body;
    try {
        if (id) {
            await db.query(`
                UPDATE shop_items SET 
                name = ?, price = ?, description = ?, image_url = ?
                WHERE id = ?
            `, [name, price, description, image_url, id]);
            res.json({ message: 'Cập nhật sản phẩm thành công' });
        } else {
            const [result] = await db.query(`
                INSERT INTO shop_items (name, price, description, image_url)
                VALUES (?, ?, ?, ?)
            `, [name, price, description, image_url]);
            // Also initialize stock
            await db.query('INSERT INTO inventory_stock (item_id, quantity) VALUES (?, 100)', [result.insertId]);
            res.json({ message: 'Thêm sản phẩm thành công' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manage Stock
app.get('/api/admin/stock', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.id, s.name, i.quantity 
            FROM shop_items s
            LEFT JOIN inventory_stock i ON s.id = i.item_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/stock', async (req, res) => {
    const { itemId, quantity } = req.body;
    try {
        await db.query('INSERT INTO inventory_stock (item_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = ?', [itemId, quantity, quantity]);
        res.json({ message: 'Cập nhật kho thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete Library/Task/Shop
app.delete('/api/admin/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    let table = 'tasks';
    if (type === 'library') table = 'library';
    if (type === 'shop') table = 'shop_items';

    try {
        if (type === 'shop') {
            await db.query('DELETE FROM inventory_stock WHERE item_id = ?', [id]);
        }
        await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reject Submission
app.post('/api/admin/reject', async (req, res) => {
    const { submissionId } = req.body;
    try {
        await db.query('UPDATE task_submissions SET status = "rejected" WHERE id = ?', [submissionId]);
        res.json({ message: 'Submission rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
