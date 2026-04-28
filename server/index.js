const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();
const readline = require('readline');

const app = express();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/assets', express.static('../assets'));

// Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        console.log('[DB] Connected successfully');
        
        // Ensure dob column exists
        try {
            await db.query('ALTER TABLE users ADD COLUMN dob DATE DEFAULT NULL');
        } catch (e) {
            // Column already exists or other error
        }

        res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Standardized Response Helper
const sendResponse = (res, success, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success,
        data,
        message,
        timestamp: new Date()
    });
};

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
        if (error.message.includes('429') || error.message.includes('quota')) {
            console.warn('[AI] Quota exceeded or Rate limited. Skipping AI verification.');
            return { verified: true, confidence: 0, reason: 'AI đang bận (hết hạn mức Free), chuyển sang duyệt thủ công.' };
        }
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

// All ensure and seed functions have been removed. Structure is now managed via SQL file.

// End of removed database management functions.


async function performPreStartChecks() {
    console.log("\n--- BẮT ĐẦU KIỂM TRA HỆ THỐNG ---");
    let critical = [];
    let warnings = [];

    // 1. Kiểm tra Database (CRITICAL)
    try {
        await db.query('SELECT 1');
        console.log("   - Database: ✅ OK");
    } catch (e) {
        console.error("   - Database: ❌ LỖI -", e.message);
        critical.push("Database không kết nối được (Kiểm tra lại DB_NAME, DB_USER, DB_PASS).");
    }

    // 2. Kiểm tra Cloudinary (WARNING)
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        console.warn("   - Cloudinary: ⚠️ CẢNH BÁO - Thiếu cấu hình");
        warnings.push("Cloudinary chưa được cấu hình (Tính năng upload ảnh sẽ lỗi).");
    } else {
        console.log("   - Cloudinary: ✅ Cấu hình đã sẵn sàng");
    }

    // 3. Kiểm tra Gemini AI (WARNING)
    if (!process.env.GEMINI_API_KEY) {
        console.warn("   - Gemini AI: ⚠️ CẢNH BÁO - Thiếu API Key");
        warnings.push("Gemini AI chưa có API Key (Tính năng tự động duyệt ảnh sẽ bị tắt).");
    } else {
        console.log("   - Gemini AI: ✅ Cấu hình đã sẵn sàng");
    }

    // Xử lý Cảnh báo
    if (warnings.length > 0) {
        console.log("\n🟡 CẢNH BÁO:");
        warnings.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
    }

    // Xử lý Lỗi Nghiêm trọng
    if (critical.length > 0) {
        console.log("\n🔴 LỖI NGHIÊM TRỌNG (Hệ thống có thể không chạy được):");
        critical.forEach((c, i) => console.log(`   ${i + 1}. ${c}`));
        
        // Nếu không phải terminal (ví dụ chạy qua PM2), thì thoát luôn vì không nhập được y/n
        if (!process.stdin.isTTY) {
            console.error("🛑 Dừng khởi động do lỗi nghiêm trọng trong môi trường Non-TTY.");
            process.exit(1);
        }

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('\nBạn có muốn TIẾP TỤC bật server bất chấp lỗi nghiêm trọng? (y/n): ', (answer) => {
                rl.close();
                if (answer.toLowerCase() === 'y') {
                    console.log("⏩ Đang tiếp tục khởi động...");
                    resolve(true);
                } else {
                    console.log("🛑 Đã dừng khởi động.");
                    process.exit(1);
                }
            });
        });
    }

    console.log("\n✨ Kiểm tra hoàn tất. Đang bật server...");
    return true;
}

async function initDatabase() {
    try {
        await db.query('SELECT 1');
        console.log("1. Kết nối Database: ✅ OK");
        console.log("2. Chế độ vận hành: 🛡️ Read/Write (Quản lý thủ công qua SQL file)");
    } catch (err) {
        console.error("1. Kết nối Database: ❌ LỖI -", err.message);
        throw err;
    }
}

