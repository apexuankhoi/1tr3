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
  UNIQUE KEY `unique_user_pot` (`user_id`, `pot_id`),
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
	-- QUỐC TẾ QUIZ (3 - 52)
	(3, 'Quiz: Hạt bụi nguy hiểm', 40, 20, 'Quiz', 'Khói bụi sinh ra từ việc đốt vỏ cà phê và rơm rạ trên rẫy chứa loại hạt nào đặc biệt nguy hiểm cho đường hô hấp của con người?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Bụi mịn PM2.5", "B. Khí Oxi trong lành", "C. Hơi nước tinh khiết", "D. Khí hiếm"]', 'A', 'Khói đốt rác thải nông nghiệp chứa lượng lớn bụi mịn PM2.5 có thể xâm nhập sâu vào phổi và máu.'),
	(4, 'Quiz: Hậu quả đốt rác', 40, 20, 'Quiz', 'Sức nóng từ việc đốt rác ngay trên mặt đất thực chất gây ra hậu quả gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiêu diệt hệ vi sinh vật có lợi và làm đất chai cứng.", "B. Làm đất tơi xốp và nhiều giun đất hơn.", "C. Giúp nấm bệnh phát triển tốt hơn.", "D. Tăng cường độ ẩm cho đất."]', 'A', 'Nhiệt độ cao thiêu rụi chất mùn và giết chết các sinh vật có lợi dưới lớp đất mặt, khiến đất bazan bạc màu.'),
	(5, 'Quiz: Men vi sinh phổ biến', 40, 20, 'Quiz', 'Loại men vi sinh nào thường được sử dụng phổ biến nhất để trộn vào vỏ cà phê giúp đẩy nhanh quá trình phân hủy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nấm đối kháng Trichoderma", "B. Men tiêu hóa", "C. Thuốc trừ sâu sinh học", "D. Nước muối pha loãng"]', 'A', 'Trichoderma vừa phân hủy nhanh lớp vỏ cứng cáp, vừa tiêu diệt các nấm bệnh gây hại rễ.'),
	(6, 'Quiz: Tại sao cần che bạt?', 40, 20, 'Quiz', 'Trong quy trình ủ phân vi sinh, vì sao bà con cần phải che đậy bạt thật kín lên đống ủ?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Để giữ ẩm, duy trì nhiệt độ tối ưu và tránh mưa rửa trôi.", "B. Để ngăn chim chóc ăn mất vỏ cà phê.", "C. Để phân không bị bốc mùi bay sang nhà hàng xóm.", "D. Để ánh nắng mặt trời làm khô phân nhanh hơn."]', 'A', 'Che bạt tạo ra một ''lồng ấp'' lý tưởng giúp vi sinh vật Trichoderma sinh sôi hiệu quả nhất.'),
	(7, 'Quiz: Thời gian ủ phân', 40, 20, 'Quiz', 'Một đống ủ vỏ cà phê với men vi sinh cần thời gian bao lâu để phân hủy hoàn toàn thành ''vàng đen''?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Khoảng 2 đến 3 tháng", "B. Chỉ sau 1 tuần", "C. Cần ít nhất 1 năm", "D. Khoảng 3 đến 5 ngày"]', 'A', '2 đến 3 tháng là khoảng thời gian chuẩn kỹ thuật để vỏ cà phê hoai mục hoàn toàn.'),
	(8, 'Quiz: Dấu hiệu phân chín', 40, 20, 'Quiz', 'Dấu hiệu nào cho thấy mẻ phân ủ hữu cơ từ vỏ cà phê đã hoàn thành và sẵn sàng đem bón?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phân có màu nâu đen, tơi xốp và không có mùi hôi.", "B. Phân vẫn còn nguyên hình dạng vỏ cà phê cứng.", "C. Phân có mùi chua gắt và rỉ nhiều nước.", "D. Đống ủ đang nóng ran và bốc khói."]', 'A', 'Màu nâu đen và độ tơi xốp chứng tỏ chất hữu cơ đã hoai mục hoàn toàn, hệ vi sinh đã khử mùi triệt để.'),
	(9, 'Quiz: Lợi ích kinh tế', 40, 20, 'Quiz', 'Việc tận dụng vỏ cà phê làm phân bón tại chỗ mang lại lợi ích kinh tế nào thiết thực nhất?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiết kiệm đáng kể chi phí mua phân bón vô cơ (hóa học).", "B. Tăng giá bán hạt cà phê trên thị trường.", "C. Giúp thời gian thu hoạch cà phê nhanh hơn.", "D. Giúp rẫy hoàn toàn không bao giờ có cỏ dại."]', 'A', 'Phân hữu cơ tự ủ giúp cắt giảm 10-20% chi phí mua phân bón hóa học mỗi vụ.'),
	(10, 'Quiz: Kiểm tra độ ẩm', 40, 20, 'Quiz', 'Bằng mắt và tay không, cách nào sau đây giúp bà con nhận biết đống ủ đạt độ ẩm chuẩn?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nắm chặt một nắm bã ủ, thấy rỉ nước nhẹ ở kẽ tay là đạt.", "B. Nhìn bằng mắt thấy vỏ cà phê bay bụi là đạt.", "C. Giẫm chân lên thấy lún sâu rập rềnh là đạt.", "D. Đưa tay vào thấy lạnh buốt là đạt."]', 'A', 'Nước rỉ nhẹ ra kẽ tay cho thấy độ ẩm đạt khoảng 60%, mức lý tưởng nhất cho đống ủ.'),
	(11, 'Quiz: Nguyên liệu kết hợp', 40, 20, 'Quiz', 'Ngoài vỏ cà phê, bà con có thể kết hợp thêm nguyên liệu nào sau đây để mẻ phân ủ đạt chất lượng tốt nhất?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phân chuồng (bò, gà, heo) và rơm rạ.", "B. Bao bì nilon và chai nhựa.", "C. Gạch đá vụn và xà bần.", "D. Pin cũ và thiết bị điện tử hỏng."]', 'A', 'Phân chuồng cung cấp đạm, rơm rạ cung cấp carbon, tạo ra tỷ lệ C/N lý tưởng.'),
	(12, 'Quiz: Bảo vệ đối tượng yếu thế', 40, 20, 'Quiz', 'Hành động từ bỏ thói quen đốt rẫy sang ủ phân hữu cơ góp phần bảo vệ đối tượng yếu thế nào nhất?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Sức khỏe đường hô hấp của trẻ em và người già.", "B. Sự phát triển của đàn gia súc.", "C. Hệ thống điện lưới của địa phương.", "D. Giao thông đường bộ của xã."]', 'A', 'Giảm khói đốt rẫy là hành động trực tiếp bảo vệ lá phổi của người có sức đề kháng yếu.'),
	(13, 'Quiz: Giảm thiểu thảm họa', 40, 20, 'Quiz', 'Việc ủ vỏ cà phê thành phân vi sinh tại rẫy giúp giảm thiểu rủi ro thảm họa nào vào mùa khô ở Tây Nguyên?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Cháy rừng và cháy rẫy lây lan.", "B. Lũ quét và sạt lở đất.", "C. Bão lớn và lốc xoáy.", "D. Động đất nhẹ."]', 'A', 'Không châm lửa đốt vỏ cà phê lộ thiên sẽ triệt tiêu nguy cơ tàn lửa bay theo gió gây cháy lan.'),
	(14, 'Quiz: Người có sức ảnh hưởng', 40, 20, 'Quiz', 'Cá nhân nào trong các Bon làng có sức ảnh hưởng và tiếng nói uy tín nhất để kêu gọi bà con không đốt rẫy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Già làng, Trưởng bon.", "B. Trẻ em trong Bon.", "C. Khách du lịch vãng lai.", "D. Thương lái thu mua nông sản."]', 'A', 'Thiết chế Già làng mang tính định chuẩn, có sức nặng tương đương luật tục trong buôn làng.'),
	(15, 'Quiz: App Hạt Mầm Xanh', 40, 20, 'Quiz', 'Ứng dụng ''Hạt Mầm Xanh'' mang lại lợi ích gì cho bà con nông dân khi tham gia làm nhiệm vụ mỗi ngày?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tích điểm để đổi lấy các vật tư nông nghiệp (men vi sinh, bạt ủ).", "B. Tích điểm để đổi lấy vé xem phim.", "C. Giúp điện thoại chạy nhanh hơn.", "D. Trực tiếp làm vỏ tự phân hủy."]', 'A', 'Cơ chế Gamification biến bảo vệ môi trường thành nhiệm vụ có thưởng kinh tế thiết thực.'),
	(16, 'Quiz: Nguyên liệu không nên ủ', 40, 20, 'Quiz', 'Đâu là nguyên liệu KHÔNG NÊN cho vào đống ủ phân hữu cơ sinh học tại rẫy?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Bao bì thuốc bảo vệ thực vật, chai nhựa, túi nilon.", "B. Rơm rạ và thân cây ngô.", "C. Vỏ quả cà phê khô.", "D. Phân bò hoặc phân heo."]', 'A', 'Nhựa và hóa chất không phân hủy sinh học và sẽ tiêu diệt hệ vi sinh vật có lợi.'),
	(17, 'Quiz: Tác động lên đất bazan', 40, 20, 'Quiz', 'Bón ''vàng đen'' liên tục nhiều vụ sẽ giúp đất đỏ bazan thay đổi như thế nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tăng độ xốp, giữ ẩm tốt hơn và ngăn ngừa xói mòn.", "B. Làm đất nhanh khô nứt nẻ hơn.", "C. Làm đất mất khả năng thoát nước.", "D. Biến đất đỏ bazan thành đất cát."]', 'A', 'Mùn hữu cơ giúp tái tạo cấu trúc đất bazan vốn đang bị chai cứng do phân hóa học.'),
	(18, 'Quiz: Xử lý đống ủ khô', 40, 20, 'Quiz', 'Nếu đống ủ bên trong quá khô và có lớp mốc trắng bay lên, bà con cần xử lý bằng cách nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tưới thêm nước đều vào đống ủ để đạt lại độ ẩm 60%.", "B. Mở tung bạt ra phơi nắng.", "C. Châm lửa đốt bỏ.", "D. Đổ thêm thật nhiều phân đạm."]', 'A', 'Mốc trắng là dấu hiệu đống ủ bị thiếu nước nghiêm trọng, cần cấp nước để vi sinh hoạt động.'),
	(19, 'Quiz: Rào cản ủ phân', 40, 20, 'Quiz', 'Rào cản lớn nhất khiến nhiều bà con vẫn chọn cách đốt bỏ vỏ cà phê thay vì ủ phân là gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Sợ tốn nhiều công sức, thời gian thu gom trên diện tích rẫy phân tán.", "B. Sợ phân hữu cơ làm chết cây.", "C. Vì đốt rác có mùi thơm.", "D. Vì vỏ cháy không sinh khói."]', 'A', 'Đất rẫy đồi dốc rộng lớn khiến việc cào gom phụ phẩm tốn rất nhiều sức lao động.'),
	(20, 'Quiz: Nguy hiểm từ PM2.5', 40, 20, 'Quiz', 'Tại sao hạt bụi mịn PM2.5 trong khói đốt vỏ cà phê lại cực kỳ nguy hiểm?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Kích thước siêu nhỏ giúp chúng xâm nhập sâu vào phế nang và mạch máu.", "B. Làm giảm nồng độ Nitơ trong không khí.", "C. Chỉ gây hắt hơi thông thường.", "D. Làm thay đổi màu da người."]', 'A', 'Kích thước siêu nhỏ giúp hạt bụi xuyên qua các lớp bảo vệ tự nhiên của cơ thể.'),
	(21, 'Quiz: Nhóm đối tượng nhạy cảm', 40, 20, 'Quiz', 'Khói sinh khối từ việc đốt rẫy tác động nguy hiểm nhất đến nhóm đối tượng nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Phụ nữ mang thai, người già và trẻ em.", "B. Chỉ tác động đến chim chóc.", "C. Thanh niên có sức khỏe tốt.", "D. Người làm trong phòng máy lạnh."]', 'A', 'Đây là nhóm có hệ hô hấp nhạy cảm, dễ mắc các bệnh hen suyễn và viêm phế quản.'),
	(22, 'Quiz: Báo cáo ô nhiễm', 40, 20, 'Quiz', 'Khi báo cáo một điểm nóng ô nhiễm trên App, người dùng cần cung cấp minh chứng nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Chụp hình ảnh trực tiếp tại hiện trường kèm định vị GPS.", "B. Chỉ cần nhắn tin báo.", "C. Gửi hình tải từ mạng về.", "D. Gọi điện thoại báo cáo."]', 'A', 'Định vị GPS và ảnh chụp trực tiếp giúp ứng dụng xác thực tính trung thực của báo cáo.'),
	(23, 'Quiz: Nhiệt độ đống ủ', 40, 20, 'Quiz', 'Sau 15 ngày ủ, nhiệt độ đống ủ tăng lên rất cao (khoảng 60-70 độ C), điều này có ý nghĩa gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Là dấu hiệu rất tốt, giúp tiêu diệt mầm bệnh và hạt cỏ dại.", "B. Là dấu hiệu đống ủ sắp cháy.", "C. Men vi sinh đã chết hoàn toàn.", "D. Phân đã bị hỏng."]', 'A', 'Giai đoạn sinh nhiệt là lúc vi sinh hoạt động mạnh nhất, tạo ''lò sát sinh'' diệt nấm bệnh.'),
	(24, 'Quiz: Tiết kiệm chi phí', 40, 20, 'Quiz', 'Thay thế một phần phân vô cơ bằng phân ủ mang lại lợi ích tài chính nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiết kiệm từ 7 - 9 triệu đồng tiền mua phân bón cho mỗi hecta.", "B. Tốn thêm tiền thuê kho bãi.", "C. Không mang lại lợi ích tiền bạc.", "D. Tăng tiền thuế đất."]', 'A', 'Cắt giảm trực tiếp chi phí mua phân bón hóa học, gia tăng lợi nhuận cho nông dân.'),
	(25, 'Quiz: Mục tiêu toàn cầu', 40, 20, 'Quiz', 'Hành động ''Không đốt rẫy - Tích cực ủ phân'' đóng góp trực tiếp vào mục tiêu toàn cầu nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Thích ứng biến đổi khí hậu và giảm phát thải khí nhà kính.", "B. Tăng cường khai thác khoáng sản.", "C. Khuyến khích dùng nhựa một lần.", "D. Thúc đẩy đô thị hóa."]', 'A', 'Ngừng đốt sinh khối giúp giảm lượng khí CO2 và Methane xả thẳng lên bầu khí quyển.'),
	(26, 'Quiz: Hương ước Bon làng', 40, 20, 'Quiz', 'Khi đưa quy định ''Cấm đốt phụ phẩm'' vào Hương ước của Bon làng, mục đích lớn nhất là gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tạo ra tính răn đe và ý thức tự giác tuân thủ của cả cộng đồng.", "B. Để thu tiền phạt làm quỹ riêng.", "C. Cấm người dân trồng cà phê.", "D. Đuổi người vi phạm ra khỏi Bon."]', 'A', 'Sức mạnh văn hóa mềm của luật tục giúp cộng đồng tự giác nhắc nhở nhau.'),
	(27, 'Quiz: Thành phần vỏ cà phê', 40, 20, 'Quiz', 'Thành phần nào trong vỏ cà phê khiến nó phân hủy rất chậm trong tự nhiên?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Lớp vỏ cứng chứa nhiều Lignin và Cellulose.", "B. Chứa quá nhiều nước.", "C. Chứa kim loại nặng.", "D. Chứa nhiều Vitamin C."]', 'A', 'Cellulose và Lignin rất khó phân hủy, cần men Trichoderma để bẻ gãy liên kết.'),
	(28, 'Quiz: Nông nghiệp tuần hoàn', 40, 20, 'Quiz', 'Nông nghiệp tuần hoàn áp dụng vào canh tác cà phê được hiểu là gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Lấy rác thải của quá trình thu hoạch làm phân bón cho chu kỳ tiếp theo.", "B. Chở vỏ cà phê đi tỉnh khác đổ.", "C. Mua phân bón từ nước ngoài.", "D. Đốt sạch rẫy gieo hạt mới."]', 'A', 'Vòng lặp khép kín biến phế phẩm thành tài nguyên vàng đen.'),
	(29, 'Quiz: Zalo OA dự án', 40, 20, 'Quiz', 'Trên mạng lưới Zalo OA của dự án, người dân có thể thực hiện hoạt động nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Hỏi đáp kỹ thuật nông nghiệp và trao đổi kinh nghiệm ủ phân.", "B. Đăng tải video giải trí.", "C. Mua bán thuốc hóa học cấm.", "D. Tổ chức cá cược trực tuyến."]', 'A', 'Zalo OA là không gian cộng đồng để ban dự án hỗ trợ ''cầm tay chỉ việc'' cho bà con.'),
	(30, 'Quiz: Sinh khối Đắk Lắk', 40, 20, 'Quiz', 'Loại cây trồng nào tạo ra sinh khối phụ phẩm lớn thứ hai sau cà phê tại Đắk Lắk?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Cây Lúa và cây Ngô.", "B. Cây cao su.", "C. Cây điều.", "D. Cây hồ tiêu."]', 'A', 'Rơm rạ từ lúa (16,4%) là nguồn vật liệu tuyệt vời để phối trộn cùng vỏ cà phê.'),
	(31, 'Quiz: Mùi hôi đống ủ', 40, 20, 'Quiz', 'Nếu mẻ ủ phân vi sinh có mùi chua gắt và hôi thối, nguyên nhân chính là do đâu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Đống ủ bị úng nước hoặc thiếu oxy do không được đảo trộn.", "B. Do che bạt quá kín.", "C. Do cho quá nhiều vỏ cà phê.", "D. Do men vi sinh hoạt động mạnh."]', 'A', 'Nước ứ đọng làm vi khuẩn yếm khí sinh sôi gây ra mùi hôi thối.'),
	(32, 'Quiz: Truyền thông song ngữ', 40, 20, 'Quiz', 'Chiến dịch truyền thông bằng ''Song ngữ Kinh - Ê Đê'' mang lại hiệu quả vượt trội vì sao?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Xóa bỏ rào cản ngôn ngữ, giúp đồng bào dễ thấu hiểu và làm theo.", "B. Giúp tiết kiệm chi phí in ấn.", "C. Làm poster đẹp mắt hơn.", "D. Giúp dễ chấm điểm dự án."]', 'A', 'Ngôn ngữ bản địa tạo sự gần gũi và tôn trọng văn hóa đồng bào.'),
	(33, 'Quiz: Bệnh lý từ khói', 40, 20, 'Quiz', 'Bệnh lý nào rất phổ biến ở người già và trẻ em do hít phải khói sinh khối kéo dài?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Hen suyễn, viêm phế quản và các bệnh tim mạch.", "B. Bệnh đau dạ dày.", "C. Bệnh loãng xương.", "D. Bệnh đục thủy tinh thể."]', 'A', 'Khói đốt rác chứa bụi mịn PM2.5 tấn công trực tiếp vào hệ hô hấp.'),
	(34, 'Quiz: Nguy cơ mùa khô', 40, 20, 'Quiz', 'Tại sao mùa khô ở Tây Nguyên làm tình trạng khói đốt rẫy trở nên nguy hiểm hơn?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Thời tiết khô hanh, khói khó phân tán và cực kỳ dễ gây cháy rừng.", "B. Vỏ cà phê ướt nên sinh nhiều khói.", "C. Gió đẩy khói bay ra khỏi trái đất.", "D. Mùa khô không ai đi rẫy."]', 'A', 'Độ ẩm thấp và gió mạnh khiến các mồi lửa từ rẫy rất dễ lây lan vào rừng tự nhiên.'),
	(35, 'Quiz: Thức ăn vi sinh', 40, 20, 'Quiz', 'Để đống ủ nhanh hoai mục, nên bổ sung thêm ''thức ăn'' nào cho vi sinh vật?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Mật rỉ đường.", "B. Nước mắm.", "C. Bột ngọt (mì chính).", "D. Nước rửa chén."]', 'A', 'Mật rỉ đường cung cấp nguồn năng lượng carbon dồi dào giúp vi sinh vật nhân lên nhanh.'),
	(36, 'Quiz: Đảo trộn đống ủ', 40, 20, 'Quiz', 'Việc ''đảo trộn'' đống ủ định kỳ mang lại tác dụng chính là gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Cung cấp khí Oxy cho vi sinh vật hiếu khí hoạt động.", "B. Để tìm xem có con vật nào chui vào.", "C. Làm vỏ cà phê bay bớt.", "D. Làm đống ủ tản nhiệt cho nhanh nguội."]', 'A', 'Quá trình phân hủy cần nhiều oxy, đảo trộn giúp ngăn vi khuẩn yếm khí phát triển.'),
	(37, 'Quiz: Đại sứ chiến dịch', 40, 20, 'Quiz', 'Vì sao dự án mời các Già làng, Trưởng bon làm ''Đại sứ chiến dịch''?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Vì họ nắm giữ luật tục, có uy tín quyết định việc thay đổi nhận thức buôn làng.", "B. Vì họ có nhiều thời gian rảnh.", "C. Vì họ trồng nhiều cà phê nhất.", "D. Vì họ dùng điện thoại giỏi nhất."]', 'A', 'Thiết chế già làng mang tính định chuẩn, tạo sự tự giác tuân thủ truyền đời.'),
	(38, 'Quiz: Bảng xếp hạng', 40, 20, 'Quiz', 'Tính năng ''Bảng xếp hạng'' trên App Hạt Mầm Xanh có tác dụng lớn nhất là gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tạo phong trào thi đua lành mạnh và vinh danh cá nhân bảo vệ môi trường.", "B. Để phạt tiền người đứng cuối.", "C. Để báo cáo công an.", "D. Để bán hàng online."]', 'A', 'Game hóa giúp biến việc bảo vệ môi trường thành phong trào thi đua có thưởng.'),
	(39, 'Quiz: Cải thiện năng suất', 40, 20, 'Quiz', 'Sử dụng phân compost tự ủ giúp cải thiện năng suất cây cà phê thêm khoảng bao nhiêu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tăng từ 17,2% - 24,5%.", "B. Tăng gấp đôi.", "C. Giảm đi 10%.", "D. Không làm thay đổi năng suất."]', 'A', 'Phân hữu cơ làm tăng độ xốp và giữ ẩm, giúp rễ hấp thụ dinh dưỡng tốt hơn.'),
	(40, 'Quiz: Vị trí đặt đống ủ', 40, 20, 'Quiz', 'Vị trí tốt nhất để đặt đống ủ phân hữu cơ ngay tại rẫy là ở đâu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Nơi bằng phẳng, thoát nước tốt và có bóng râm che mát.", "B. Ngay sát bờ suối.", "C. Giữa đường đi lại.", "D. Nơi trũng thấp hay ngập nước."]', 'A', 'Nơi bằng phẳng dễ thao tác, thoát nước tốt chống úng, bóng râm bảo vệ bạt ủ.'),
	(41, 'Quiz: Chống xói mòn', 40, 20, 'Quiz', 'Bón phân hữu cơ vi sinh giúp giảm thiểu tình trạng nào của đất đồi dốc vào mùa mưa?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Giảm xói mòn và rửa trôi chất dinh dưỡng.", "B. Làm đất dễ bị lở hơn.", "C. Gây ngập lụt cục bộ.", "D. Làm sinh ra nhiều đá sỏi."]', 'A', 'Phân hữu cơ làm đất tơi xốp giữ nước tốt, rễ cây bám chắc ngăn ngừa xói mòn.'),
	(42, 'Quiz: Xử lý vỏ khô', 40, 20, 'Quiz', 'Nếu vỏ cà phê bị phơi quá khô trước khi ủ, bà con cần phải xử lý thế nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tưới nước sạch đều lên đống nguyên liệu để đạt độ ẩm 50-60%.", "B. Đem đốt bớt.", "C. Rưới dầu hỏa lên.", "D. Bỏ đi không ủ nữa."]', 'A', 'Vi sinh vật Trichoderma cần nước để sống và phân giải vật liệu hữu cơ.'),
	(43, 'Quiz: Thấy người đốt rác', 40, 20, 'Quiz', 'Nếu phát hiện người đang đốt rác gây khói mù mịt, người dùng App nên làm gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Chụp ảnh có gắn GPS và gửi ''Báo cáo điểm nóng'' trên App.", "B. Chạy lại gần hít thử khói.", "C. Quay lưng đi coi như không thấy.", "D. Ném thêm rác vào."]', 'A', 'Báo cáo cộng đồng giúp Ban quản lý định vị và xử lý điểm nóng ô nhiễm.'),
	(44, 'Quiz: Đối phó tuyến trùng', 40, 20, 'Quiz', 'Tuyến trùng là sinh vật gây hại rễ cà phê. Phân ủ Trichoderma có tác dụng gì với chúng?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Ức chế sinh học, làm giảm mạnh mật độ tuyến trùng và nấm bệnh.", "B. Nuôi dưỡng tuyến trùng.", "C. Kích thích tuyến trùng sinh sản.", "D. Không có tác dụng gì."]', 'A', 'Nghiên cứu cho thấy phân ủ vi sinh làm giảm mật độ tuyến trùng từ 61,5 - 73,1%.'),
	(45, 'Quiz: Tiếng Ê-Đê truyền thông', 40, 20, 'Quiz', 'Việc sử dụng Tiếng Ê-Đê trong các video truyền thông nhằm giải quyết rào cản nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Rào cản ngôn ngữ, giúp bà con dễ tiếp thu và thấy văn hóa được tôn trọng.", "B. Để làm video dài hơn.", "C. Để tiết kiệm màu in poster.", "D. Để người ở xa không hiểu được."]', 'A', 'Sử dụng ngôn ngữ mẹ đẻ giúp thông điệp kỹ thuật trở nên gần gũi và dễ hiểu hơn.'),
	(46, 'Quiz: Ủ phân tại chỗ', 40, 20, 'Quiz', 'Ủ phân tại chỗ giúp bà con giải quyết bài toán khó nào nhất?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tiết kiệm tối đa thời gian, công sức và chi phí vận chuyển.", "B. Làm rẫy bừa bộn hơn.", "C. Mất thời gian đi lại.", "D. Tốn thêm tiền mua xe tải."]', 'A', 'Khảo sát cho thấy rào cản lớn nhất là công lao động thu gom trên rẫy phân tán.'),
	(47, 'Quiz: Khí nhà kính', 40, 20, 'Quiz', 'Đốt rác nông nghiệp tạo ra lượng lớn CO2 và Methane. Điều này gây ra hiện tượng gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Hiệu ứng nhà kính và biến đổi khí hậu toàn cầu.", "B. Hiện tượng nhật thực.", "C. Sự hình thành cực quang.", "D. Sự đóng băng đại dương."]', 'A', 'Dự án trực tiếp cắt giảm lượng lớn khí thải xả thẳng vào bầu khí quyển.'),
	(48, 'Quiz: Cân bằng pH đất', 40, 20, 'Quiz', 'Phân compost giúp cải thiện chỉ số hóa học cực kỳ quan trọng nào của đất bazan?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Cải thiện độ pH, giúp đất bớt chua và rễ cây dễ hấp thụ dinh dưỡng.", "B. Làm đất chua thêm.", "C. Biến đất đỏ thành đất phèn.", "D. Tăng lượng kim loại nặng."]', 'A', 'Phân hóa học làm đất chua, phân hữu cơ giúp trung hòa và cân bằng lại độ pH.'),
	(49, 'Quiz: Đổi quà trên App', 40, 20, 'Quiz', 'Quà tặng thiết thực nào được dùng để quy đổi từ điểm thưởng trên App?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Men vi sinh, bạt ủ, cuốc, xẻng hoặc thẻ cào điện thoại.", "B. Xe máy, tivi.", "C. Quần áo thời trang.", "D. Đồ chơi trẻ em."]', 'A', 'Quà tặng tập trung vào vật tư nông nghiệp cấp thiết để bà con duy trì việc ủ phân.'),
	(50, 'Quiz: Đống ủ không nóng', 40, 20, 'Quiz', 'Nếu đống ủ không hề nóng lên sau 5-7 ngày, nguyên nhân chính có thể do đâu?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Thiếu độ ẩm (bị khô), thiếu đạm hoặc men vi sinh đã bị chết.", "B. Do che bạt quá kỹ.", "C. Do trộn quá đều.", "D. Do thời tiết quá lạnh."]', 'A', 'Nhiệt độ sinh ra do vi sinh vật hoạt động, nếu không sinh nhiệt là do thiếu điều kiện sống.'),
	(51, 'Quiz: Phương pháp tập huấn', 40, 20, 'Quiz', 'Trong Giai đoạn 3, Ban quản lý sẽ hướng dẫn kỹ thuật ủ phân bằng phương pháp nào?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Tập huấn ''Cầm tay chỉ việc'', xuống tận rẫy hướng dẫn từng bước.", "B. Thu tiền phạt người đốt rác.", "C. Phát tài liệu tự đọc.", "D. Bắt học thuộc lòng sách."]', 'A', 'Thực hành trực tiếp là phương pháp hiệu quả nhất để chuyển giao kỹ thuật cho đồng bào.'),
	(52, 'Quiz: Mục tiêu lớn nhất', 40, 20, 'Quiz', 'Mục tiêu lớn lao nhất của dự án ''Mùa Rẫy Không Khói'' là gì?', 'brain', 'learn', 'quiz', 'daily', 0, 0, '["A. Hướng tới nền nông nghiệp tuần hoàn, xanh, sạch và sinh kế bền vững.", "B. Khai thác cạn kiệt tài nguyên đất.", "C. Chăn nuôi gia súc quy mô lớn.", "D. Chuyển sang làm công nghiệp."]', 'A', 'Giải quyết tận gốc ô nhiễm môi trường và tạo ra thu nhập bền vững cho nông dân.'),
	-- Preserved Action/Report Tasks (Re-indexed from 53)
	(53, 'Gom rơm rạ/vỏ cà phê', 60, 20, 'Action', 'Chụp ảnh gom rơm rạ/vỏ cà phê thành đống sau thu hoạch.', 'camera', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(54, 'Trộn men vi sinh', 70, 20, 'Action', 'Chụp ảnh đang trộn men vi sinh vào đống ủ.', 'camera', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(55, 'Tưới giữ ẩm đống ủ', 50, 20, 'Action', 'Chụp ảnh đang tưới nước giữ ẩm cho đống ủ phân.', 'water', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(56, 'Che đậy bạt đống ủ', 50, 20, 'Action', 'Chụp ảnh/quay video (5s) che đậy bạt bảo vệ đống ủ.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL, NULL),
	(57, 'Đảo đống ủ cho thoáng', 60, 20, 'Action', 'Quay video ngắn cảnh dùng xẻng đảo đống ủ cho thoáng khí.', 'camera', 'action', 'video', 'weekly', 0, 1, NULL, NULL, NULL),
	(58, 'Phân hoai mục thành công', 100, 20, 'Action', 'Chụp ảnh đống phân hữu cơ đã hoai mục thành công (đen, tơi xốp).', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(59, 'Bón phân tự ủ cho cây', 80, 20, 'Action', 'Chụp ảnh đang bón phân tự ủ cho gốc cây cà phê / hoa màu.', 'leaf', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(60, 'Phân loại rác tại bếp', 60, 20, 'Action', 'Chụp ảnh phân loại rác hữu cơ (rau củ thừa) và vô cơ (túi nilon) tại bếp.', 'recycle', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(61, 'Vứt rác vô cơ đúng nơi', 40, 20, 'Action', 'Chụp ảnh vứt rác vô cơ đúng nơi quy định của buôn làng.', 'trash-can', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(62, 'Nhặt vỏ chai thuốc trên rẫy', 70, 20, 'Action', 'Chụp ảnh nhặt vỏ chai/bao bì thuốc bảo vệ thực vật trên rẫy.', 'delete-sweep', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(63, 'Nộp bao bì thuốc trừ sâu', 80, 20, 'Action', 'Chụp ảnh đem bao bì thuốc trừ sâu nộp tại điểm thu gom chung.', 'truck-delivery', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(64, 'Tái chế đồ cũ thành chậu', 90, 20, 'Action', 'Chụp ảnh tái chế (dùng chai nhựa cũ làm chậu ươm hạt mầm).', 'recycle', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(65, 'Quét dọn đường làng', 60, 20, 'Action', 'Chụp ảnh tham gia quét dọn đường làng ngõ xóm.', 'broom', 'action', 'photo', 'weekly', 0, 1, NULL, NULL, NULL),
	(66, 'Giới thiệu app cho hàng xóm', 120, 20, 'Action', 'Quét mã QR giới thiệu app thành công cho một người hàng xóm.', 'qrcode', 'action', 'qr', 'weekly', 0, 1, NULL, NULL, NULL),
	(67, 'Buộc kín túi rác trước khi vứt', 40, 20, 'Action', 'Chụp ảnh túi rác hoặc bao tải rác đã được buộc kín trước khi vứt.', 'bag-checked', 'action', 'photo', 'daily', 0, 1, NULL, NULL, NULL),
	(68, 'Báo cáo đốt rơm rạ', 100, 20, 'Report', 'Báo cáo tọa độ đang có đống rơm rạ bị đốt (kèm ảnh khói).', 'fire-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(69, 'Báo cáo đốt rác nông nghiệp', 100, 20, 'Report', 'Báo cáo tọa độ đang đốt vỏ cà phê / rác thải nông nghiệp.', 'fire', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(70, 'Báo cáo bãi rác tự phát', 80, 20, 'Report', 'Báo cáo một bãi rác tự phát mới xuất hiện cạnh đường/kênh rạch.', 'map-marker-alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(71, 'Báo cáo vỏ chai thuốc vứt bừa', 80, 20, 'Report', 'Báo cáo khu vực có nhiều vỏ chai thuốc trừ sâu vứt bừa bãi.', 'alert', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(72, 'Cập nhật điểm ô nhiễm đã sạch', 120, 20, 'Report', 'Chụp ảnh điểm ô nhiễm (đã báo cáo trước đó) nay đã được dọn sạch.', 'check-circle', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(73, 'Báo cáo khói mù không rõ nguồn', 90, 20, 'Report', 'Báo cáo khói mù mịt không rõ nguồn gốc gây ảnh hưởng tầm nhìn.', 'weather-fog', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(74, 'Báo cáo xả rác xuống suối', 100, 20, 'Report', 'Báo cáo hành vi xả rác sinh hoạt thẳng xuống suối/nguồn nước.', 'water-off', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(75, 'Đánh dấu đống ủ lên bản đồ', 60, 20, 'Report', 'Đánh dấu vị trí đống ủ phân sinh học chuẩn của nhà mình lên bản đồ.', 'map-marker-plus', 'report', 'gps', 'weekly', 1, 1, NULL, NULL, NULL),
	(76, 'Báo cáo điểm tập kết rác quá tải', 70, 20, 'Report', 'Báo cáo điểm tập kết rác của buôn làng đang bị quá tải, chưa có xe thu gom.', 'trash-can-outline', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL),
	(77, 'SOS: Báo cháy lan rộng', 150, 20, 'Report', 'Báo cáo nhanh (SOS) đám cháy có nguy cơ lan rộng.', 'fire-extinguisher', 'report', 'photo', 'daily', 1, 1, NULL, NULL, NULL);

-- Shop Items
INSERT INTO `shop_items` (`id`, `name`, `price`, `description`, `image_url`, `item_type`, `is_real`) VALUES 
(1, 'Hạt giống Cà phê', 50, 'Hạt giống cà phê chất lượng cao.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455993/nongnghiepxanh/seed/cafe.png', 'seed', 0),
(2, 'Hạt giống Sầu riêng', 100, 'Hạt giống sầu riêng Đắk Lắk.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455994/nongnghiepxanh/seed/saurieng.png', 'seed', 0),
(3, 'Chậu Gốm Đỏ', 500, 'Mẫu chậu gốm đỏ truyền thống.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455981/nongnghiepxanh/chau/1.png', 'pot_skin', 0),
(4, 'Chậu Đất Nung', 800, 'Mẫu chậu đất nung bền bỉ.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455985/nongnghiepxanh/chau/2.png', 'pot_skin', 0),
(5, 'Chậu Sứ Xanh', 1200, 'Mẫu chậu sứ xanh trang nhã.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455986/nongnghiepxanh/chau/3.png', 'pot_skin', 0),
(6, 'Chậu Sứ Trắng', 1500, 'Mẫu chậu sứ trắng hiện đại.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455987/nongnghiepxanh/chau/4.png', 'pot_skin', 0),
(7, 'Chậu Cổ Điển', 2000, 'Mẫu chậu mang phong cách cổ điển.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455988/nongnghiepxanh/chau/5.png', 'pot_skin', 0),
(8, 'Chậu Vàng Hoàng Gia', 5000, 'Mẫu chậu mạ vàng sang trọng.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455989/nongnghiepxanh/chau/6.png', 'pot_skin', 0),
(9, 'Chậu Ngọc Bích', 3500, 'Mẫu chậu làm từ đá ngọc bích quý hiếm.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455990/nongnghiepxanh/chau/7.png', 'pot_skin', 0),
(10, 'Chậu Họa Tiết', 1800, 'Chậu vẽ tay họa tiết truyền thống.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455991/nongnghiepxanh/chau/8.png', 'pot_skin', 0),
(11, 'Chậu Cao Cấp', 4500, 'Chậu gốm sứ cao cấp xuất khẩu.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455992/nongnghiepxanh/chau/9.png', 'pot_skin', 0),
(12, 'Chậu Đặc Biệt', 10000, 'Phiên bản giới hạn dành cho đại gia.', 'https://res.cloudinary.com/dnxuaugmx/image/upload/v1777455982/nongnghiepxanh/chau/10.png', 'pot_skin', 0),
(13, 'Áo phông Nông Nghiệp Xanh', 2000, 'Áo thun cotton cao cấp in logo ứng dụng.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'tool', 1),
(14, 'Mũ bảo hiểm Đắk Lắk', 1500, 'Mũ bảo hiểm chất lượng cao bảo vệ an toàn.', 'https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=400', 'tool', 1),
(15, 'Túi ủ men vi sinh Trichoderma', 500, 'Gói 1kg men vi sinh giúp ủ vỏ cà phê nhanh chóng.', 'https://images.unsplash.com/photo-1585314062340-f1a5acc23555?w=400', 'fertilizer', 1);

-- Stock
INSERT INTO `inventory_stock` (`item_id`, `quantity`) VALUES 
(1, 100), (2, 100), (3, 100), (4, 100), (5, 100), (6, 100), (7, 100), (8, 100), (9, 100), (10, 100), (11, 100), (12, 100), (13, 50), (14, 50), (15, 50);

SET FOREIGN_KEY_CHECKS = 1;
