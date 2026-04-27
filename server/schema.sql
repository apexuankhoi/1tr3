-- ── 1. Cấu trúc Database ──
CREATE DATABASE IF NOT EXISTS app01;
USE app01;

-- ── 2. Bảng Users ──
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255),
    dob VARCHAR(50),
    role ENUM('farmer', 'buyer', 'moderator', 'admin') DEFAULT 'farmer',
    coins INT DEFAULT 0,
    seeds INT DEFAULT 2,
    water_level FLOAT DEFAULT 0,
    energy_level FLOAT DEFAULT 1,
    growth_stage VARCHAR(100) DEFAULT 'Nảy mầm',
    growing_until BIGINT DEFAULT 0,
    last_lat DECIMAL(10,8),
    last_lng DECIMAL(11,8),
    last_seen TIMESTAMP NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Bảng Tasks (Danh mục nhiệm vụ) ──
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
    quiz_answer VARCHAR(10) NULL
);

-- ── 4. Bảng Task Submissions (Nhiệm vụ người dùng nộp) ──
CREATE TABLE IF NOT EXISTS task_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    image_url TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- ── 5. Bảng AI Verifications (Log xác thực AI) ──
CREATE TABLE IF NOT EXISTS ai_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    confidence INT DEFAULT 0,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES task_submissions(id)
);

-- ── 6. Bảng Library (Thư viện kiến thức) ──
CREATE TABLE IF NOT EXISTS library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    duration VARCHAR(50),
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    type ENUM('image', 'video') DEFAULT 'image',
    category_color VARCHAR(20) DEFAULT '#154212',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 7. Bảng Shop Items (Cửa hàng) ──
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

-- ── 8. Bảng Inventory Stock (Kho tổng) ──
CREATE TABLE IF NOT EXISTS inventory_stock (
    item_id INT PRIMARY KEY,
    quantity INT DEFAULT 100,
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

-- ── 9. Bảng Redemptions (Lịch sử đổi quà) ──
CREATE TABLE IF NOT EXISTS redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

-- ── 10. Bảng User Pots (Chậu cây ảo) ──
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
    UNIQUE KEY unique_user_pot (user_id, pot_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── 11. Bảng Push Tokens (Thông báo) ──
CREATE TABLE IF NOT EXISTS push_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    platform VARCHAR(20) DEFAULT 'android',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_token (user_id, token),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
