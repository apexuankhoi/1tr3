-- --------------------------------------------------------
-- Database: app01 - Nông Nghiệp Xanh
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS app01;
USE app01;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ── 1. Bảng Users ──
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `dob` varchar(50) DEFAULT NULL,
  `role` enum('farmer','buyer','moderator','admin') DEFAULT 'farmer',
  `level` int(11) DEFAULT 1,
  `exp` int(11) DEFAULT 0,
  `coins` int(11) DEFAULT 0,
  `seeds` int(11) DEFAULT 2,
  `water_level` float DEFAULT 0,
  `energy_level` float DEFAULT 1,
  `growth_stage` varchar(100) DEFAULT 'Nảy mầm',
  `growing_until` bigint(20) DEFAULT 0,
  `last_lat` decimal(10,8) DEFAULT NULL,
  `last_lng` decimal(11,8) DEFAULT NULL,
  `last_seen` timestamp NULL DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `cover_url` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 2. Bảng Tasks ──
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `reward` int(11) NOT NULL,
  `exp_reward` int(11) DEFAULT 20,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `task_group` varchar(50) DEFAULT 'action',
  `task_type` varchar(50) DEFAULT 'photo',
  `frequency` varchar(50) DEFAULT 'daily',
  `needs_gps` tinyint(1) DEFAULT 0,
  `needs_moderator` tinyint(1) DEFAULT 1,
  `quiz_options` json DEFAULT NULL,
  `quiz_answer` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 3. Bảng Library ──
CREATE TABLE IF NOT EXISTS `library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `type` varchar(20) DEFAULT 'image',
  `category_color` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 4. Bảng Shop Items ──
CREATE TABLE IF NOT EXISTS `shop_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `item_type` enum('seed', 'tool', 'pot_skin') DEFAULT 'seed',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 5. Bảng Inventory Stock ──
CREATE TABLE IF NOT EXISTS `inventory_stock` (
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 100,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 6. Bảng Inventory ──
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_item` (`user_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 7. Bảng Redemptions ──
CREATE TABLE IF NOT EXISTS `redemptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `qr_code` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `redeemed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `collected_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`),
  KEY `user_id` (`user_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `redemptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `redemptions_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 8. Bảng Task Submissions ──
CREATE TABLE IF NOT EXISTS `task_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 9. Bảng AI Verifications ──
CREATE TABLE IF NOT EXISTS `ai_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `ai_verifications_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `task_submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 10. Bảng User Pots ──
CREATE TABLE IF NOT EXISTS `user_pots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `pot_id` varchar(50) NOT NULL,
  `floor_id` int(11) DEFAULT 1,
  `has_plant` tinyint(1) DEFAULT 0,
  `water_level` float DEFAULT 0,
  `fertilizer_level` float DEFAULT 0,
  `growth_stage` varchar(100) DEFAULT 'Nảy mầm',
  `growing_until` bigint(20) DEFAULT 0,
  `skin_id` varchar(50) DEFAULT 'default',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_pots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 11. Bảng Push Tokens ──
CREATE TABLE IF NOT EXISTS `push_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `platform` varchar(20) DEFAULT 'android',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `push_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ==========================================================
-- DUMPING DATA
-- ==========================================================

SET FOREIGN_KEY_CHECKS=0;

-- Dumping data for table users
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `dob`, `role`, `level`, `exp`, `coins`, `seeds`, `water_level`, `energy_level`, `growth_stage`, `growing_until`, `last_lat`, `last_lng`, `last_seen`, `avatar_url`, `cover_url`, `bio`, `location`, `created_at`) VALUES
	(1, '0899321716', '123456', 'Nguyễn Xuân Khởi', 'alexuankhoi@gmail.com', '26/04/2000', 'farmer', 1, 0, 30, 2, NULL, NULL, NULL, 0, 10.7768883, 106.70098, '2026-04-26 20:51:10', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777233698/nong_nghiep_xanh/jndovetm3495fd80irxr.png', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777232393/nong_nghiep_xanh/qdjxnfkc3j4mw0lcwifl.jpg', 'Tôi tên là khởi người kinh', 'H. Đan Phượng, Thành Phố Hà Nội', '2026-04-26 18:21:41'),
	(2, '0123456', '123456', 'Nguyen Xuan Khoi', 'hehe@gmail.com', '16/04/2006', 'farmer', 1, 0, 0, 2, 0, 1, 'Nảy mầm', 0, 10.7768883, 106.70098, '2026-04-27 03:26:38', NULL, NULL, NULL, NULL, '2026-04-26 20:56:54');

