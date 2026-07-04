-- Create restaurant_spaces table
CREATE TABLE IF NOT EXISTS `restaurant_spaces` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `space_key` VARCHAR(50) UNIQUE NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `detail_description` TEXT DEFAULT NULL,
  `capacity` INT DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create space_images table
CREATE TABLE IF NOT EXISTS `space_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `space_id` INT NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `is_cover` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`space_id`) REFERENCES `restaurant_spaces`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear old records to avoid duplication during test setup
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `space_images`;
TRUNCATE TABLE `restaurant_spaces`;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert initial spaces data
INSERT INTO `restaurant_spaces` (`space_key`, `label`, `description`, `detail_description`, `capacity`, `display_order`, `status`) VALUES
('ground', 'Tầng 1', 'Không gian ấm cúng, phù hợp gia đình và nhóm bạn', 'Tầng 1 mang phong cách bày trí ấm cúng cổ điển với bàn ghế gỗ sồi, ánh đèn vàng ấm áp và tranh phong cảnh núi rừng Hương Sơn độc đáo. Thích hợp cho sum họp gia đình, tụ tập bạn bè thân thiết.', 60, 1, 'active'),
('floor2', 'Tầng 2', 'Không gian rộng rãi, thoáng mát', 'Tầng hai sở hữu thiết kế ban công rộng mở đón gió tự nhiên, cây xanh leo xanh mướt xung quanh, tầm nhìn trực tiếp xuống trung tâm phố thị. Cực kỳ thích hợp cho các buổi tiệc đoàn viên, sinh nhật đông người.', 80, 2, 'active'),
('vip', 'Phòng VIP', 'Không gian riêng tư, sang trọng', 'Khu vực phòng VIP khép kín được trang bị hệ thống điều hòa riêng, cách âm tốt và bài trí nội thất tân cổ điển sang trọng bậc nhất. Đây là lựa chọn hoàn hảo để tiếp đãi đối tác quan trọng hay họp gia đình riêng tư.', 20, 3, 'active'),
('garden', 'Sân vườn', 'Không gian ngoài trời gần gũi thiên nhiên', 'Khuôn viên sân vườn ngập tràn bóng mát cây xanh cổ thụ, tiếng nước chảy róc rách từ hòn non bộ nhân tạo mang lại cảm giác bình yên thư thả giữa lòng phố thị xô bồ.', 120, 4, 'inactive'),
('rooftop', 'Sân thượng', 'Không gian mở, view đẹp', 'Tầm nhìn bao quát toàn bộ thành phố lung linh ánh đèn. Phù hợp các buổi tiệc buffet tối lãng mạn ngoài trời.', 35, 5, 'pending'),
('meeting', 'Phòng họp', 'Phòng họp, tổ chức sự kiện', 'Không gian đa năng được trang bị sẵn tivi màn hình lớn, máy chiếu, âm thanh tiêu chuẩn cho các buổi hội nghị nội bộ.', 40, 6, 'pending'),
('kids', 'Khu vui chơi trẻ em', 'Không gian dành cho trẻ em', 'Được thiết kế thảm xốp chống va đập, đầy đủ nhà bóng, cầu trượt, đồ chơi trí tuệ giúp các bé thỏa sức vui chơi an toàn.', 25, 7, 'pending');

-- Insert initial space images linking to the spaces
INSERT INTO `space_images` (`space_id`, `url`, `title`, `description`, `is_cover`) VALUES
-- Ground Floor images (linking via subquery for safety)
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'ground'), '/src/assets/images/About/tang-tret.png', 'Không gian tầng 1', 'Bàn tiệc lớn cho gia đình ấm cúng', 1),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'ground'), '/src/assets/images/About/tang-tret-1.png', 'Bàn ăn đôi', 'Góc nhỏ riêng tư cho cặp đôi', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'ground'), '/src/assets/images/About/tang-tret-2.png', 'Khu vực cửa sổ', 'Hướng view thoáng ngắm cây xanh', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'ground'), '/src/assets/images/About/tang-tret-3.png', 'Khu quầy bar', 'Nơi bày trí các loại rượu đặc sản', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'ground'), '/src/assets/images/About/tang-tret-4.png', 'Bàn tiệc tròn', 'Thích hợp liên hoan nhỏ 8-10 người', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'ground'), '/src/assets/images/About/tang-tret-5.png', 'Lối vào chính', 'Không gian sảnh chào khách trang trọng', 0),

-- Floor 2 images
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'floor2'), '/src/assets/images/About/tang-hai.png', 'Ban công ngoài trời', 'Không gian ăn uống ngoài trời thoáng đãng', 1),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'floor2'), '/src/assets/images/About/tang-hai-1.png', 'Hàng bàn dài', 'Dành cho nhóm họp lớp, liên hoan công ty', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'floor2'), '/src/assets/images/About/tang-hai-2.png', 'Bàn bốn người sát kính', 'Góc nhìn thành phố lãng mạn về đêm', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'floor2'), '/src/assets/images/About/tang-hai-3.png', 'Thiết kế mộc mạc', 'Vách ngăn tre và chậu cảnh xanh mát', 0),

-- VIP images
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'vip'), '/src/assets/images/About/phong-vip.png', 'Phòng tiệc VIP chính', 'Bàn xoay tròn phong cách hoàng gia', 1),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'vip'), '/src/assets/images/About/phong-vip-1.png', 'Góc sofa thư giãn', 'Nơi uống trà đàm đạo trước khi vào tiệc', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'vip'), '/src/assets/images/About/phong-vip-2.png', 'Tranh trang trí VIP', 'Họa tiết tranh thêu tay mang tính nghệ thuật', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'vip'), '/src/assets/images/About/phong-vip-3.png', 'Bộ ấm chén cao cấp', 'Dịch vụ tiếp trà cao cấp cho phòng VIP', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'vip'), '/src/assets/images/About/phong-vip-4.png', 'Phòng VIP nhỏ', 'Sức chứa 6-8 khách ấm cúng', 0),

-- Garden images
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'garden'), '/src/assets/images/About/tang-tret-2.png', 'Khu bàn đá ngoài trời', 'Bàn ghế đá tự nhiên mát mẻ', 1),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'garden'), '/src/assets/images/About/tang-tret-3.png', 'Tiểu cảnh hòn non bộ', 'Điểm nhấn phong thủy của khu sân vườn', 0),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'garden'), '/src/assets/images/About/tang-tret-4.png', 'Ánh đèn lung linh', 'Hệ thống đèn lồng tre thắp sáng ban đêm', 0),

-- Rooftop images
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'rooftop'), '/src/assets/images/About/tang-hai-2.png', 'Cảnh hoàng hôn', 'View ngắm hoàng hôn siêu đẹp từ sân thượng', 1),
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'rooftop'), '/src/assets/images/About/tang-hai-3.png', 'Bàn tiệc đứng', 'Cách sắp xếp cho tiệc rượu đứng cao cấp', 0),

-- Meeting Room images
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'meeting'), '/src/assets/images/About/phong-vip-3.png', 'Màn chiếu slide', 'Sẵn sàng cho các buổi thuyết trình hội họp', 1),

-- Kids Play Area images
((SELECT `id` FROM `restaurant_spaces` WHERE `space_key` = 'kids'), '/src/assets/images/About/tang-tret-4.png', 'Bể bóng sắc màu', 'Không gian đồ chơi yêu thích của trẻ nhỏ', 1);
