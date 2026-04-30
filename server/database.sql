-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB
-- Server OS:                    Win64
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping database structure for app02
CREATE DATABASE IF NOT EXISTS `app02` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `app02`;

-- 1. Bảng Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) DEFAULT 'no-pass',
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `cover_url` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `village_name` varchar(100) DEFAULT 'Buôn Làng',
  `role` enum('farmer','moderator','admin','buyer') DEFAULT 'farmer',
  `is_locked` tinyint(1) DEFAULT 0,
  `coins` int(11) DEFAULT 1000,
  `level` int(11) DEFAULT 1,
  `exp` int(11) DEFAULT 0,
  `seeds` int(11) DEFAULT 5,
  `water_level` int(11) DEFAULT 100,
  `energy_level` int(11) DEFAULT 100,
  `last_activity_date` datetime DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp(),
  `last_lat` decimal(10,8) DEFAULT NULL,
  `last_lng` decimal(11,8) DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Bảng Tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reward` int(11) DEFAULT 50,
  `exp_reward` int(11) DEFAULT 20,
  `category` varchar(100) DEFAULT 'Chung',
  `icon` varchar(50) DEFAULT 'leaf',
  `task_group` varchar(50) DEFAULT 'action',
  `task_type` varchar(50) DEFAULT 'photo',
  `frequency` varchar(50) DEFAULT 'daily',
  `needs_gps` tinyint(1) DEFAULT 0,
  `needs_moderator` tinyint(1) DEFAULT 1,
  `quiz_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`quiz_options`)),
  `quiz_answer` varchar(255) DEFAULT NULL,
  `quiz_explanation` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Bảng Task Submissions
CREATE TABLE IF NOT EXISTS `task_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `image_url` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','ai_rejected') DEFAULT 'pending',
  `moderator_note` text DEFAULT NULL,
  `submitted_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Bảng AI Verifications
CREATE TABLE IF NOT EXISTS `ai_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `confidence` int(11) DEFAULT 0,
  `reason` text DEFAULT NULL,
  `verified_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `ai_verifications_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `task_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Bảng Shop Items
CREATE TABLE IF NOT EXISTS `shop_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `item_type` enum('seed','pot_skin','fertilizer','tool') DEFAULT 'seed',
  `is_real` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Bảng Inventory (FIXED: Added quantity column)
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_item` (`user_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Bảng Inventory Stock
CREATE TABLE IF NOT EXISTS `inventory_stock` (
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 100,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Bảng Redemptions
CREATE TABLE IF NOT EXISTS `redemptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `redeemed_at` datetime DEFAULT current_timestamp(),
  `collected_at` datetime DEFAULT NULL,
  `shipping_name` varchar(255) DEFAULT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`),
  KEY `user_id` (`user_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `redemptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `redemptions_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. Bảng User Pots
CREATE TABLE IF NOT EXISTS `user_pots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `pot_id` varchar(50) NOT NULL,
  `floor_id` int(11) DEFAULT 1,
  `has_plant` tinyint(1) DEFAULT 0,
  `plant_type` varchar(50) DEFAULT 'cafe',
  `growth_progress` float DEFAULT 0,
  `growth_stage` varchar(50) DEFAULT 'Nảy mầm',
  `is_wilted` tinyint(1) DEFAULT 0,
  `skin_id` varchar(50) DEFAULT 'default',
  `growing_until` bigint(20) DEFAULT 0,
  `has_pot` tinyint(1) DEFAULT 0,
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_pot` (`user_id`,`pot_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_pots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. Bảng Library
CREATE TABLE IF NOT EXISTS `library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'Kiến thức',
  `duration` varchar(50) DEFAULT '5 phút đọc',
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `type` varchar(20) DEFAULT 'image',
  `content` longtext DEFAULT NULL,
  `category_color` varchar(20) DEFAULT '#154212',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 11. Bảng Projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `target_amount` int(11) DEFAULT 100,
  `current_amount` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 12. Bảng Push Tokens
CREATE TABLE IF NOT EXISTS `push_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `platform` varchar(20) DEFAULT 'android',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `push_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================================
-- DUMPING DATA
-- ==========================================================

SET FOREIGN_KEY_CHECKS=0;

-- Dumping data for table users
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `dob`, `role`, `coins`, `level`, `exp`, `seeds`) VALUES
	(1, '0899321716', 'no-pass', 'Nguyễn Xuân Khởi', 'alexuankhoi@gmail.com', '2000-04-26', 'admin', 1000, 2, 0, 0),
	(2, '0888572648', 'no-pass', 'Lê Phương Anh', NULL, '2005-10-07', 'farmer', 1000, 1, 80, 0);

-- Dumping data for table shop_items
INSERT IGNORE INTO `shop_items` (`id`, `name`, `price`, `description`, `image_url`, `item_type`, `is_real`) VALUES
	(1, 'Hạt giống Cà phê', 50, 'Hạt giống cà phê chất lượng cao.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455993/nongnghiepxanh/seed/cafe.png', 'seed', 0),
	(2, 'Hạt giống Sầu riêng', 100, 'Hạt giống sầu riêng Đắk Lắk.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455994/nongnghiepxanh/seed/saurieng.png', 'seed', 0),
	(3, 'Chậu Gốm Đỏ', 500, 'Mẫu chậu gốm đỏ truyền thống.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455981/nongnghiepxanh/chau/1.png', 'pot_skin', 0),
	(4, 'Chậu Đất Nung', 800, 'Mẫu chậu đất nung bền bỉ.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455985/nongnghiepxanh/chau/2.png', 'pot_skin', 0),
	(5, 'Chậu Sứ Xanh', 1200, 'Mẫu chậu sứ xanh trang nhã.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455986/nongnghiepxanh/chau/3.png', 'pot_skin', 0),
  (13, 'Áo phông Nông Nghiệp Xanh', 2000, 'Áo thun cotton cao cấp in logo ứng dụng.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'tool', 1),
	(15, 'Túi ủ men vi sinh Trichoderma', 500, 'Gói 1kg men vi sinh giúp ủ vỏ cà phê nhanh chóng.', 'https://images.unsplash.com/photo-1585314062340-f1a5acc23555?w=400', 'fertilizer', 1);

-- Dumping data for table inventory_stock
INSERT IGNORE INTO `inventory_stock` (`item_id`, `quantity`) VALUES
	(1, 100), (2, 100), (3, 100), (4, 100), (5, 100), (13, 50), (15, 50);

-- Dumping data for table projects
INSERT IGNORE INTO `projects` (`id`, `title`, `description`, `image_url`, `target_amount`, `current_amount`, `status`) VALUES
  (1, 'Phủ xanh Buôn Làng', 'Dự án trồng 1000 cây xanh quanh khu vực suối.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', 1000, 450, 'active'),
  (2, 'Vườn ươm Thanh niên', 'Hỗ trợ giống cây cho thanh niên khởi nghiệp.', 'https://images.unsplash.com/photo-1530836361253-efad5cb2fe2e?w=800', 500, 120, 'active');

SET FOREIGN_KEY_CHECKS=1;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
