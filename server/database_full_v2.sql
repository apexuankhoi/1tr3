-- Nông Nghiệp Xanh - Full Database Schema V3 (Synced with Server Code)
-- Author: Antigravity AI
-- Date: 2026-04-29

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL, -- Đây là số điện thoại
  `password` varchar(255) DEFAULT 'no-pass',
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `cover_url` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `village_name` varchar(100) DEFAULT 'Buôn Làng',
  `role` enum('farmer','moderator','admin') DEFAULT 'farmer',
  `is_locked` tinyint(1) DEFAULT 0,
  `coins` int(11) DEFAULT 1000,
  `level` int(11) DEFAULT 1,
  `exp` int(11) DEFAULT 0,
  `seeds` int(11) DEFAULT 5,
  `water_level` int(11) DEFAULT 100,
  `energy_level` int(11) DEFAULT 100,
  `growth_stage` varchar(50) DEFAULT 'Nảy mầm',
  `growing_until` bigint(20) DEFAULT 0,
  `last_activity_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 2. Table structure for user_pots
-- ----------------------------
DROP TABLE IF EXISTS `user_pots`;
CREATE TABLE `user_pots` (
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
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_pots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 3. Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `reward` int(11) DEFAULT 50, -- Tương ứng reward_coins trong code
  `exp_reward` int(11) DEFAULT 20,
  `category` varchar(100) DEFAULT 'Chung',
  `icon` varchar(50) DEFAULT 'leaf',
  `task_group` varchar(50) DEFAULT 'action', -- weekly, daily...
  `task_type` varchar(50) DEFAULT 'photo', -- photo, video, quiz, checkin
  `frequency` varchar(50) DEFAULT 'daily',
  `needs_gps` tinyint(1) DEFAULT 0,
  `needs_moderator` tinyint(1) DEFAULT 1,
  `quiz_options` json DEFAULT NULL,
  `quiz_answer` varchar(255) DEFAULT NULL,
  `quiz_explanation` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 4. Table structure for task_submissions
-- ----------------------------
DROP TABLE IF EXISTS `task_submissions`;
CREATE TABLE `task_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `image_url` text,
  `status` enum('pending','approved','rejected','ai_rejected') DEFAULT 'pending',
  `moderator_note` text,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 5. Table structure for ai_verifications
-- ----------------------------
DROP TABLE IF EXISTS `ai_verifications`;
CREATE TABLE `ai_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `confidence` int(11) DEFAULT 0,
  `reason` text,
  `verified_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `ai_verifications_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `task_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 6. Table structure for shop_items
