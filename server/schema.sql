CREATE DATABASE IF NOT EXISTS app01;
USE app01;

-- ── Bảng Users ──
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255),
    dob VARCHAR(50),
    avatar_url TEXT,
    role ENUM('farmer', 'buyer', 'moderator', 'admin') DEFAULT 'farmer',
    coins INT DEFAULT 0,
    water_level FLOAT DEFAULT 0,
    energy_level FLOAT DEFAULT 1,
    growth_stage VARCHAR(100) DEFAULT 'Nảy mầm',
    growing_until BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Bảng Tasks (Nhiệm vụ) ──
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    reward INT NOT NULL,
    category VARCHAR(100),
    description TEXT,
    icon VARCHAR(100),
    task_group VARCHAR(50) DEFAULT 'action',
    task_type VARCHAR(50) DEFAULT 'photo',
    frequency VARCHAR(50) DEFAULT 'daily',
    needs_gps BOOLEAN DEFAULT FALSE,
    needs_moderator BOOLEAN DEFAULT TRUE,
    quiz_options JSON NULL,
    quiz_answer VARCHAR(10) NULL,
    is_completed BOOLEAN DEFAULT FALSE
);

-- ── Bảng Task Submissions (Báo cáo Nhiệm vụ) ──
CREATE TABLE IF NOT EXISTS task_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    task_id INT,
    image_url TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- ── Bảng Shop Items (Vật phẩm đổi thưởng) ──
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

-- ── Bảng Kho Tổng (Tồn kho của shop) ──
CREATE TABLE IF NOT EXISTS inventory_stock (
    item_id INT PRIMARY KEY,
    quantity INT DEFAULT 100,
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

-- ── Bảng Inventory (Túi đồ của user) ──
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    UNIQUE KEY unique_user_item (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

-- ── Bảng Redemptions (Mã QR đổi thưởng) ──
CREATE TABLE IF NOT EXISTS redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

-- ==========================================
-- Dữ liệu mẫu (Seeding)
-- ==========================================

-- Seed initial users
INSERT IGNORE INTO users (username, password, role, coins, full_name) VALUES 
('nongdan1', '123456', 'farmer', 1250, 'Nguyễn Nông Dân'),
('moderator1', '123456', 'moderator', 0, 'Người Kiểm Duyệt'),
('admin1', '123456', 'admin', 0, 'Quản Trị Viên');

-- Seed initial shop items
INSERT IGNORE INTO shop_items (id, name, price, description, image_url) VALUES 
(1, 'Hạt giống Cà chua', 50, 'Hạt giống F1 nảy mầm nhanh, kháng bệnh tốt.', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400'),
(2, 'Phân hữu cơ vi sinh 5kg', 200, 'Phân bón giàu dinh dưỡng, cải tạo đất hiệu quả.', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400'),
(3, 'Bình tưới cây 2L', 150, 'Bình xịt áp suất cao, tiết kiệm nước.', 'https://images.unsplash.com/photo-1416879598056-0cbb04922ba4?w=400'),
(4, 'Bộ cuốc xẻng mini', 300, 'Dụng cụ làm vườn nhỏ gọn, hợp kim chống gỉ.', 'https://images.unsplash.com/photo-1416879598056-0cbb04922ba4?w=400');

-- Seed initial inventory stock
INSERT IGNORE INTO inventory_stock (item_id, quantity) VALUES 
(1, 100),
(2, 100),
(3, 100),
(4, 100);

-- Lưu ý: Dữ liệu 50 Tasks (nhiệm vụ) đã được tự động tạo và seed bởi backend Node.js.
