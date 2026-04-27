# 🌿 Nông Nghiệp Xanh (Green Agriculture) 🚀

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)]()
[![Framework](https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-61DAFB.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933.svg)]()
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1.svg)]()
[![AI](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-blue.svg)]()

> **Nông Nghiệp Xanh** là một nền tảng chuyển đổi số nông nghiệp hiện đại, kết hợp giữa mô phỏng trò chơi (Gamification) và các nhiệm vụ thực tế để khuyến khích bà con nông dân canh tác bền vững, bảo vệ môi trường.

---

## ✨ Tính năng nổi bật

### 👨‍🌾 Dành cho Nông dân
- **Vườn Ảo 3D:** Trồng trọt, tưới nước, bón phân và thu hoạch cây trồng ngay trên ứng dụng với thời gian thực.
- **Nhiệm vụ Thực tế:** Tham gia các chiến dịch trồng rừng, thu gom rác thải nông nghiệp và nộp minh chứng qua ảnh.
- **Bản đồ Buôn Làng:** Hệ thống định vị GPS giúp kết nối cộng đồng, xem vị trí và hồ sơ của hàng xóm.
- **Cửa hàng Đổi thưởng:** Tích lũy Xu (Coins) từ việc làm nhiệm vụ để đổi lấy phân bón, hạt giống và các phần quà giá trị.
- **Hệ thống Cấp độ (Leveling):** Tích lũy EXP từ các hoạt động thực tế để thăng cấp. Mỗi cấp độ mới sẽ mở khóa thêm 1 ô **Vườn Mây** để trồng trọt nhiều hơn.
- **Bảng Vàng Thành Tích:** Tôn vinh những cá nhân và buôn làng có đóng góp tích cực nhất trong chiến dịch xanh hóa.
- **Đa ngôn ngữ:** Hệ thống ngôn ngữ linh hoạt hỗ trợ Tiếng Việt, Tiếng Anh và **Tiếng Ê-đê**, giúp bà con dân tộc dễ dàng tiếp cận và sử dụng.

### 🛡️ Dành cho Người quản lý (Moderator/Admin)
- **Kiểm duyệt AI:** Tích hợp **Google Gemini 2.0** để tự động phân tích ảnh minh chứng, phát hiện gian lận và đánh giá chất lượng nhiệm vụ.
- **Bản đồ Giám sát:** Theo dõi mật độ hoạt động của bà con trên bản đồ Việt Nam.
- **Quản lý Người dùng:** Hệ thống phân quyền chặt chẽ (Farmer, Moderator, Admin), quản lý khóa/mở tài khoản và reset mật khẩu.
- **Báo cáo Thống kê:** Theo dõi tiến độ xanh hóa buôn làng theo tuần/tháng.

---

## 🛠️ Công nghệ sử dụng

### Mobile (Frontend)
- **React Native & Expo:** Phát triển ứng dụng đa nền tảng.
- **Zustand:** Quản lý trạng thái (State Management) mượt mà.
- **React Native Reanimated & Moti:** Tạo các hiệu ứng chuyển động và micro-interactions cao cấp.
- **Leaflet & WebView:** Hệ thống bản đồ tương tác tùy chỉnh.

### Backend & AI
- **Node.js & Express:** Hệ thống API mạnh mẽ, ổn định.
- **MySQL:** Cơ sở dữ liệu quan hệ lưu trữ thông tin người dùng và lịch sử nhiệm vụ.
- **Google Gemini API:** Xử lý hình ảnh và xác thực nhiệm vụ tự động.
- **Cloudinary:** Lưu trữ và tối ưu hóa hình ảnh.

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js >= 18
- MySQL Server
- Expo Go (cho thiết bị di động)

### 2. Cài đặt Backend
```bash
cd server
npm install
# Tạo file .env và cấu hình DB_HOST, DB_USER, DB_PASS, GEMINI_API_KEY, CLOUDINARY_URL
node index.js
```

### 3. Cài đặt Frontend
```bash
npm install
npx expo start
```

---

## 📸 Giao diện ứng dụng

| Trang chủ & Vườn cây | Bản đồ Buôn làng | Quản lý Nhiệm vụ |
|:---:|:---:|:---:|
| ![Home](https://res.cloudinary.com/demo/image/upload/v1/sample.jpg) | ![Map](https://res.cloudinary.com/demo/image/upload/v1/sample.jpg) | ![Admin](https://res.cloudinary.com/demo/image/upload/v1/sample.jpg) |

---

## 📜 Giấy phép & Bản quyền
Dự án được phát triển nhằm mục đích hỗ trợ cộng đồng nông nghiệp bền vững. Mọi hành vi sao chép vui lòng ghi rõ nguồn.

**Nông Nghiệp Xanh - Vì một tương lai bền vững.** 🌱