-- ----------------------------
DROP TABLE IF EXISTS `shop_items`;
CREATE TABLE `shop_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `description` text,
  `image_url` text,
  `item_type` enum('seed','pot_skin','fertilizer','tool') DEFAULT 'seed',
  `is_real` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 7. Table structure for inventory
-- ----------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_item` (`user_id`,`item_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 8. Table structure for redemptions
-- ----------------------------
DROP TABLE IF EXISTS `redemptions`;
CREATE TABLE `redemptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `redeemed_at` datetime DEFAULT CURRENT_TIMESTAMP,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 9. Table structure for inventory_stock
-- ----------------------------
DROP TABLE IF EXISTS `inventory_stock`;
CREATE TABLE `inventory_stock` (
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 100,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- 10. Table structure for library
-- ----------------------------
DROP TABLE IF EXISTS `library`;
CREATE TABLE `library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'Kiến thức',
  `duration` varchar(50) DEFAULT '5 phút đọc',
  `description` text,
  `image_url` text,
  `content` longtext,
  `category_color` varchar(20) DEFAULT '#154212',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- SEED DATA
-- ----------------------------

-- Tasks
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
	(12, 'Quiz: Bảo vệ buôn làng', 40, 20, 'Quiz', 'Hành động từ bỏ thói quen đốt rẫy sang ủ phân hữu cơ góp phần trực tiếp bảo vệ đối tượng yếu thế nào nhất trong buôn làng?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Sửa khỏe đường hô hấp của trẻ em và người già.", "B. Sự phát triển của đàn gia súc.", "C. Hệ thống điện lưới của địa phương.", "D. Giao thông đường bộ của xã."]', 'A', 'Trẻ em và người già có hệ hô hấp rất yếu và nhạy cảm. Việc giảm khói đốt rẫy chính là hành động trực tiếp và thiết thực nhất để bảo vệ lá phổi của họ.'),
	(13, 'Gom rơm rạ/vỏ cà phê', 60, 20, 'Action', 'Chụp ảnh gom rơm rạ/vỏ cà phê thành đống sau thu hoạch.', 'camera', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(14, 'Trộn men vi sinh', 70, 20, 'Action', 'Chụp ảnh đang trộn men vi sinh vào đống ủ.', 'camera', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(15, 'Tưới giữ ẩm đống ủ', 50, 20, 'Action', 'Chụp ảnh đang tưới nước giữ ẩm cho đống ủ phân.', 'water', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(16, 'Che đậy bạt đống ủ', 50, 20, 'Action', 'Chụp ảnh/quay video (5s) che đậy bạt bảo vệ đống ủ.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL, NULL),
	(17, 'Đảo đống ủ cho thoáng', 60, 20, 'Action', 'Quay video ngắn cảnh dùng xẻng đảo đống ủ cho thoáng khí.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL, NULL),
	(18, 'Phân hoai mục thành công', 100, 20, 'Action', 'Chụp ảnh đống phân hữu cơ đã hoai mục thành công (đen, tơi xốp).', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(19, 'Bón phân tự ủ cho cây', 80, 20, 'Action', 'Chụp ảnh đang bón phân tự ủ cho gốc cây cà phê / hoa màu.', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(20, 'Phân loại rác tại bếp', 60, 20, 'Action', 'Chụp ảnh phân loại rác hữu cơ (rau củ thừa) và vô cơ (túi nilon) tại bếp.', 'recycle', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(21, 'Vứt rác vô cơ đúng nơi', 40, 20, 'Action', 'Chụp ảnh vứt rác vô cơ đúng nơi quy định của buôn làng.', 'trash-can', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(22, 'Nhặt vỏ chai thuốc trên rẫy', 70, 20, 'Action', 'Chụp ảnh nhặt vỏ chai/bao bì thuốc bảo vệ thực vật trên rẫy.', 'delete-sweep', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(23, 'Nộp bao bì thuốc trừ sâu', 80, 20, 'Action', 'Chụp ảnh đem bao bì thuốc trừ sâu nộp tại điểm thu gom chung.', 'truck-delivery', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(24, 'Tái chế đồ cũ thành chậu', 90, 20, 'Action', 'Chụp ảnh tái chế (dùng chai nhựa cũ làm chậu ươm hạt mầm).', 'recycle', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(25, 'Quét dọn đường làng', 60, 20, 'Action', 'Chụp ảnh tham gia quét dọn đường làng ngõ xóm.', 'broom', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(26, 'Giới thiệu app cho hàng xóm', 120, 20, 'Action', 'Quét mã QR giới thiệu app thành công cho một người hàng xóm.', 'qrcode', 'action', 'qr', 'weekly', 0, 1, NULL, NULL, NULL),
	(27, 'Buộc kín túi rác trước khi vứt', 40, 20, 'Action', 'Chụp ảnh túi rác hoặc bao tải rác đã được buộc kín trước khi vứt.', 'bag-checked', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(28, 'Báo cáo đốt rơm rạ', 100, 20, 'Report', 'Báo cáo tọa độ đang có đống rơm rạ bị đốt (kèm ảnh khói).', 'fire-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(29, 'Báo cáo đốt rác nông nghiệp', 100, 20, 'Report', 'Báo cáo tọa độ đang đốt vỏ cà phê / rác thải nông nghiệp.', 'fire', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(30, 'Báo cáo bãi rác tự phát', 80, 20, 'Report', 'Báo cáo một bãi rác tự phát mới xuất hiện cạnh đường/kênh rạch.', 'map-marker-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(31, 'Báo cáo vỏ chai thuốc vứt bừa', 80, 20, 'Report', 'Báo cáo khu vực có nhiều vỏ chai thuốc trừ sâu vứt bừa bãi.', 'alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(32, 'Cập nhật điểm ô nhiễm đã sạch', 120, 20, 'Report', 'Chụp ảnh điểm ô nhiễm (đã báo cáo trước đó) nay đã được dọn sạch.', 'check-circle', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(33, 'Báo cáo khói mù không rõ nguồn', 90, 20, 'Report', 'Báo cáo khói mù mịt không rõ nguồn gốc gây ảnh hưởng tầm nhìn.', 'weather-fog', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(34, 'Báo cáo xả rác xuống suối', 100, 20, 'Report', 'Báo cáo hành vi xả rác sinh hoạt thẳng xuống suối/nguồn nước.', 'water-off', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(35, 'Đánh dấu đống ủ lên bản đồ', 60, 20, 'Report', 'Đánh dấu vị trí đống ủ phân sinh học chuẩn của nhà mình lên bản đồ.', 'map-marker-plus', 'report', 'gps', 'weekly', 1, 1, NULL, NULL, NULL),
	(36, 'Báo cáo điểm tập kết rác quá tải', 70, 20, 'Report', 'Báo cáo điểm tập kết rác của buôn làng đang bị quá tải, chưa có xe thu gom.', 'trash-can-outline', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(37, 'SOS: Báo cháy lan rộng', 150, 20, 'Report', 'Báo cáo nhanh (SOS) đám cháy có nguy cơ lan rộng.', 'fire-extinguisher', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL);

-- Shop Items
INSERT INTO `shop_items` (`id`, `name`, `price`, `description`, `image_url`, `item_type`, `is_real`) VALUES 
(1, 'Hạt giống Cà phê', 50, 'Hạt giống cà phê chất lượng cao.', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'seed', 0),
(2, 'Hạt giống Sầu riêng', 100, 'Hạt giống sầu riêng Đắk Lắk.', 'https://images.unsplash.com/photo-1595455353724-640f1a92e861?w=400', 'seed', 0),
(3, 'Chậu Gốm Đỏ', 500, 'Mẫu chậu gốm đỏ truyền thống.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', 'pot_skin', 0),
(4, 'Chậu Đất Nung', 800, 'Mẫu chậu đất nung bền bỉ.', 'https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=400', 'pot_skin', 0),
(5, 'Chậu Sứ Xanh', 1200, 'Mẫu chậu sứ xanh trang nhã.', 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400', 'pot_skin', 0),
(6, 'Chậu Sứ Trắng', 1500, 'Mẫu chậu sứ trắng hiện đại.', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 'pot_skin', 0),
(7, 'Chậu Cổ Điển', 2000, 'Mẫu chậu mang phong cách cổ điển.', 'https://images.unsplash.com/photo-1581447100595-3a74a5af060f?w=400', 'pot_skin', 0),
(8, 'Chậu Vàng Hoàng Gia', 5000, 'Mẫu chậu mạ vàng sang trọng.', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 'pot_skin', 0),
(9, 'Chậu Ngọc Bích', 3500, 'Mẫu chậu làm từ đá ngọc bích quý hiếm.', 'https://images.unsplash.com/photo-1520412099551-62b6bafdf5bb?w=400', 'pot_skin', 0),
(10, 'Chậu Họa Tiết', 1800, 'Chậu vẽ tay họa tiết truyền thống.', 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400', 'pot_skin', 0),
(11, 'Chậu Cao Cấp', 4500, 'Chậu gốm sứ cao cấp xuất khẩu.', 'https://images.unsplash.com/photo-1516706562681-37d4052309e3?w=400', 'pot_skin', 0),
(12, 'Chậu Đặc Biệt', 10000, 'Phiên bản giới hạn dành cho đại gia.', 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?w=400', 'pot_skin', 0),
(13, 'Áo phông Nông Nghiệp Xanh', 2000, 'Áo thun cotton cao cấp in logo ứng dụng.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'tool', 1),
(14, 'Mũ bảo hiểm Đắk Lắk', 1500, 'Mũ bảo hiểm chất lượng cao bảo vệ an toàn.', 'https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=400', 'tool', 1),
(15, 'Túi ủ men vi sinh Trichoderma', 500, 'Gói 1kg men vi sinh giúp ủ vỏ cà phê nhanh chóng.', 'https://images.unsplash.com/photo-1585314062340-f1a5acc23555?w=400', 'fertilizer', 1);

-- Stock
INSERT INTO `inventory_stock` (`item_id`, `quantity`) VALUES 
(1, 100), (2, 100), (3, 100), (4, 100), (5, 100), (6, 100), (7, 100), (8, 100), (9, 100), (10, 100), (11, 100), (12, 100), (13, 50), (14, 50), (15, 50);

SET FOREIGN_KEY_CHECKS = 1;
