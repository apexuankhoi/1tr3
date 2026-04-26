-- NÔNG NGHIỆP XANH - DATABASE SCHEMA 2024
-- Hỗ trợ: App Mobile React Native + Express Server

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('farmer','buyer','moderator','admin') DEFAULT 'farmer',
  `coins` int(11) DEFAULT 100,
  `seeds` int(11) DEFAULT 2,
  `avatar_url` varchar(255) DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `role`, `coins`, `seeds`, `location`, `bio`) VALUES 
(1, 'admin', '123456', 'Người Quản Trị', 'admin', 1000, 10, 'Ba Tri, Bến Tre', 'Chào mừng bạn đến với nông nghiệp xanh!');

-- ----------------------------
-- Table structure for library
-- ----------------------------
DROP TABLE IF EXISTS `library`;
CREATE TABLE `library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT 'KIẾN THỨC',
  `category_color` varchar(20) DEFAULT '#154212',
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `type` enum('image','video') DEFAULT 'image',
  `duration` varchar(20) DEFAULT '05:00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

INSERT INTO `library` (`title`, `description`, `category`, `image_url`, `video_url`, `type`) VALUES 
('Cách trồng lúa đạt năng suất cao', 'Hướng dẫn chi tiết từng bước từ khâu chọn giống đến khi thu hoạch lúa.', 'Trồng trọt', 'https://images.unsplash.com/photo-1592724212522-88806a03c136?w=800', NULL, 'image'),
('Kỹ thuật tưới tiêu tiết kiệm nước', 'Video hướng dẫn hệ thống tưới nhỏ giọt hiện đại cho nhà màng.', 'Nước sạch', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video'),
('Phân biệt các loại phân hữu cơ', 'Bài viết giúp nông dân nhận biết và sử dụng phân bón đúng cách.', 'Phân bón', 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800', NULL, 'image');

-- ----------------------------
-- Table structure for garden_pots
-- ----------------------------
DROP TABLE IF EXISTS `garden_pots`;
CREATE TABLE `garden_pots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `pot_id` varchar(50) NOT NULL,
  `floor_id` int(11) DEFAULT 1,
  `has_plant` tinyint(1) DEFAULT 0,
  `water_level` float DEFAULT 0,
  `fertilizer_level` float DEFAULT 0,
  `growth_stage` varchar(50) DEFAULT 'Nảy mầm',
  `growing_until` bigint(20) DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_pot` (`user_id`,`pot_id`),
  CONSTRAINT `fk_garden_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for shop_items
-- ----------------------------
DROP TABLE IF EXISTS `shop_items`;
CREATE TABLE `shop_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `type` varchar(20) DEFAULT 'gift',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

INSERT INTO `shop_items` (`name`, `description`, `price`, `image_url`, `type`) VALUES 
('Thẻ nạp điện thoại 50k', 'Đổi lấy thẻ cào điện thoại mệnh giá 50,000đ', 500, 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png', 'gift'),
('Túi phân bón hữu cơ', 'Sử dụng cho vườn cây của bạn', 200, 'https://cdn-icons-png.flaticon.com/512/3043/3043511.png', 'item'),
('Hạt giống thần kỳ', 'Hạt giống có tỉ lệ ra quả vàng cao', 100, 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png', 'item');

-- ----------------------------
-- Table structure for redemptions
-- ----------------------------
DROP TABLE IF EXISTS `redemptions`;
CREATE TABLE `redemptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `qr_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_redemption_item` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`),
  CONSTRAINT `fk_redemption_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reward_coins` int(11) DEFAULT 0,
  `reward_seeds` int(11) DEFAULT 0,
  `type` enum('daily','weekly','special') DEFAULT 'weekly',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

INSERT INTO `tasks` (`title`, `description`, `reward_coins`, `reward_seeds`, `type`) VALUES 
('Chụp ảnh vườn rau sạch', 'Hãy chụp một bức ảnh về vườn rau nhà bạn để nhận thưởng.', 50, 1, 'weekly'),
('Chia sẻ kiến thức nông nghiệp', 'Viết một đoạn ngắn chia sẻ kinh nghiệm trồng trọt của bạn.', 30, 0, 'weekly');

-- ----------------------------
-- Table structure for user_tasks
-- ----------------------------
DROP TABLE IF EXISTS `user_tasks`;
CREATE TABLE `user_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `status` enum('todo','pending','completed','failed') DEFAULT 'todo',
  `image_proof` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ut_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ut_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
