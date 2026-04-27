-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for app01
CREATE DATABASE IF NOT EXISTS `app01` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `app01`;

-- Dumping structure for table app01.ai_verifications
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.ai_verifications: ~0 rows (approximately)

-- Dumping structure for table app01.inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_item` (`user_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.inventory: ~1 rows (approximately)
INSERT INTO `inventory` (`id`, `user_id`, `item_id`) VALUES
	(2, 7, 1);

-- Dumping structure for table app01.inventory_stock
CREATE TABLE IF NOT EXISTS `inventory_stock` (
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 100,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.inventory_stock: ~3 rows (approximately)
INSERT INTO `inventory_stock` (`item_id`, `quantity`) VALUES
	(1, 100),
	(2, 100),
	(4, 1);

-- Dumping structure for table app01.library
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.library: ~2 rows (approximately)
INSERT INTO `library` (`id`, `title`, `category`, `duration`, `description`, `image_url`, `video_url`, `type`, `category_color`, `created_at`) VALUES
	(2, 'Phân loại rác tại nguồn', 'MÔI TRƯỜNG', '3:45', 'Tại sao nông dân cần phân loại rác và cách thực hiện đúng chuẩn 3R.', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', NULL, 'image', '#d97706', '2026-04-26 11:21:00'),
	(3, 'Bảo vệ nguồn nước buôn làng', 'SINH HOẠT', '4:12', 'Các biện pháp bảo vệ giếng nước và hệ thống thủy lợi khỏi ô nhiễm thuốc trừ sâu.', 'https://images.unsplash.com/photo-1548504769-900b700126a1?w=800', NULL, 'image', '#2563eb', '2026-04-26 11:21:00');

-- Dumping structure for table app01.projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_value` int(11) DEFAULT 10000,
  `current_value` int(11) DEFAULT 0,
  `unit` varchar(50) DEFAULT 'cây',
  `icon` varchar(50) DEFAULT 'account-group',
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.projects: ~1 rows (approximately)
INSERT INTO `projects` (`id`, `title`, `description`, `target_value`, `current_value`, `unit`, `icon`, `status`, `created_at`) VALUES
	(1, 'Dự án Làng Cà Phê', 'Mục tiêu: Trồng 10,000 cây cà phê hữu cơ trong mùa vụ năm nay.', 10000, 6540, 'cây', 'account-group', 'active', '2026-04-27 17:51:33');

-- Dumping structure for table app01.push_tokens
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

-- Dumping data for table app01.push_tokens: ~0 rows (approximately)

-- Dumping structure for table app01.redemptions
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.redemptions: ~1 rows (approximately)
INSERT INTO `redemptions` (`id`, `user_id`, `item_id`, `qr_code`, `status`, `redeemed_at`, `collected_at`) VALUES
	(3, 7, 1, 'REDEEM-7-1-1777256090067', 'pending', '2026-04-27 02:14:50', NULL);

-- Dumping structure for table app01.shop_items
CREATE TABLE IF NOT EXISTS `shop_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.shop_items: ~3 rows (approximately)
INSERT INTO `shop_items` (`id`, `name`, `price`, `description`, `image_url`) VALUES
	(1, 'Hạt giống Cà chua', 50, 'Hạt giống F1 nảy mầm nhanh', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400'),
	(2, 'Phân hữu cơ vi sinh 5kg', 200, 'Phân bón giàu dinh dưỡng', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400'),
	(4, 'Mỳ tôm hảo hảo', 20, 'Mỳ tôm hảo hảo có xúc xích và thịt quay', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777305407/nong_nghiep_xanh/p3yuk891agdzv0d7pimr.jpg');

-- Dumping structure for table app01.task_submissions
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.task_submissions: ~6 rows (approximately)
INSERT INTO `task_submissions` (`id`, `user_id`, `task_id`, `image_url`, `status`, `submitted_at`) VALUES
	(3, 6, 36, 'auto', 'approved', '2026-04-27 01:51:04'),
	(4, 6, 35, 'auto', 'approved', '2026-04-27 01:51:09'),
	(5, 7, 38, 'auto', 'approved', '2026-04-27 02:14:19'),
	(6, 7, 34, 'auto', 'approved', '2026-04-27 02:14:25'),
	(8, 8, 9, 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777299053/nong_nghiep_xanh/nswbx1kvyepe5d7me4zo.jpg', 'approved', '2026-04-27 14:10:47'),
	(9, 8, 18, 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777299324/nong_nghiep_xanh/zc4bkcrayhg2vc22xfhb.jpg|GPS:12.65583,108.02833|ADDR:8b, Y Wang, Đắk Lắk', 'pending', '2026-04-27 14:15:19');

-- Dumping structure for table app01.tasks
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
  `quiz_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`quiz_options`)),
  `quiz_answer` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.tasks: ~41 rows (approximately)
INSERT INTO `tasks` (`id`, `title`, `reward`, `exp_reward`, `category`, `description`, `icon`, `task_group`, `task_type`, `frequency`, `needs_gps`, `needs_moderator`, `quiz_options`, `quiz_answer`) VALUES
	(3, 'Tưới giữ ẩm đống ủ', 50, 20, 'Action', 'Chụp ảnh đang tưới nước giữ ẩm cho đống ủ phân.', 'water', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(4, 'Che đậy bạt đống ủ', 50, 20, 'Action', 'Chụp ảnh/quay video (5s) che đậy bạt bảo vệ đống ủ.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL),
	(5, 'Đảo đống ủ cho thoáng', 60, 20, 'Action', 'Quay video ngắn cảnh dùng xẻng đảo đống ủ cho thoáng khí.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL),
	(6, 'Phân hoai mục thành công', 100, 20, 'Action', 'Chụp ảnh đống phân hữu cơ đã hoai mục thành công (đen, tơi xốp).', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(7, 'Bón phân tự ủ cho cây', 80, 20, 'Action', 'Chụp ảnh đang bón phân tự ủ cho gốc cây cà phê / hoa màu.', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(8, 'Phân loại rác tại bếp', 60, 20, 'Action', 'Chụp ảnh phân loại rác hữu cơ (rau củ thừa) và vô cơ (túi nilon) tại bếp.', 'recycle', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(9, 'Vứt rác vô cơ đúng nơi', 40, 20, 'Action', 'Chụp ảnh vứt rác vô cơ đúng nơi quy định của buôn làng.', 'trash-can', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(10, 'Nhặt vỏ chai thuốc trên rẫy', 70, 20, 'Action', 'Chụp ảnh nhặt vỏ chai/bao bì thuốc bảo vệ thực vật trên rẫy.', 'delete-sweep', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(11, 'Nộp bao bì thuốc trừ sâu', 80, 20, 'Action', 'Chụp ảnh đem bao bì thuốc trừ sâu nộp tại điểm thu gom chung.', 'truck-delivery', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(12, 'Tái chế đồ cũ thành chậu', 90, 20, 'Action', 'Chụp ảnh tái chế (dùng chai nhựa cũ làm chậu ươm hạt mầm).', 'recycle', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(13, 'Quét dọn đường làng', 60, 20, 'Action', 'Chụp ảnh tham gia quét dọn đường làng ngõ xóm.', 'broom', 'action', 'photo', 'weekly', 0, 1, NULL, NULL),
	(14, 'Giới thiệu app cho hàng xóm', 120, 20, 'Action', 'Quét mã QR giới thiệu app thành công cho một người hàng xóm.', 'qrcode', 'action', 'qr', 'weekly', 0, 1, NULL, NULL),
	(15, 'Buộc kín túi rác trước khi vứt', 40, 20, 'Action', 'Chụp ảnh túi rác hoặc bao tải rác đã được buộc kín trước khi vứt.', 'bag-checked', 'action', 'photo', 'daily', 0, 1, NULL, NULL),
	(16, 'Báo cáo đốt rơm rạ', 100, 20, 'Report', 'Báo cáo tọa độ đang có đống rơm rạ bị đốt (kèm ảnh khói).', 'fire-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(17, 'Báo cáo đốt rác nông nghiệp', 100, 20, 'Report', 'Báo cáo tọa độ đang đốt vỏ cà phê / rác thải nông nghiệp.', 'fire', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(18, 'Báo cáo bãi rác tự phát', 80, 20, 'Report', 'Báo cáo một bãi rác tự phát mới xuất hiện cạnh đường/kênh rạch.', 'map-marker-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(19, 'Báo cáo vỏ chai thuốc vứt bừa', 80, 20, 'Report', 'Báo cáo khu vực có nhiều vỏ chai thuốc trừ sâu vứt bừa bãi.', 'alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(20, 'Cập nhật điểm ô nhiễm đã sạch', 120, 20, 'Report', 'Chụp ảnh điểm ô nhiễm (đã báo cáo trước đó) nay đã được dọn sạch.', 'check-circle', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(21, 'Báo cáo khói mù không rõ nguồn', 90, 20, 'Report', 'Báo cáo khói mù mịt không rõ nguồn gốc gây ảnh hưởng tầm nhìn.', 'weather-fog', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(22, 'Báo cáo xả rác xuống suối', 100, 20, 'Report', 'Báo cáo hành vi xả rác sinh hoạt thẳng xuống suối/nguồn nước.', 'water-off', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(23, 'Đánh dấu đống ủ lên bản đồ', 60, 20, 'Report', 'Đánh dấu vị trí đống ủ phân sinh học chuẩn của nhà mình lên bản đồ.', 'map-marker-plus', 'report', 'gps', 'weekly', 1, 1, NULL, NULL),
	(24, 'Báo cáo điểm tập kết rác quá tải', 70, 20, 'Report', 'Báo cáo điểm tập kết rác của buôn làng đang bị quá tải, chưa có xe thu gom.', 'trash-can-outline', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(25, 'SOS: Báo cháy lan rộng', 150, 20, 'Report', 'Báo cáo nhanh (SOS) đám cháy có nguy cơ lan rộng.', 'fire-extinguisher', 'report', 'photo', 'daily', 1, 1, NULL, NULL),
	(26, 'Khói bụi sinh ra từ việc đốt vỏ cà phê và rơm rạ trên rẫy chứa loại hạt nào đặc biệt nguy hiểm cho đường hô hấp của con người? ', 50, 20, 'Quiz', 'Rơm rạ ủ men vi sinh mất bao lâu thì bón được cho cây?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. 1 tuần","B. 30-45 ngày","C. 3 tháng","D. 1 năm"]', 'B'),
	(27, 'Quiz: Khói nilon chứa chất gì?', 50, 20, 'Quiz', 'Khói đốt rác nilon chứa chất độc gì gây ung thư?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. CO2","B. Dioxin","C. Metan","D. Oxy"]', 'B'),
	(28, 'Quiz: Đất rẫy bị đốt thường xuyên sẽ màu mỡ hơn hay bạc màu đi?', 50, 20, 'Quiz', 'Đất rẫy bị đốt thường xuyên sẽ màu mỡ hơn hay bạc màu đi?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Màu mỡ hơn","B. Bạc màu đi"]', 'B'),
	(29, 'Quiz: Men vi sinh khử mùi?', 40, 20, 'Quiz', 'Men vi sinh có tác dụng khử mùi hôi đống ủ, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Đúng'),
	(30, 'Quiz: Ủ kín không cần tưới?', 40, 20, 'Quiz', 'Vỏ cà phê đậy bạt kín hoàn toàn không cần tưới nước, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Sai'),
	(31, 'Quiz: Đốt bao bì thuốc được không?', 60, 20, 'Quiz', 'Bao bì thuốc trừ sâu đã dùng hết có được mang đốt chung với rác sinh hoạt không?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Được","Không được"]', 'Không được'),
	(32, 'Quiz: Phân hữu cơ vs hóa học?', 50, 20, 'Quiz', 'Phân hữu cơ hoai mục giúp rễ cây hấp thụ nước tốt hơn phân hóa học, Đúng hay Sai?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["Đúng","Sai"]', 'Đúng'),
	(33, 'Quiz: Tỷ lệ pha men vi sinh?', 50, 20, 'Quiz', 'Tỷ lệ pha men vi sinh với nước chuẩn là bao nhiêu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. 1:10","B. 1:100","C. 1:500","D. 1:1000"]', 'C'),
	(34, 'Xem video Già làng kể chuyện', 60, 20, 'Quiz', 'Xem hết 1 video "Già làng kể chuyện bảo vệ đất" (thời lượng 1-2 phút).', 'play-circle', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(35, 'Nghe audio tiếng Ê Đê', 60, 20, 'Quiz', 'Nghe trọn vẹn 1 file audio tiếng Ê Đê hướng dẫn trộn phân.', 'headphones', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(36, 'Xem infographic ủ vỏ cà phê', 50, 20, 'Quiz', 'Xem và vuốt chạm hết 1 Infographic "4 bước ủ vỏ cà phê".', 'image', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(37, 'Đọc mẹo nông nghiệp xanh hôm nay', 40, 20, 'Quiz', 'Đọc "Mẹo nông nghiệp xanh" hiển thị dưới dạng pop-up của ngày hôm nay.', 'book-open', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(38, 'Xem video tác hại khói đốt rẫy', 70, 20, 'Quiz', 'Xem video cảnh báo tác hại của khói đốt rẫy đến hệ hô hấp của trẻ em.', 'play-circle', 'learn', 'media', 'daily', 0, 0, NULL, NULL),
	(39, 'Điểm danh hôm nay', 20, 20, 'Quiz', 'Điểm danh: Đăng nhập mở app ngày hôm nay.', 'calendar-today', 'learn', 'checkin', 'daily', 0, 0, NULL, NULL),
	(40, 'Streak 3 ngày liên tiếp', 80, 20, 'Quiz', 'Chuỗi (Streak): Đăng nhập liên tiếp 3 ngày.', 'fire', 'learn', 'streak', 'daily', 0, 0, NULL, NULL),
	(41, 'Streak 7 ngày liên tiếp', 200, 20, 'Quiz', 'Chuỗi (Streak): Đăng nhập liên tiếp 7 ngày (thưởng rương Xu ngẫu nhiên).', 'trophy', 'learn', 'streak', 'daily', 0, 0, NULL, NULL),
	(42, 'Tưới/bón phân cây ảo', 30, 20, 'Quiz', 'Click tưới nước/bón phân cho "Cây ảo" trên trang chủ.', 'leaf', 'learn', 'interact', 'daily', 0, 0, NULL, NULL),
	(43, 'Nhiệm vụ Combo trong ngày', 150, 20, 'Quiz', 'Hoàn thành ít nhất 1 task Hành động + 1 task Học tập trong cùng 1 ngày (Bonus thêm Xu).', 'star-circle', 'learn', 'combo', 'daily', 0, 0, NULL, NULL);

-- Dumping structure for table app01.user_pots
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_pots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23929 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.user_pots: ~0 rows (approximately)

-- Dumping structure for table app01.users
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
  `is_locked` tinyint(1) DEFAULT 0,
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
  `village_name` varchar(100) DEFAULT 'Làng Cà Phê',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.users: ~5 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `dob`, `role`, `level`, `exp`, `is_locked`, `coins`, `seeds`, `water_level`, `energy_level`, `growth_stage`, `growing_until`, `last_lat`, `last_lng`, `last_seen`, `avatar_url`, `cover_url`, `bio`, `location`, `village_name`, `created_at`) VALUES
	(6, '0902605306', 'Trang@123', 'Chan Chần', 'syl.tran.hcmue@gmail.com', '03/05/1995', 'admin', 1, 0, 0, 110, 1, NULL, NULL, NULL, 0, 12.80784415, 108.45021401, '2026-04-27 01:57:13', NULL, NULL, NULL, NULL, 'Làng Cà Phê', '2026-04-27 01:50:06'),
	(7, '0888572648', 'Phuonganh@8105', 'Lê Phương Anh', 'heulwen8105@gmail.com', '08/10/2005', 'farmer', 1, 0, 0, 80, 2, NULL, NULL, NULL, 0, 12.44058686, 107.63080789, '2026-04-27 17:41:31', NULL, NULL, NULL, NULL, 'Làng Cà Phê', '2026-04-27 02:11:56'),
	(8, '0942486444', '12345Halamvo@', 'Võ Hạ Lam ', 'vohalam0105@gmail.com', '02/01/2005', 'farmer', 1, 0, 0, 40, 1, 0, 1, 'Nảy mầm', 0, 12.65589930, 108.02833770, '2026-04-27 14:16:22', NULL, NULL, NULL, NULL, 'Làng Cà Phê', '2026-04-27 13:59:36'),
	(13, '0123456789', 'no-pass', 'Nguyễn Văn A', NULL, NULL, 'farmer', 1, 0, 0, 1200, 2, 0, 1, 'Nảy mầm', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Buôn Làng', '2026-04-27 19:45:03'),
	(14, '0987654321', 'no-pass', 'K\'sor H\'Bia', NULL, NULL, 'farmer', 1, 0, 0, 900, 2, 0, 1, 'Nảy mầm', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Buôn Làng', '2026-04-27 19:45:03');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
