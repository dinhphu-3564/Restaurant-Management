# Quy tắc thiết kế chung của Workspace (Web UI Design Guidelines)
*Dành cho Dự án Nhà hàng DinhPhuu*

## 1. Web UI Design Guidelines
- **Màu Sắc Nút Bấm Chính (Primary Button Color)**: Tất cả các nút bấm chính (`.btn-primary`) trong hệ thống quản lý, gọi món hoặc đặt bàn của nhà hàng phải hiển thị chữ màu trắng (`#ffffff`) trên nền màu chủ đạo của nhà hàng (ví dụ: nền màu xanh `#16af5a`, đỏ hoặc cam tùy theo bộ nhận diện thương hiệu). Yêu cầu đồng nhất ở cả giao diện Sáng (Light Mode) và Tối (Dark Mode).
- **Trạng Thái Hover & Active**: Khi người dùng (khách hàng hoặc nhân viên) lướt chuột qua (hover) hoặc nhấn (active) vào nút bấm, màu chữ phải được giữ nguyên là màu trắng, tuyệt đối không được chuyển sang màu xám/đen hay bị thừa kế màu tối từ các thành phần khác. Yêu cầu sử dụng từ khóa `!important` trong CSS của `.btn-primary` để đảm bảo độ đặc hiệu cao nhất, tránh bị các class tiện ích khác (như Tailwind) đè lên.

## 2. Quy định độ dài mã nguồn (File Length Limitation)
- **Kiểm soát file code**: Các file mã nguồn không nên vượt quá **800 dòng** (Soft Limit). Nếu file quá dài, cần chia nhỏ thành các component, sub-services hoặc custom hooks. Giới hạn tối đa tuyệt đối là **1000 dòng** (Hard Limit).
- **Nguyên tắc chia nhỏ**: Áp dụng để chia nhỏ các luồng xử lý phức tạp của nhà hàng (như module tính tiền, quản lý bàn tiệc, thống kê doanh thu) ra nhiều thành phần để dễ bảo trì.

## 3. Quy chuẩn đa ngôn ngữ (Localization)
- Hỗ trợ chuẩn hóa đa ngôn ngữ (Ví dụ: Tiếng Việt, Tiếng Anh cho khách du lịch).
- Không hardcode (viết cứng) chuỗi ký tự hiển thị trên UI. Phải dùng file cấu hình JSON chứa bản dịch.