-- Dumping data for table shop_items
INSERT IGNORE INTO `shop_items` (`id`, `name`, `price`, `description`, `image_url`) VALUES
	(1, 'Hạt giống Cà chua', 50, 'Hạt giống F1 nảy mầm nhanh', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 'seed'),
	(2, 'Phân hữu cơ vi sinh 5kg', 200, 'Phân bón giàu dinh dưỡng', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400', 'tool'),
	(3, 'Bình tưới cây 2L', 150, 'Bình xịt áp suất cao', 'https://images.unsplash.com/photo-1416879598056-0cbb04922ba4?w=400', 'tool'),
	(4, 'Chậu Sứ Trắng', 300, 'Chậu sứ trắng tinh khôi, sang trọng.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', 'pot_skin'),
	(5, 'Chậu Gốm Đất Nung', 200, 'Phong cách cổ điển, mộc mạc.', 'https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=400', 'pot_skin'),
	(6, 'Chậu Vàng Hoàng Gia', 1000, 'Dành cho các đại gia nông nghiệp.', 'https://images.unsplash.com/photo-1581447100595-3a74a5af060f?w=400', 'pot_skin');

-- Dumping data for table inventory_stock
INSERT IGNORE INTO `inventory_stock` (`item_id`, `quantity`) VALUES
	(1, 100),
	(2, 100),
	(3, 100);

-- Dumping data for table library
INSERT IGNORE INTO `library` (`id`, `title`, `category`, `duration`, `description`, `image_url`, `video_url`, `type`, `category_color`, `created_at`) VALUES
	(1, 'Kỹ thuật ủ phân hữu cơ', 'KỸ THUẬT', '5:20', 'Hướng dẫn chi tiết cách ủ phân từ rác thải sinh hoạt và phụ phẩm nông nghiệp.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777231580/nong_nghiep_xanh/wcwyvz8nbrnburjzlfak.jpg', NULL, 'image', '#154212', '2026-04-26 18:21:00'),
	(2, 'Phân loại rác tại nguồn', 'MÔI TRƯỜNG', '3:45', 'Tại sao nông dân cần phân loại rác và cách thực hiện đúng chuẩn 3R.', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', NULL, 'image', '#d97706', '2026-04-26 18:21:00'),
	(3, 'Bảo vệ nguồn nước buôn làng', 'SINH HOẠT', '4:12', 'Các biện pháp bảo vệ giếng nước và hệ thống thủy lợi khỏi ô nhiễm thuốc trừ sâu.', 'https://images.unsplash.com/photo-1548504769-900b700126a1?w=800', NULL, 'image', '#2563eb', '2026-04-26 18:21:00'),
	(4, 'Nghe nhạc đi nào', 'Trồng trọt', '05:00', NULL, 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777234355/nong_nghiep_xanh/ezesbyjdsxlo3ezokbr3.jpg', NULL, 'image', NULL, '2026-04-26 20:12:38'),
	(5, 'anh yeu em', 'Trồng trọt', '05:00', NULL, '', NULL, 'image', NULL, '2026-04-26 20:16:27');

-- Dumping data for table tasks
INSERT IGNORE INTO `tasks` (`id`, `title`, `reward`, `category`, `description`, `icon`, `task_group`, `task_type`, `frequency`, `needs_gps`, `needs_moderator`, `quiz_options`, `quiz_answer`) VALUES
	(1, 'Gom rơm rạ/vỏ cà phê', 60, 'Action', 'Chụp ảnh gom rơm rạ/vỏ cà phê thành đống sau thu hoạch.', 'camera', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(2, 'Trộn men vi sinh', 70, 'Action', 'Chụp ảnh đang trộn men vi sinh vào đống ủ.', 'camera', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(3, 'Tưới giữ ẩm đống ủ', 50, 'Action', 'Chụp ảnh đang tưới nước giữ ẩm cho đống ủ phân.', 'water', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(4, 'Che đậy bạt đống ủ', 50, 'Action', 'Chụp ảnh/quay video (5s) che đậy bạt bảo vệ đống ủ.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL),
	(5, 'Đảo đống ủ cho thoáng', 60, 'Action', 'Quay video ngắn cảnh dùng xẻng đảo đống ủ cho thoáng khí.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL),
	(6, 'Phân hoai mục thành công', 100, 'Action', 'Chụp ảnh đống phân hữu cơ đã hoai mục thành công (đen, tơi xốp).', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(7, 'Bón phân tự ủ cho cây', 80, 'Action', 'Chụp ảnh đang bón phân tự ủ cho gốc cây cà phê / hoa màu.', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(8, 'Phân loại rác tại bếp', 60, 'Action', 'Chụp ảnh phân loại rác hữu cơ (rau củ thừa) và vô cơ (túi nilon) tại bếp.', 'recycle', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(9, 'Vứt rác vô cơ đúng nơi', 40, 'Action', 'Chụp ảnh vứt rác vô cơ đúng nơi quy định của buôn làng.', 'trash-can', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(10, 'Nhặt vỏ chai thuốc trên rẫy', 70, 'Action', 'Chụp ảnh nhặt vỏ chai/bao bì thuốc bảo vệ thực vật trên rẫy.', 'delete-sweep', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(11, 'Nộp bao bì thuốc trừ sâu', 80, 'Action', 'Chụp ảnh đem bao bì thuốc trừ sâu nộp tại điểm thu gom chung.', 'truck-delivery', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(12, 'Tái chế đồ cũ thành chậu', 90, 'Action', 'Chụp ảnh tái chế (dùng chai nhựa cũ làm chậu ươm hạt mầm).', 'recycle', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(13, 'Quét dọn đường làng', 60, 'Action', 'Chụp ảnh tham gia quét dọn đường làng ngõ xóm.', 'broom', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(14, 'Giới thiệu app cho hàng xóm', 120, 'Action', 'Quét mã QR giới thiệu app thành công cho một người hàng xóm.', 'qrcode', 'action', 'qr', 'weekly', 0, 1, NULL, NULL),
	(15, 'Buộc kín túi rác trước khi vứt', 40, 'Action', 'Chụp ảnh túi rác hoặc bao tải rác đã được buộc kín trước khi vứt.', 'bag-checked', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(16, 'Báo cáo đốt rơm rạ', 100, 'Report', 'Báo cáo tọa độ đang có đống rơm rạ bị đốt (kèm ảnh khói).', 'fire-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(17, 'Báo cáo đốt rác nông nghiệp', 100, 'Report', 'Báo cáo tọa độ đang đốt vỏ cà phê / rác thải nông nghiệp.', 'fire', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(18, 'Báo cáo bãi rác tự phát', 80, 'Report', 'Báo cáo một bãi rác tự phát mới xuất hiện cạnh đường/kênh rạch.', 'map-marker-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(19, 'Báo cáo vỏ chai thuốc vứt bừa', 80, 'Report', 'Báo cáo khu vực có nhiều vỏ chai thuốc trừ sâu vứt bừa bãi.', 'alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(20, 'Cập nhật điểm ô nhiễm đã sạch', 120, 'Report', 'Chụp ảnh điểm ô nhiễm (đã báo cáo trước đó) nay đã được dọn sạch.', 'check-circle', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(21, 'Báo cáo khói mù không rõ nguồn', 90, 'Report', 'Báo cáo khói mù mịt không rõ nguồn gốc gây ảnh hưởng tầm nhìn.', 'weather-fog', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(22, 'Báo cáo xả rác xuống suối', 100, 'Report', 'Báo cáo hành vi xả rác sinh hoạt thẳng xuống suối/nguồn nước.', 'water-off', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(23, 'Đánh dấu đống ủ lên bản đồ', 60, 'Report', 'Đánh dấu vị trí đống ủ phân sinh học chuẩn của nhà mình lên bản đồ.', 'map-marker-plus', 'report', 'gps', 'weekly', 1, 1, NULL, NULL),
	(24, 'Báo cáo điểm tập kết rác quá tải', 70, 'Report', 'Báo cáo điểm tập kết rác của buôn làng đang bị quá tải, chưa có xe thu gom.', 'trash-can-outline', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(25, 'SOS: Báo cháy lan rộng', 150, 'Report', 'Báo cáo nhanh (SOS) đám cháy có nguy cơ lan rộng.', 'fire-extinguisher', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(26, 'Quiz: Ủ rơm mất bao lâu?', 50, 'Quiz', 'Rơm rạ ủ men vi sinh mất bao lâu thì bón được cho cây?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. 1 tuần","B. 30-45 ngày","C. 3 tháng","D. 1 năm"]', 'B'),
	(27, 'Quiz: Khói nilon chứa chất gì?', 50, 'Quiz', 'Khói đốt rác nilon chứa chất độc gì gây ung thư?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. CO2","B. Dioxin","C. Metan","D. Oxy"]', 'B'),
	(28, 'Quiz: Đất rẫy bị đốt thường xuyên sẽ màu mỡ hơn hay bạc màu đi?', 50, 'Quiz', 'Đất rẫy bị đốt thường xuyên sẽ màu mỡ hơn hay bạc màu đi?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Màu mỡ hơn","B. Bạc màu đi"]', 'B'),
	(29, 'Quiz: Men vi sinh khử mùi?', 40, 'Quiz', 'Men vi sinh có tác dụng khử mùi hôi đống ủ, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Đúng'),
	(30, 'Quiz: Ủ kín không cần tưới?', 40, 'Quiz', 'Vỏ cà phê đậy bạt kín hoàn toàn không cần tưới nước, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Sai'),
	(31, 'Quiz: Đốt bao bì thuốc được không?', 60, 'Quiz', 'Bao bì thuốc trừ sâu đã dùng hết có được mang đốt chung với rác sinh hoạt không?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Được","Không được"]', 'Không được'),
	(32, 'Quiz: Phân hữu cơ vs hóa học?', 50, 'Quiz', 'Phân hữu cơ hoai mục giúp rễ cây hấp thụ nước tốt hơn phân hóa học, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Đúng'),
	(33, 'Quiz: Tỷ lệ pha men vi sinh?', 50, 'Quiz', 'Tỷ lệ pha men vi sinh với nước chuẩn là bao nhiêu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. 1:10","B. 1:100","C. 1:500","D. 1:1000"]', 'C'),
	(34, 'Xem video Già làng kể chuyện', 60, 'Quiz', 'Xem hết 1 video "Già làng kể chuyện bảo vệ đất" (thời lượng 1-2 phút).', 'play-circle', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(35, 'Nghe audio tiếng Ê Đê', 60, 'Quiz', 'Nghe trọn vẹn 1 file audio tiếng Ê Đê hướng dẫn trộn phân.', 'headphones', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(36, 'Xem infographic ủ vỏ cà phê', 50, 'Quiz', 'Xem và vuốt chạm hết 1 Infographic "4 bước ủ vỏ cà phê".', 'image', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(37, 'Đọc mẹo nông nghiệp xanh hôm nay', 40, 'Quiz', 'Đọc "Mẹo nông nghiệp xanh" hiển thị dưới dạng pop-up của ngày hôm nay.', 'book-open', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(38, 'Xem video tác hại khói đốt rẫy', 70, 'Quiz', 'Xem video cảnh báo tác hại của khói đốt rẫy đến hệ hô hấp của trẻ em.', 'play-circle', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(39, 'Điểm danh hôm nay', 20, 'Quiz', 'Điểm danh: Đăng nhập mở app ngày hôm nay.', 'calendar-today', 'learn', 'checkin', 'daily', 0, 0, NULL, NULL),
	(40, 'Streak 3 ngày liên tiếp', 80, 'Quiz', 'Chuỗi (Streak): Đăng nhập liên tiếp 3 ngày.', 'fire', 'learn', 'streak', 'daily', 0, 0, NULL, NULL),
	(41, 'Streak 7 ngày liên tiếp', 200, 'Quiz', 'Chuỗi (Streak): Đăng nhập liên tiếp 7 ngày (thưởng rương Xu ngẫu nhiên).', 'trophy', 'learn', 'streak', 'daily', 0, 0, NULL, NULL),
	(42, 'Tưới/bón phân cây ảo', 30, 'Quiz', 'Click tưới nước/bón phân cho "Cây ảo" trên trang chủ.', 'leaf', 'learn', 'interact', 'daily', 0, 0, NULL, NULL),
	(43, 'Nhiệm vụ Combo trong ngày', 150, 'Quiz', 'Hoàn thành ít nhất 1 task Hành động + 1 task Học tập trong cùng 1 ngày (Bonus thêm Xu).', 'star-circle', 'learn', 'combo', 'daily', 0, 0, NULL, NULL);

-- Dumping data for table user_pots
INSERT IGNORE INTO `user_pots` (`id`, `user_id`, `pot_id`, `floor_id`, `has_plant`, `water_level`, `fertilizer_level`, `growth_stage`, `growing_until`, `updated_at`) VALUES
	(1, 1, 'floor1_pot1', 1, 1, 0, 0, 'Cây non', 0, '2026-04-26 20:51:11'),
	(2, 1, 'floor1_pot2', 1, 1, 1, 1, 'Nảy mầm', 1777237674789, '2026-04-26 20:08:02'),
	(3, 1, 'floor1_pot3', 1, 1, 1, 1, 'Nảy mầm', 1777237677588, '2026-04-26 20:08:02'),
	(4, 1, 'floor2_pot1', 2, 1, 1, 1, 'Nảy mầm', 1777237679910, '2026-04-26 20:08:02'),
	(5, 1, 'floor2_pot2', 2, 1, 0, 0, 'Cây non', 0, '2026-04-26 20:20:00'),
	(6, 1, 'floor2_pot3', 2, 1, 1, 1, 'Nảy mầm', 1777237684220, '2026-04-26 20:08:06');

-- Dumping data for table task_submissions
INSERT IGNORE INTO `task_submissions` (`id`, `user_id`, `task_id`, `image_url`, `status`, `submitted_at`) VALUES
	(1, 1, 13, 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777232471/nong_nghiep_xanh/qkhs4htnu8vgbi5u0irc.jpg', 'approved', '2026-04-26 19:41:13'),
	(2, 1, 10, 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777234104/nong_nghiep_xanh/wj6keccmgn6ileq9qfdg.jpg', 'approved', '2026-04-26 20:08:26');

-- Dumping data for table inventory
INSERT IGNORE INTO `inventory` (`id`, `user_id`, `item_id`) VALUES
	(1, 1, 1);

-- Dumping data for table redemptions
INSERT IGNORE INTO `redemptions` (`id`, `user_id`, `item_id`, `qr_code`, `status`, `redeemed_at`, `collected_at`) VALUES
	(1, 1, 1, 'REDEEM-1-1-1777234392202', 'pending', '2026-04-26 20:13:12', NULL),
	(2, 1, 1, 'REDEEM-1-1-1777234399571', 'pending', '2026-04-26 20:13:19', NULL);

SET FOREIGN_KEY_CHECKS=1;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
