# 🌿 Đánh giá Hệ thống Nông Nghiệp Xanh

Tài liệu này tổng hợp toàn bộ các tính năng đã được triển khai và tối ưu hóa trong ứng dụng **Nông Nghiệp Xanh**. Hệ thống được thiết kế nhằm hỗ trợ nông dân canh tác bền vững, kết hợp yếu tố trò chơi hóa (gamification) để tăng tương tác.

---

## 1. Hệ thống Người dùng & Bảo mật
- **Đăng nhập/Đăng ký:** Sử dụng số điện thoại. Tự động nhận diện tài khoản mới để chuyển hướng sang màn hình hoàn thiện hồ sơ.
- **Hồ sơ Cá nhân (Profile):** 
  - Quản lý thông tin cá nhân (Tên, Ngày sinh, Buôn làng).
  - Theo dõi chỉ số: Cấp độ (Level), Kinh nghiệm (EXP), Số dư Xu.
  - Tích hợp xem lại lịch sử hoạt động và kho quà tặng đã đổi.
- **Xác thực Admin/Moderator:** Phân quyền người dùng (Farmer, Moderator, Admin) để truy cập các bảng điều khiển tương ứng.

## 2. Hệ thống Khu vườn Đám mây (Cloud Garden)
- **Cơ chế mô phỏng:** Trồng cây (Cà phê, Sầu riêng) trên các ô đất đám mây.
- **Quản lý Sinh trưởng:**
  - Cây trải qua 5 giai đoạn: Nảy mầm -> Cây non -> Trưởng thành -> Ra hoa -> Kết trái.
  - Các chỉ số cần chăm sóc: Độ ẩm (Tưới nước), Dinh dưỡng (Bón phân).
  - Thu hoạch: Nhận Xu vàng khi cây đạt giai đoạn Kết trái.
- **Tùy biến:** Hệ thống **Skins Chậu cây** cho phép người dùng mua và thay đổi ngoại hình chậu cây từ kho đồ cá nhân.

## 3. Hệ thống Nhiệm vụ (Tasks)
- **Nhiệm vụ Tuần:** Tự động xoay vòng 5 nhiệm vụ mỗi tuần dựa trên ID người dùng.
- **Phân loại Nhiệm vụ:**
  - **Hành động (Action):** Chụp ảnh minh chứng (ủ phân, dọn dẹp...).
  - **Báo cáo (Report):** Ghi nhận tọa độ GPS các điểm ô nhiễm, đốt rẫy.
  - **Học tập (Quiz):** Trắc nghiệm kiến thức nông nghiệp, nhận thưởng ngay khi trả lời đúng.
- **Xác thực AI (Gemini):** Tích hợp AI để tự động kiểm tra ảnh minh chứng, cảnh báo nếu ảnh không liên quan đến nội dung nhiệm vụ.

## 4. Cửa hàng vật tư & Đổi quà
- **Vật phẩm ảo:** Mua hạt giống, phân bón, chậu cây bằng Xu.
- **Quà tặng thực tế:** Đổi Xu lấy các vật phẩm thực (Áo phông, Mũ bảo hiểm, Men vi sinh).
- **Quy trình đổi quà:** Người dùng nhập thông tin giao hàng -> Hệ thống tạo mã QR -> Moderator quét mã để xác nhận trao quà thực tế.

## 5. Bản đồ & Cộng đồng (Community)
- **Bản đồ trực quan:** 
  - Hiển thị vị trí của các nông dân khác trong khu vực.
  - Hiển thị các điểm "Minh chứng" (POI) từ nhiệm vụ báo cáo của cộng đồng.
- **Bảng xếp hạng (Ranking):** 
  - Xếp hạng cá nhân dựa trên số Xu tích lũy.
  - Xếp hạng Buôn làng dựa trên tổng đóng góp của các thành viên.
- **Bảng tin hoạt động:** Cập nhật thời gian thực các hoạt động hoàn thành nhiệm vụ của hàng xóm.

## 6. Thư viện kiến thức (Library)
- Kho tài liệu hướng dẫn kỹ thuật canh tác xanh.
- Hỗ trợ bài viết text và Video hướng dẫn (YouTube/Local).
- Phân loại theo chuyên mục: Trồng trọt, Bảo vệ đất, Nước sạch...

## 7. Bảng điều khiển Admin & Moderator
- **Duyệt nhiệm vụ:** Moderator xem ảnh minh chứng, kiểm tra cảnh báo AI và quyết định Duyệt/Từ chối.
- **Quản lý người dùng:** Khóa tài khoản, đổi mật khẩu, phân quyền.
- **Quản lý kho hàng:** Cập nhật số lượng vật phẩm trong kho quà thực tế.
- **Thống kê:** Theo dõi tổng số nhiệm vụ hoàn thành, lượng Xu đã phát ra và số người dùng hoạt động.

---
**Trạng thái:** Hệ thống đã được đồng bộ hóa hoàn toàn giữa Backend và Frontend, sẵn sàng cho việc vận hành thực tế.