async function startServer() {
    await performPreStartChecks();
    console.log("\n--- ĐANG KHỞI ĐỘNG SERVER ---");
    try {
        await initDatabase();
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
            { folder: 'nong_nghiep_xanh', resource_type: 'auto' },
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

// Phone-only Login/Bypass (Tối giản luồng)
app.post('/api/auth/login', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return sendResponse(res, false, null, 'Vui lòng nhập số điện thoại', 400);
    }
    try {
        let [rows] = await db.query(
            'SELECT id, username, full_name, dob, role, is_locked, coins, avatar_url, created_at FROM users WHERE username = ?',
            [username]
        );

        let user;
        if (rows.length === 0) {
            // Tự động đăng ký
            const [result] = await db.query(
                'INSERT INTO users (username, password, role, full_name, dob, village_name) VALUES (?, ?, ?, ?, ?, ?)',
                [username, 'no-pass', 'farmer', null, null, 'Buôn Làng']
            );
            const [newRows] = await db.query(
                'SELECT id, username, full_name, dob, role, is_locked, coins, avatar_url, created_at FROM users WHERE id = ?',
                [result.insertId]
            );
            user = newRows[0];
        } else {
            user = rows[0];
        }

        if (user.is_locked) return sendResponse(res, false, null, 'Tài khoản đã bị khóa', 403);
        user.coins = user.coins ?? 0;
        return sendResponse(res, true, user, 'Đăng nhập thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Get User Info
app.get('/api/user/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, email, dob, role, coins, water_level, energy_level, growth_stage, growing_until, avatar_url, cover_url, bio, location, created_at FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = rows[0];
        
        // --- Wilt Check Logic ---
        if (user.role === 'farmer') {
            const [[lastAct]] = await db.query('SELECT last_activity_date FROM users WHERE id = ?', [req.params.id]);
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            if (lastAct && lastAct.last_activity_date && lastAct.last_activity_date < yesterday) {
                // Inactive for more than 1 day -> wilt plants
                await db.query('UPDATE user_pots SET is_wilted = 1 WHERE user_id = ? AND has_plant = 1', [req.params.id]);
            }
        }
        // -------------------------

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
        
        return sendResponse(res, true, user, 'Lấy thông tin người dùng thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Update Profile
app.patch('/api/user/profile/:id', async (req, res) => {
    const { fullName, dob, email, avatarUrl, coverUrl, bio, location } = req.body;
    try {
        await db.query(
            'UPDATE users SET full_name = COALESCE(?, full_name), dob = COALESCE(?, dob), email = COALESCE(?, email), avatar_url = COALESCE(?, avatar_url), cover_url = COALESCE(?, cover_url), bio = COALESCE(?, bio), location = COALESCE(?, location) WHERE id = ?',
            [fullName, dob, email, avatarUrl, coverUrl, bio, location, req.params.id]
        );
        
        // Return updated user data
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        return sendResponse(res, true, rows[0], 'Cập nhật hồ sơ thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
        return sendResponse(res, true, null, 'Đồng bộ chỉ số thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Garden Pot Sync (using /api/garden/ prefix) ─────────────────────────────
// GET: Load all pots for a user
app.get('/api/garden/:userId/pots', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT pot_id as id, floor_id as floorId, has_plant as hasPlant, plant_type as plantType, growth_progress as growthProgress, growth_stage as growthStage, is_wilted as isWilted, growing_until as growingUntil, skin_id as skinId, has_pot as hasPot FROM user_pots WHERE user_id = ? ORDER BY floor_id, pot_id',
            [req.params.userId]
        );
        
        // Map 1/0 to true/false for boolean fields
        const formatted = rows.map(r => ({
            ...r,
            hasPlant: !!r.hasPlant,
            isWilted: !!r.isWilted,
            hasPot: !!r.hasPot
        }));
        
        return sendResponse(res, true, formatted, 'Lấy danh sách chậu cây thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// PUT: Save all pots for a user (full sync)
app.put('/api/garden/:userId/pots', async (req, res) => {
    const userId = req.params.userId;
    const { pots, seeds } = req.body;
    
    if (!Array.isArray(pots)) {
        return res.status(400).json({ message: 'pots must be an array' });
    }
    
    try {
        // Upsert each pot
        for (const pot of pots) {
            await db.query(`
                INSERT INTO user_pots (user_id, pot_id, floor_id, has_plant, plant_type, growth_progress, growth_stage, is_wilted, growing_until, skin_id, has_pot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    floor_id = VALUES(floor_id),
                    has_plant = VALUES(has_plant),
                    plant_type = VALUES(plant_type),
                    growth_progress = VALUES(growth_progress),
                    growth_stage = VALUES(growth_stage),
                    is_wilted = VALUES(is_wilted),
                    growing_until = VALUES(growing_until),
                    skin_id = VALUES(skin_id),
                    has_pot = VALUES(has_pot)
            `, [
                userId, pot.id, pot.floorId || 1, pot.hasPlant ? 1 : 0,
                pot.plantType || null, pot.growthProgress || 0, pot.growthStage || 'Nảy mầm', 
                pot.isWilted ? 1 : 0, pot.growingUntil || 0, pot.skinId || 'default',
                pot.hasPot ? 1 : 0
            ]);
        }
        
        // Also sync seeds count
        if (seeds !== undefined) {
            await db.query('UPDATE users SET seeds = ? WHERE id = ?', [seeds, userId]);
        }
        
        // console.log(`[Garden] Synced ${pots.length} pots for user ${userId}`);
        return sendResponse(res, true, null, 'Đồng bộ vườn thành công');
    } catch (err) {
        console.error('[Garden Sync Error]:', err);
        return sendResponse(res, false, null, err.message, 500);
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

// Helper: Send Push Notification
async function sendPush(userId, title, body, data = {}) {
    try {
        const [rows] = await db.query('SELECT token FROM push_tokens WHERE user_id = ?', [userId]);
        if (rows.length === 0) return;

        const messages = rows.map(r => ({
            to: r.token,
            sound: 'default',
            title,
            body,
            data
        }));

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messages)
        });
        const result = await response.json();
        console.log(`[Push] Sent to user ${userId}:`, JSON.stringify(result));
    } catch (err) {
        console.error('[Push] Error sending push:', err.message);
    }
}

// Get Shop Items
app.get('/api/shop', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shop_items');
        return sendResponse(res, true, rows, 'Lấy danh sách vật phẩm thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// POST: Buy/Redeem item
app.post('/api/shop/buy', async (req, res) => {
    const { userId, itemId, price, shippingName, shippingPhone, shippingAddress, notes } = req.body;
    
    try {
        // 1. Check user exists and get stats
        const [users] = await db.query('SELECT id, coins, seeds FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return sendResponse(res, false, null, 'Người dùng không tồn tại', 404);
        if (users[0].coins < price) {
            return sendResponse(res, false, null, 'Bạn không đủ xu để mua vật phẩm này', 400);
        }

        // 2. Get item info
        const [items] = await db.query('SELECT is_real, item_type, name FROM shop_items WHERE id = ?', [itemId]);
        if (items.length === 0) return sendResponse(res, false, null, 'Vật phẩm không tồn tại', 404);
        
        const item = items[0];
        const isReal = item.is_real === 1;

        // 3. Special logic for Pot Skins (One-time purchase)
        if (item.item_type === 'pot_skin') {
            const [owned] = await db.query('SELECT 1 FROM inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
            if (owned.length > 0) {
                return sendResponse(res, false, null, 'Bạn đã sở hữu skin này rồi', 400);
            }
        }

        // 4. Check stock ONLY for Real Gifts
        if (isReal) {
            const [stock] = await db.query('SELECT quantity FROM inventory_stock WHERE item_id = ?', [itemId]);
            if (!stock || stock.length === 0 || stock[0].quantity <= 0) {
                return sendResponse(res, false, null, 'Vật phẩm này đã hết hàng', 400);
            }
        }

        // 5. Deduct coins
        await db.query('UPDATE users SET coins = coins - ? WHERE id = ?', [price, userId]);

        // 6. Distribution logic
        if (isReal) {
            // Real Gift -> Create Redemption and Deduct Stock
            await db.query(`
                INSERT INTO redemptions (user_id, item_id, status, shipping_name, shipping_phone, shipping_address, notes)
                VALUES (?, ?, 'pending', ?, ?, ?, ?)
            `, [userId, itemId, shippingName || null, shippingPhone || null, shippingAddress || null, notes || null]);
            
            await db.query('UPDATE inventory_stock SET quantity = quantity - 1 WHERE item_id = ?', [itemId]);
        } else if (item.item_type === 'seed') {
            // Seed -> Just increment user's seed count
            await db.query('UPDATE users SET seeds = seeds + 1 WHERE id = ?', [userId]);
            // (Optional) also add to inventory log
            await db.query('INSERT IGNORE INTO inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId]);
        } else {
            // Pot Skin or other virtual items -> Add to inventory
            await db.query('INSERT IGNORE INTO inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId]);
        }

        const msg = isReal ? 'Đã gửi yêu cầu đổi quà thành công' : `Bạn đã mua thành công ${item.name}`;
        return sendResponse(res, true, { remainingCoins: users[0].coins - price }, msg);
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Admin: Get all redemptions
app.get('/api/admin/redemptions', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, u.username, u.full_name as user_full_name, s.name as item_name, s.image_url as item_image, s.price
            FROM redemptions r
            JOIN users u ON r.user_id = u.id
            JOIN shop_items s ON r.item_id = s.id
            ORDER BY r.redeemed_at DESC
        `);
        return sendResponse(res, true, rows, 'Lấy danh sách đổi quà thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Admin: Update redemption status
app.patch('/api/admin/redemption/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE redemptions SET status = ?, collected_at = ? WHERE id = ?', 
            [status, status === 'completed' ? new Date() : null, req.params.id]);
        return sendResponse(res, true, null, 'Cập nhật trạng thái đổi quà thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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

app.get('/api/inventory/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, s.name, s.item_type, s.image_url 
            FROM inventory i
            JOIN shop_items s ON i.item_id = s.id
            WHERE i.user_id = ?
        `, [req.params.userId]);
        return sendResponse(res, true, rows, 'Lấy kho đồ thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
            ['Hạt giống Cà phê', 50, 'Hạt giống cà phê chất lượng cao.', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'seed', 0],
            ['Hạt giống Sầu riêng', 100, 'Hạt giống sầu riêng Đắk Lắk.', 'https://images.unsplash.com/photo-1595455353724-640f1a92e861?w=400', 'seed', 0],
            
            ['Chậu Gốm Đỏ', 500, 'Mẫu chậu gốm đỏ truyền thống.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', 'pot_skin', 0],
            ['Chậu Đất Nung', 800, 'Mẫu chậu đất nung bền bỉ.', 'https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=400', 'pot_skin', 0],
            ['Chậu Sứ Xanh', 1200, 'Mẫu chậu sứ xanh trang nhã.', 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400', 'pot_skin', 0],
            ['Chậu Sứ Trắng', 1500, 'Mẫu chậu sứ trắng hiện đại.', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 'pot_skin', 0],
            ['Chậu Cổ Điển', 2000, 'Mẫu chậu mang phong cách cổ điển.', 'https://images.unsplash.com/photo-1581447100595-3a74a5af060f?w=400', 'pot_skin', 0],
            ['Chậu Vàng Hoàng Gia', 5000, 'Mẫu chậu mạ vàng sang trọng.', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 'pot_skin', 0],
            ['Chậu Ngọc Bích', 3500, 'Mẫu chậu làm từ đá ngọc bích quý hiếm.', 'https://images.unsplash.com/photo-1520412099551-62b6bafdf5bb?w=400', 'pot_skin', 0],
            ['Chậu Họa Tiết', 1800, 'Chậu vẽ tay họa tiết truyền thống.', 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400', 'pot_skin', 0],
            ['Chậu Cao Cấp', 4500, 'Chậu gốm sứ cao cấp xuất khẩu.', 'https://images.unsplash.com/photo-1516706562681-37d4052309e3?w=400', 'pot_skin', 0],
            ['Chậu Đặc Biệt', 10000, 'Phiên bản giới hạn dành cho đại gia.', 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?w=400', 'pot_skin', 0],

            ['Áo phông Nông Nghiệp Xanh', 2000, 'Áo thun cotton cao cấp in logo ứng dụng.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'tool', 1],
            ['Mũ bảo hiểm Đắk Lắk', 1500, 'Mũ bảo hiểm chất lượng cao bảo vệ an toàn.', 'https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=400', 'tool', 1],
            ['Túi ủ men vi sinh Trichoderma', 500, 'Gói 1kg men vi sinh giúp ủ vỏ cà phê nhanh chóng.', 'https://images.unsplash.com/photo-1585314062340-f1a5acc23555?w=400', 'fertilizer', 1]
        ];
        for (const item of items) {
            const [res] = await db.query('INSERT INTO shop_items (name, price, description, image_url, item_type, is_real) VALUES (?, ?, ?, ?, ?, ?)', item);
            await db.query('INSERT INTO inventory_stock (item_id, quantity) VALUES (?, ?)', [res.insertId, 50]);
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
        { col: 'quiz_explanation', sql: "ALTER TABLE tasks ADD COLUMN quiz_explanation TEXT NULL" },
    ];
    for (const c of checks) {
        const [cols] = await db.query(`SHOW COLUMNS FROM tasks LIKE '${c.col}'`);
        if (cols.length === 0) await db.query(c.sql);
    }
    // Luôn làm mới nhiệm vụ mỗi khi khởi động để cập nhật Quiz mới nhất
    await seedAllTasks();
}

async function seedAllTasks() {
    // Xóa sạch nhiệm vụ cũ để nạp đúng 3 nhiệm vụ mới
    await db.query('TRUNCATE TABLE tasks');
    
    const tasks = [
        ['Ủ phân vỏ cà phê', 60, 'Action', 'Chụp ảnh quá trình ủ vỏ cà phê bằng men vi sinh tại rẫy.', 'shovel', 'action', 'photo', 'weekly', 0, 1, null, null, null],
        ['Báo cáo đốt rẫy', 0, 'Report', 'Chụp ảnh và lẩy tọa độ GPS điểm đang có khói bụi/đốt rẫy.', 'fire-alert', 'report', 'photo', 'daily', 1, 0, null, null, null],
        
        // 10 New Quiz Questions
        ['Quiz: Hạt bụi nguy hiểm', 40, 'Quiz', 'Khói bụi sinh ra từ việc đốt vỏ cà phê và rơm rạ trên rẫy chứa loại hạt nào đặc biệt nguy hiểm cho đường hô hấp của con người?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Bụi mịn PM2.5", "B. Khí Oxi trong lành", "C. Hơi nước tinh khiết", "D. Khí hiếm"]', 'A', 'Khói đốt rác thải nông nghiệp chứa lượng lớn bụi mịn PM2.5, loại bụi siêu nhỏ này có thể xâm nhập sâu vào phổi và máu, làm tăng nguy cơ mắc các bệnh về hô hấp.'],
        ['Quiz: Hậu quả đốt rác', 40, 'Quiz', 'Nhiều người cho rằng đốt vỏ cà phê lấy tro sẽ tốt cho rẫy. Tuy nhiên, sức nóng từ việc đốt rác ngay trên mặt đất thực chất gây ra hậu quả gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiêu diệt hệ vi sinh vật có lợi và làm đất chai cứng.", "B. Làm đất tơi xốp và nhiều giun đất hơn.", "C. Giúp nấm bệnh phát triển tốt hơn.", "D. Tăng cường độ ẩm cho đất."]', 'A', 'Nhiệt độ cao từ ngọn lửa thiêu rụi chất mùn và giết chết các sinh vật có lợi dưới lớp đất mặt (như giun, dế, vi khuẩn tơi xốp), khiến đất đỏ bazan ngày càng bạc màu, chai cứng.'],
        ['Quiz: Men vi sinh phổ biến', 40, 'Quiz', 'Loại men vi sinh (chế phẩm sinh học) nào thường được sử dụng phổ biến nhất để trộn vào vỏ cà phê giúp đẩy nhanh quá trình phân hủy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nấm đối kháng Trichoderma", "B. Men tiêu hóa", "C. Thuốc trừ sâu sinh học", "D. Nước muối pha loãng"]', 'A', 'Trichoderma là loại nấm có lợi, vừa giúp phân hủy nhanh lớp vỏ cà phê cứng cáp, vừa tiêu diệt các loại nấm bệnh gây hại cho rễ cây.'],
        ['Quiz: Tại sao cần che bạt?', 40, 'Quiz', 'Trong quy trình ủ phân vi sinh, vì sao bà con cần phải che đậy bạt thật kín lên đống ủ?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Để giữ ẩm, duy trì nhiệt độ tối ưu và tránh mưa rửa trôi.", "B. Để ngăn chim chóc ăn mất vỏ cà phê.", "C. Để phân không bị bốc mùi bay sang nhà hàng xóm.", "D. Để ánh nắng mặt trời làm khô phân nhanh hơn."]', 'A', 'Che bạt tạo ra một "lồng ấp" lý tưởng (đủ nhiệt độ và độ ẩm) giúp vi sinh vật Trichoderma sinh sôi và phân hủy bã cà phê với tốc độ nhanh nhất.'],
        ['Quiz: Thời gian ủ phân', 40, 'Quiz', 'Thông thường, một đống ủ vỏ cà phê với men vi sinh cần thời gian bao lâu để phân hủy hoàn toàn thành "vàng đen"?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Khoảng 2 đến 3 tháng", "B. Chỉ sau 1 tuần", "C. Cần ít nhất 1 năm", "D. Khoảng 3 đến 5 ngày"]', 'A', '2 đến 3 tháng là khoảng thời gian chuẩn kỹ thuật để vỏ cà phê được vi sinh vật phân giải hoàn toàn thành mùn tơi xốp, giàu dinh dưỡng, sẵn sàng đem bón cho gốc cà phê.'],
        ['Quiz: Dấu hiệu phân chín', 40, 'Quiz', 'Dấu hiệu nào cho thấy mẻ phân ủ hữu cơ từ vỏ cà phê đã hoàn thành, đạt chất lượng và sẵn sàng đem bón cho rẫy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phân có màu nâu đen, tơi xốp và không có mùi hôi.", "B. Phân vẫn còn nguyên hình dạng vỏ cà phê cứng.", "C. Phân có mùi chua gắt và rỉ nhiều nước.", "D. Đống ủ đang nóng ran và bốc khói."]', 'A', 'Màu nâu đen (vàng đen) và độ tơi xốp chứng tỏ chất hữu cơ đã hoai mục hoàn toàn. Mùi hôi biến mất do hệ vi sinh có lợi đã khử mùi triệt để.'],
        ['Quiz: Lợi ích kinh tế', 40, 'Quiz', 'Việc tận dụng vỏ cà phê làm phân bón tại chỗ mang lại lợi ích kinh tế nào thiết thực nhất cho bà con nông dân?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiết kiệm đáng kể chi phí mua phân bón vô cơ (hóa học).", "B. Tăng giá bán hạt cà phê trên thị trường.", "C. Giúp thời gian thu hoạch cà phê nhanh hơn.", "D. Giúp rẫy hoàn toàn không bao giờ có cỏ dại."]', 'A', 'Phân hữu cơ tự ủ giúp đất phục hồi độ màu mỡ, từ đó giúp gia đình giảm được một khoản tiền rất lớn để mua phân bón hóa học mỗi năm.'],
        ['Quiz: Kiểm tra độ ẩm', 40, 'Quiz', 'Bằng mắt và tay không, cách nào sau đây giúp bà con nhận biết đống ủ đạt độ ẩm chuẩn?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nắm chặt một nắm bã ủ, thấy rỉ nước nhẹ ở kẽ tay là đạt.", "B. Nhìn bằng mắt thấy vỏ cà phê bay bụi là đạt.", "C. Giẫm chân lên thấy lún sâu rập rềnh là đạt.", "D. Đưa tay vào thấy lạnh buốt là đạt."]', 'A', 'Đây là mẹo kỹ thuật chuẩn xác được các cán bộ khuyến nông hướng dẫn: nước rỉ nhẹ ra kẽ tay nhưng không chảy ròng ròng cho thấy độ ẩm đạt khoảng 60%, mức lý tưởng nhất cho đống ủ.'],
        ['Quiz: Nguyên liệu kết hợp', 40, 'Quiz', 'Ngoài vỏ cà phê, bà con có thể kết hợp thêm nguyên liệu nào sau đây để mẻ phân ủ đạt chất lượng tốt nhất?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phân chuồng (bò, gà, heo) và rơm rạ.", "B. Bao bì nilon và chai nhựa.", "C. Gạch đá vụn và xà bần.", "D. Pin cũ và thiết bị điện tử hỏng."]', 'A', 'Phân chuồng cung cấp đạm, rơm rạ cung cấp carbon. Khi kết hợp cùng vỏ cà phê sẽ tạo ra nguồn dinh dưỡng toàn diện và cân bằng nhất cho cây trồng.'],
        ['Quiz: Bảo vệ buôn làng', 40, 'Quiz', 'Hành động từ bỏ thói quen đốt rẫy sang ủ phân hữu cơ góp phần trực tiếp bảo vệ đối tượng yếu thế nào nhất trong buôn làng?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Sức khỏe đường hô hấp của trẻ em và người già.", "B. Sự phát triển của đàn gia súc.", "C. Hệ thống điện lưới của địa phương.", "D. Giao thông đường bộ của xã."]', 'A', 'Trẻ em và người già có hệ hô hấp rất yếu và nhạy cảm. Việc giảm khói đốt rẫy chính là hành động trực tiếp và thiết thực nhất để bảo vệ lá phổi của họ.'],
    ];

    for (const t of tasks) {
        await db.query(
            `INSERT INTO tasks (title, reward, category, description, icon, task_group, task_type, frequency, needs_gps, needs_moderator, quiz_options, quiz_answer, quiz_explanation)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    // Xóa sạch thư viện cũ để nạp đúng 3 bài viết mới
    await db.query('TRUNCATE TABLE library');
    
    const seedLibrary = [
        ["Kỹ thuật ủ vỏ cà phê hiệu quả", "Ủ PHÂN", "5:20", "Hướng dẫn chi tiết cách tận dụng vỏ cà phê sau thu hoạch để làm phân bón hữu cơ.", "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800", "#154212"],
        ["Kiểm tra kiến thức nông nghiệp xanh", "QUIZ", "3:45", "Cùng làm bài trắc nghiệm ngắn để nhận thêm xu và củng cố kiến thức canh tác.", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "#d97706"],
        ["Cách báo cáo đốt rẫy trên bản đồ", "BÁO CÁO", "4:12", "Hướng dẫn sử dụng tính năng chụp ảnh khói bụi để bảo vệ bầu không khí buôn làng.", "https://images.unsplash.com/photo-1524350876685-274059332603?w=800", "#2563eb"]
    ];
    await db.query('INSERT INTO library (title, category, duration, description, image_url, category_color) VALUES ?', [seedLibrary]);
    
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
            `SELECT ts.task_id, ts.status, ts.submitted_at, t.title, t.description
             FROM task_submissions ts JOIN tasks t ON ts.task_id = t.id
             WHERE ts.user_id = ? ORDER BY ts.submitted_at DESC`,
            [req.params.userId]
        );
        return sendResponse(res, true, rows, 'Lấy danh sách chờ duyệt thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Submit Task Evidence (with AI verification)
app.post('/api/tasks/submit', async (req, res) => {
    const { userId, taskId, imageUrl } = req.body;
    try {
        const [tasks] = await db.query('SELECT title, description, needs_moderator, reward, exp_reward, task_type FROM tasks WHERE id = ?', [taskId]);
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
            const { level, leveledUp } = await awardExp(userId, task.exp_reward || 20);
            
            // Advance growth by 20%
            await advanceUserPlants(userId, 20);

            res.json({ 
                message: 'Task completed and reward granted', 
                autoApproved: true, 
                reward: task.reward,
                level,
                leveledUp,
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
            SELECT ts.*, u.username, u.full_name, u.avatar_url, t.title, t.reward, t.task_group, t.task_type,
                   av.verified as ai_verified, av.confidence as ai_confidence, av.reason as ai_reason
            FROM task_submissions ts
            JOIN users u ON ts.user_id = u.id
            JOIN tasks t ON ts.task_id = t.id
            LEFT JOIN ai_verifications av ON av.submission_id = ts.id
            WHERE ts.status = 'pending' OR ts.status = 'ai_rejected'
            ORDER BY ts.submitted_at DESC
        `);
        return sendResponse(res, true, rows, 'Lấy danh sách chờ duyệt thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Admin: User Management ───────────────────────────────────────────────────
// Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, email, role, coins, seeds, level, exp, is_locked, avatar_url FROM users ORDER BY created_at DESC');
        return sendResponse(res, true, rows, 'Lấy danh sách người dùng thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Update User Stats (Admin only)
app.patch('/api/admin/user/:id', async (req, res) => {
    const { fullName, email, role, coins, seeds, level, exp, is_locked } = req.body;
    try {
        await db.query(
            `UPDATE users SET 
                full_name = COALESCE(?, full_name), 
                email = COALESCE(?, email), 
                role = COALESCE(?, role), 
                coins = COALESCE(?, coins), 
                seeds = COALESCE(?, seeds), 
                level = COALESCE(?, level), 
                exp = COALESCE(?, exp), 
                is_locked = COALESCE(?, is_locked) 
             WHERE id = ?`,
            [fullName, email, role, coins, seeds, level, exp, is_locked, req.params.id]
        );
        return sendResponse(res, true, null, 'Cập nhật thông tin người dùng thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Admin: Inventory Management ──────────────────────────────────────────────
// Get user inventory
app.get('/api/admin/user/:id/inventory', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.id as inventory_id, i.item_id, s.name, s.price, s.image_url, s.item_type
            FROM inventory i
            JOIN shop_items s ON i.item_id = s.id
            WHERE i.user_id = ?
        `, [req.params.id]);
        return sendResponse(res, true, rows, 'Lấy kho đồ thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Delete item from inventory
app.delete('/api/admin/inventory/:inventoryId', async (req, res) => {
    try {
        await db.query('DELETE FROM inventory WHERE id = ?', [req.params.inventoryId]);
        return sendResponse(res, true, null, 'Xóa vật phẩm khỏi kho đồ thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Add item to inventory
app.post('/api/admin/inventory/add', async (req, res) => {
    const { userId, itemId } = req.body;
    try {
        await db.query('INSERT IGNORE INTO inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId]);
        return sendResponse(res, true, null, 'Thêm vật phẩm vào kho đồ thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Level Up Helper
async function awardExp(userId, expAmount) {
    const [users] = await db.query('SELECT level, exp FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return { level: 1, exp: 0 };
    
    let { level, exp } = users[0];
    exp += expAmount;
    
    // Level up formula: Level * 100
    let leveledUp = false;
    while (exp >= level * 100) {
        exp -= level * 100;
        level += 1;
        leveledUp = true;
    }
    
    await db.query('UPDATE users SET level = ?, exp = ? WHERE id = ?', [level, exp, userId]);
    return { level, exp, leveledUp };
}

// Helper: Advance plants growth
async function advanceUserPlants(userId, growthAmount) {
    const [pots] = await db.query('SELECT id, growth_progress, growth_stage FROM user_pots WHERE user_id = ? AND has_plant = 1', [userId]);
    const stages = ["Nảy mầm", "Cây non", "Cây trưởng thành", "Ra hoa", "Kết trái"];
    
    for (const pot of pots) {
        let newProgress = pot.growth_progress + growthAmount;
        let newStage = pot.growth_stage;
        
        if (newProgress >= 100) {
            const currentIdx = stages.indexOf(pot.growth_stage);
            if (currentIdx >= 0 && currentIdx < stages.length - 1) {
                newStage = stages[currentIdx + 1];
                newProgress = 0;
            } else {
                newProgress = 100;
            }
        }
        
        await db.query(
            'UPDATE user_pots SET growth_progress = ?, growth_stage = ?, is_wilted = 0 WHERE id = ?',
            [newProgress, newStage, pot.id]
        );
    }
    
    // Update last activity
    await db.query('UPDATE users SET last_activity_date = CURRENT_DATE WHERE id = ?', [userId]);
}

// Approve Submission
app.post('/api/admin/approve', async (req, res) => {
    const { submissionId } = req.body;
    try {
        const [submissions] = await db.query(`
            SELECT ts.*, t.reward, t.exp_reward 
            FROM task_submissions ts 
            JOIN tasks t ON ts.task_id = t.id 
            WHERE ts.id = ?
        `, [submissionId]);

        if (submissions.length === 0) {
            return sendResponse(res, false, null, 'Không tìm thấy minh chứng', 404);
        }
        
        const sub = submissions[0];

        // 2. Update status
        await db.query('UPDATE task_submissions SET status = "approved" WHERE id = ?', [submissionId]);

        // 3. Add coins and exp
        await db.query('UPDATE users SET coins = coins + ? WHERE id = ?', [sub.reward, sub.user_id]);
        
        const { level, leveledUp } = await awardExp(sub.user_id, sub.exp_reward || 20);
        
        // Advance growth by 20%
        await advanceUserPlants(sub.user_id, 20);

        // Send Push Notification
        sendPush(sub.user_id, "Nhiệm vụ đã được duyệt! 🎉", `Bạn vừa nhận được ${sub.reward} xu thưởng.`, { type: 'TASK_APPROVED' });

        return sendResponse(res, true, { level, leveledUp }, 'Đã duyệt nhiệm vụ và cộng thưởng');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Reject Submission
app.post('/api/admin/reject', async (req, res) => {
    const { submissionId } = req.body;
    try {
        const [submissions] = await db.query('SELECT user_id FROM task_submissions WHERE id = ?', [submissionId]);
        await db.query('UPDATE task_submissions SET status = "rejected" WHERE id = ?', [submissionId]);
        
        if (submissions.length > 0) {
            sendPush(submissions[0].user_id, "Nhiệm vụ bị từ chối ❌", "Vui lòng kiểm tra lại minh chứng và nộp lại nhé.", { type: 'TASK_REJECTED' });
        }

        return sendResponse(res, true, null, 'Đã từ chối nhiệm vụ');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Get all library items ───────────────────────────────────────────────────
app.get('/api/library', async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM library ORDER BY created_at DESC');
        return sendResponse(res, true, items, 'Lấy danh sách thư viện thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Get rankings ────────────────────────────────────────────────────────────
app.get('/api/rankings', async (req, res) => {
    try {
        const { type } = req.query;
        if (type === 'village') {
            const [villages] = await db.query(`
                SELECT village_name as name, SUM(coins) as points, COUNT(*) as memberCount
                FROM users 
                GROUP BY village_name 
                ORDER BY points DESC 
                LIMIT 10
            `);
            // Format for UI: add an icon/image
            const formatted = villages.map((v, i) => ({
                id: i + 1,
                name: v.name,
                points: v.points,
                imageUri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
                level: v.memberCount + ' thành viên'
            }));
            return sendResponse(res, true, formatted, 'Lấy bảng xếp hạng làng thành công');
        } else {
            const [users] = await db.query('SELECT id, full_name as name, coins as points, avatar_url as imageUri, level FROM users ORDER BY coins DESC LIMIT 20');
            return sendResponse(res, true, users, 'Lấy bảng xếp hạng thành công');
        }
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Get Community Data (Feed + Projects) ────────────────────────────────────
app.get('/api/community/data', async (req, res) => {
    try {
        // 1. Get Projects
        const [projects] = await db.query('SELECT * FROM projects WHERE status = "active"');

        // 2. Get Featured Farmers (Top 5 by coins)
        const [farmers] = await db.query('SELECT id, full_name as name, avatar_url as imageUri, level FROM users ORDER BY coins DESC LIMIT 5');

        // 3. Get Recent Feed (from approved submissions)
        const [feed] = await db.query(`
            SELECT ts.id, u.full_name as user, t.title as action, ts.submitted_at as time
            FROM task_submissions ts
            JOIN users u ON ts.user_id = u.id
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.status = 'approved'
            ORDER BY ts.submitted_at DESC
            LIMIT 10
        `);

        return sendResponse(res, true, { projects, farmers, feed }, 'Lấy dữ liệu cộng đồng thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Get Map Data (Users + POIs from Submissions)
app.get('/api/map/data', async (req, res) => {
    try {
        // 1. Get all users with location + online status (active in last 5 min)
        const [users] = await db.query(`
            SELECT id, username, full_name, role, avatar_url, cover_url, bio, coins,
            (SELECT COUNT(*) FROM task_submissions WHERE user_id = users.id AND status = 'approved') as tasksCompleted,
            last_lat as lat, last_lng as lng,
            (last_seen > NOW() - INTERVAL 5 MINUTE) as isOnline
            FROM users 
            WHERE last_lat IS NOT NULL
        `);

        // 2. Get submissions with GPS data
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

        return sendResponse(res, true, { users, pois }, 'Lấy dữ liệu bản đồ thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Admin: Get Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[users]] = await db.query('SELECT COUNT(*) as count FROM users');
        const [[tasks]] = await db.query('SELECT COUNT(*) as count FROM tasks');
        const [[submissions]] = await db.query('SELECT COUNT(*) as count FROM task_submissions WHERE status = "pending"');
        const [[items]] = await db.query('SELECT COUNT(*) as count FROM shop_items');
        
        return sendResponse(res, true, {
            userCount: users.count,
            taskCount: tasks.count,
            pendingSubmissions: submissions.count,
            itemCount: items.count
        }, 'Lấy thống kê thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
            return sendResponse(res, true, null, 'Cập nhật nhiệm vụ thành công');
        } else {
            await db.query(`
                INSERT INTO tasks (title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, quiz_options, quiz_answer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [title, reward, category, description, icon, task_group, task_type, needs_gps, needs_moderator, JSON.stringify(quiz_options), quiz_answer]);

            // Notify all farmers about new task
            const [farmers] = await db.query('SELECT id FROM users WHERE role = "farmer"');
            farmers.forEach(f => sendPush(f.id, "Nhiệm vụ mới! 🌱", `Hãy tham gia: ${title}`, { type: 'NEW_TASK' }));

            return sendResponse(res, true, null, 'Tạo nhiệm vụ thành công');
        }
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
            return sendResponse(res, true, null, 'Cập nhật thư viện thành công');
        } else {
            await db.query(`
                INSERT INTO library (title, category, duration, description, image_url, category_color)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [title, category, duration, description, image_url, category_color]);
            return sendResponse(res, true, null, 'Thêm bài đăng thành công');
        }
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
        return sendResponse(res, true, rows, 'Lấy danh sách đổi thưởng thành công');
    } catch (err) {
        console.error('[Redemptions] Error fetching redemptions:', err);
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Admin: Manage Shop Items
app.post('/api/admin/shop', async (req, res) => {
    const { id, name, price, description, image_url, item_type, is_real } = req.body;
    try {
        if (id) {
            await db.query(`
                UPDATE shop_items SET 
                name = ?, price = ?, description = ?, image_url = ?, item_type = ?, is_real = ?
                WHERE id = ?
            `, [name, price, description, image_url, item_type || 'seed', is_real || 0, id]);
            return sendResponse(res, true, null, 'Cập nhật sản phẩm thành công');
        } else {
            const [result] = await db.query(`
                INSERT INTO shop_items (name, price, description, image_url, item_type, is_real)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [name, price, description, image_url, item_type || 'seed', is_real || 0]);
            // Also initialize stock
            await db.query('INSERT INTO inventory_stock (item_id, quantity) VALUES (?, 100)', [result.insertId]);
            return sendResponse(res, true, null, 'Thêm sản phẩm thành công');
        }
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
        return sendResponse(res, true, rows, 'Lấy danh sách kho thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

app.post('/api/admin/stock', async (req, res) => {
    const { itemId, quantity } = req.body;
    try {
        await db.query('INSERT INTO inventory_stock (item_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = ?', [itemId, quantity, quantity]);
        return sendResponse(res, true, null, 'Cập nhật kho thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
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
        return sendResponse(res, true, null, 'Xóa thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Reject Submission
app.post('/api/admin/reject', async (req, res) => {
    const { submissionId } = req.body;
    try {
        await db.query('UPDATE task_submissions SET status = "rejected" WHERE id = ?', [submissionId]);
        return sendResponse(res, true, null, 'Đã từ chối nhiệm vụ');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Admin: User Management ──────────────────────────────────────────────────

// Get all users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, email, role, is_locked, coins, avatar_url, created_at FROM users ORDER BY created_at DESC');
        return sendResponse(res, true, rows, 'Lấy danh sách người dùng thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Lock/Unlock user
app.patch('/api/admin/users/:id/status', async (req, res) => {
    const { id } = req.params;
    const { is_locked } = req.body;
    try {
        await db.query('UPDATE users SET is_locked = ? WHERE id = ?', [is_locked, id]);
        return sendResponse(res, true, null, is_locked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Change user role
app.patch('/api/admin/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ['farmer', 'buyer', 'moderator', 'admin'];
    if (!allowedRoles.includes(role)) return sendResponse(res, false, null, 'Role không hợp lệ', 400);
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        return sendResponse(res, true, null, 'Đã cập nhật quyền hạn thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Reset password
app.patch('/api/admin/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return sendResponse(res, false, null, 'Vui lòng nhập mật khẩu mới', 400);
    try {
        await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
        return sendResponse(res, true, null, 'Đã cập nhật mật khẩu thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        return sendResponse(res, true, null, 'Đã xóa người dùng thành công');
    } catch (err) {
        return sendResponse(res, false, null, err.message, 500);
    }
});

// ── Map Data Endpoint ──────────────────────────────────────────────────────
app.get('/api/map/data', async (req, res) => {
    try {
        // 1. Get all users with coordinates
        const [users] = await db.query(`
            SELECT id, username, full_name, role, last_lat as lat, last_lng as lng, 
                   avatar_url, cover_url, bio, coins,
                   (CASE WHEN last_seen > DATE_SUB(NOW(), INTERVAL 15 MINUTE) THEN 1 ELSE 0 END) as isOnline
            FROM users
            WHERE last_lat IS NOT NULL AND last_lng IS NOT NULL
        `);

        // 2. Get task submissions (POIs) with GPS data
        const [submissions] = await db.query(`
            SELECT ts.id, ts.image_url, ts.status, t.title, u.username
            FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            JOIN users u ON ts.user_id = u.id
            WHERE ts.image_url LIKE '%|GPS:%'
        `);

        const pois = submissions.map(s => {
            const parts = s.image_url.split('|');
            const imageUrl = parts[0];
            let lat = 0, lng = 0, address = '';

            parts.forEach(p => {
                if (p.startsWith('GPS:')) {
                    const coords = p.replace('GPS:', '').split(',');
                    lat = parseFloat(coords[0]);
                    lng = parseFloat(coords[1]);
                }
                if (p.startsWith('ADDR:')) {
                    address = p.replace('ADDR:', '');
                }
            });

            return {
                id: s.id,
                title: s.title,
                imageUrl,
                lat,
                lng,
                address,
                username: s.username,
                status: s.status
            };
        }).filter(p => p.lat !== 0 && p.lng !== 0);

        return sendResponse(res, true, { users, pois }, 'Lấy dữ liệu bản đồ thành công');
    } catch (err) {
        console.error('[Map] Error:', err);
        return sendResponse(res, false, null, err.message, 500);
    }
});

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
