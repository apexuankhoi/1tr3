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
  `quiz_explanation` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table app01.tasks: 12 rows
INSERT INTO `tasks` (`id`, `title`, `reward`, `exp_reward`, `category`, `description`, `icon`, `task_group`, `task_type`, `frequency`, `needs_gps`, `needs_moderator`, `quiz_options`, `quiz_answer`, `quiz_explanation`) VALUES
	(1, 'Ủ phân vỏ cà phê', 60, 20, 'Action', 'Chụp ảnh quá trình ủ vỏ cà phê bằng men vi sinh tại rẫy.', 'shoveler', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(2, 'Báo cáo đốt rẫy', 0, 20, 'Report', 'Chụp ảnh và lẩy tọa độ GPS điểm đang có khói bụi/đốt rẫy.', 'fire-alert', 'report', 'photo', 'daily', 1, 0, NULL, NULL, NULL),
	(3, 'Quiz: Hạt bụi nguy hiểm', 40, 20, 'Quiz', 'Khói bụi sinh ra từ việc đốt vỏ cà phê và rơm rạ trên rẫy chứa loại hạt nào đặc biệt nguy hiểm cho đường hô hấp của con người?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Bụi mịn PM2.5", "B. Khí Oxi trong lành", "C. Hơi nước tinh khiết", "D. Khí hiếm"]', 'A', 'Khói đốt rác thải nông nghiệp chứa lượng lớn bụi mịn PM2.5, loại bụi siêu nhỏ này có thể xâm nhập sâu vào phổi và máu, làm tăng nguy cơ mắc các bệnh về hô hấp.'),
	(4, 'Quiz: Hậu quả đốt rác', 40, 20, 'Quiz', 'Nhiều người cho rằng đốt vỏ cà phê lấy tro sẽ tốt cho rẫy. Tuy nhiên, sức nóng từ việc đốt rác ngay trên mặt đất thực chất gây ra hậu quả gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiêu diệt hệ vi sinh vật có lợi và làm đất chai cứng.", "B. Làm đất tơi xốp và nhiều giun đất hơn.", "C. Giúp nấm bệnh phát triển tốt hơn.", "D. Tăng cường độ ẩm cho đất."]', 'A', 'Nhiệt độ cao từ ngọn lửa thiụ rụi chất mùn và giết chết các sinh vật có lợi dưới lớp đất mặt (như giun, dế, vi khuẩn tơi xốp), khiến đất đỏ bazan ngày càng bạc màu, chai cứng.'),
	(5, 'Quiz: Men vi sinh phổ biến', 40, 20, 'Quiz', 'Loại men vi sinh (chế phẩm sinh học) nào thường được sử dụng phổ biến nhất để trộn vào vỏ cà phê giúp đẩy nhanh quá trình phân hủy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nấm đối kháng Trichoderma", "B. Men tiêu hóa", "C. Thuốc trừ sâu sinh học", "D. Nước muối pha loãng"]', 'A', 'Trichoderma là loại nấm có lợi, vừa giúp phân hủy nhanh lớp vỏ cà phê cứng cáp, vừa tiêu diệt các loại nấm bệnh gây hại cho rễ cây.'),
	(6, 'Quiz: Tại sao cần che bạt?', 40, 20, 'Quiz', 'Trong quy trình ủ phân vi sinh, vì sao bà con cần phải che đậy bạt thật kín lên đống ủ?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Để giữ ẩm, duy trì nhiệt độ tối ưu và tránh mưa rửa trôi.", "B. Để ngăn chim chóc ăn mất vỏ cà phê.", "C. Để phân không bị bốc mùi bay sang nhà hàng xóm.", "D. Để ánh nắng mặt trời làm khô phân nhanh hơn."]', 'A', 'Che bạt tạo ra một "lồng ấp" lý tưởng (đủ nhiệt độ và độ ẩm) giúp vi sinh vật Trichoderma sinh sôi và phân hủy bã cà phê với tốc độ nhanh nhất.'),
	(7, 'Quiz: Thời gian ủ phân', 40, 20, 'Quiz', 'Thông thường, một đống ủ vỏ cà phê với men vi sinh cần thời gian bao lâu để phân hủy hoàn toàn thành "vàng đen"?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Khoảng 2 đến 3 tháng", "B. Chỉ sau 1 tuần", "C. Cần ít nhất 1 năm", "D. Khoảng 3 đến 5 ngày"]', 'A', '2 đến 3 tháng là khoảng thời gian chuẩn kỹ thuật để vỏ cà phê được vi sinh vật phân giải hoàn toàn thành mùn tơi xốp, giàu dinh dưỡng, sẵn sàng đem bón cho gốc cà phê.'),
	(8, 'Quiz: Dấu hiệu phân chín', 40, 20, 'Quiz', 'Dấu hiệu nào cho thấy mẻ phân ủ hữu cơ từ vỏ cà phê đã hoàn thành, đạt chất lượng và sẵn sàng đem bón cho rẫy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phân có màu nâu đen, tơi xốp và không có mùi hôi.", "B. Phân vẫn còn nguyên hình dạng vỏ cà phê cứng.", "C. Phân có mùi chua gắt và rỉ nhiều nước.", "D. Đống ủ đang nóng ran và bốc khói."]', 'A', 'Màu nâu đen (vàng đen) và độ tơi xốp chứng tỏ chất hữu cơ đã hoai mục hoàn toàn. Mùi hôi biến mất do hệ vi sinh có lợi đã khử mùi triệt để.'),
	(9, 'Quiz: Lợi ích kinh tế', 40, 20, 'Quiz', 'Việc tận dụng vỏ cà phê làm phân bón tại chỗ mang lại lợi ích kinh tế nào thiết thực nhất cho bà con nông dân?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiết kiệm đáng kể chi phí mua phân bón vô cơ (hóa học).", "B. Tăng giá bán hạt cà phê trên thị trường.", "C. Giúp thời gian thu hoạch cà phê nhanh hơn.", "D. Giúp rẫy hoàn toàn không bao giờ có cỏ dại."]', 'A', 'Phân hữu cơ tự ủ giúp đất phục hồi độ màu mỡ, từ đó giúp gia đình giảm được một khoản tiền rất lớn để mua phân bón hóa học mỗi năm.'),
	(10, 'Quiz: Kiểm tra độ ẩm', 40, 20, 'Quiz', 'Bằng mắt và tay không, cách nào sau đây giúp bà con nhận biết đống ủ đạt độ ẩm chuẩn?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nắm chặt một nắm bã ủ, thấy rỉ nước nhẹ ở kẽ tay là đạt.", "B. Nhìn bằng mắt thấy vỏ cà phê bay bụi là đạt.", "C. Giẫm chân lên thấy lún sâu rập rềnh là đạt.", "D. Đưa tay vào thấy lạnh buốt là đạt."]', 'A', 'Đây là mẹo kỹ thuật chuẩn xác được các cán bộ khuyến nông hướng dẫn: nước rỉ nhẹ ra kẽ tay nhưng không chảy ròng ròng cho thấy độ ẩm đạt khoảng 60%, mức lý tưởng nhất cho đống ủ.'),
	(11, 'Quiz: Nguyên liệu kết hợp', 40, 20, 'Quiz', 'Ngoài vỏ cà phê, bà con có thể kết hợp thêm nguyên liệu nào sau đây để mẻ phân ủ đạt chất lượng tốt nhất?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phân chuồng (bò, gà, heo) và rơm rạ.", "B. Bao bì nilon và chai nhựa.", "C. Gạch đá vụn và xà bần.", "D. Pin cũ và thiết bị điện tử hỏng."]', 'A', 'Phân chuồng cung cấp đạm, rơm rạ cung cấp carbon. Khi kết hợp cùng vỏ cà phê sẽ tạo ra nguồn dinh dưỡng toàn diện và cân bằng nhất cho cây trồng.'),
	(12, 'Quiz: Bảo vệ buôn làng', 40, 20, 'Quiz', 'Hành động từ bỏ thói quen đốt rẫy sang ủ phân hữu cơ góp phần trực tiếp bảo vệ đối tượng yếu thế nào nhất trong buôn làng?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Sửa khỏe đường hô hấp của trẻ em và người già.", "B. Sự phát triển của đàn gia súc.", "C. Hệ thống điện lưới của địa phương.", "D. Giao thông đường bộ của xã."]', 'A', 'Trẻ em và người già có hệ hô hấp rất yếu và nhạy cảm. Việc giảm khói đốt rẫy chính là hành động trực tiếp và thiết thực nhất để bảo vệ lá phổi của họ.');

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
  UNIQUE KEY `unique_user_pot` (`user_id`, `pot_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_pots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
