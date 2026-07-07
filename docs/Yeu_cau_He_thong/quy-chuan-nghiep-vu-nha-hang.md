# Quy chuẩn Nghiệp vụ và Vận hành (Business & Operational Standards)
*Dành cho Dự án Nhà hàng DinhPhuu*

Bên cạnh các chuẩn mực về giao diện, UX và kiểm thử, một hệ thống nhà hàng hiện đại cần đáp ứng các yêu cầu nghiệp vụ chuyên sâu dưới đây để đảm bảo vận hành trơn tru trong thực tế.

## 1. Yêu cầu về Xử lý Đơn hàng & Nhà bếp (Order & Kitchen Sync)
- **Đồng bộ thời gian thực (Real-time Sync)**: Món ăn sau khi được nhân viên (hoặc khách) order phải lập tức hiện lên màn hình Nhà bếp (Kitchen Display System - KDS) hoặc in ra máy in bếp, độ trễ không quá 2 giây.
- **Quản lý trạng thái món ăn**: Mỗi món ăn cần có các trạng thái rõ ràng: `Chờ làm` -> `Đang nấu` -> `Đã xong` -> `Đã phục vụ`.
- **Cảnh báo hết món (Sold Out/Out of Stock)**: Tự động khóa món trên menu (chuyển sang màu xám, không cho bấm chọn) khi bếp báo hết nguyên liệu để tránh nhân viên nhận order sai.

## 2. Quản lý Bàn và Không gian (Table Management)
- **Tránh đặt trùng bàn (Double-booking Prevention)**: Sử dụng khóa dữ liệu (database lock) hoặc Websocket để cập nhật ngay trạng thái bàn: `Bàn trống` -> `Đang có khách` -> `Đang chờ dọn` -> `Đã đặt trước`. Nếu 2 nhân viên cùng bấm chọn 1 bàn, hệ thống phải báo lỗi cho người bấm sau.
- **Ghép/Chuyển bàn linh hoạt**: Cho phép nhân viên dễ dàng chuyển khách từ bàn A sang bàn B, hoặc gộp hóa đơn của bàn A và bàn C lại làm một mà không làm mất lịch sử order.

## 3. Xử lý Thanh toán & Hóa đơn (Payment & Billing)
- **Chia hóa đơn (Split Bill)**: Hỗ trợ tính năng chia hóa đơn theo nhiều hình thức: Chia đều cho số người, chia theo từng món khách ăn, hoặc thanh toán một phần.
- **Đa phương thức thanh toán**: Một hóa đơn có thể thanh toán bằng nhiều hình thức kết hợp (Ví dụ: Tổng bill 1 triệu -> Khách trả 500k tiền mặt + 500k cà thẻ/chuyển khoản).
- **Làm tròn số (Rounding)**: Có cấu hình tự động làm tròn tiền lẻ (ví dụ: làm tròn lên/xuống đơn vị nghìn đồng) phù hợp với thực tế thu ngân.

## 4. Phân quyền và Bảo mật (Role-based Access Control - RBAC)
- **Phân quyền chặt chẽ**:
  - `Thu ngân`: Chỉ xem hóa đơn, thu tiền, in bill. Không được xóa món sau khi bếp đã làm (nếu muốn xóa phải có mã PIN của Quản lý).
  - `Phục vụ`: Chỉ được order, chuyển bàn, không được quyền xem tổng doanh thu.
  - `Quản lý/Chủ`: Toàn quyền, xem báo cáo doanh thu, hủy hóa đơn, chỉnh sửa menu.
- **Lưu vết thao tác (Audit Log)**: Mọi hành động nhạy cảm như "Hủy hóa đơn", "Xóa món", "Áp dụng mã giảm giá" đều phải được lưu lại (Ai làm? Lúc mấy giờ? Lý do?) để đối soát chống thất thoát.

## 5. Yêu cầu Hiệu năng & Hoạt động Ngoại tuyến (Offline Mode)
- **Chế độ Ngoại tuyến (Offline Mode)**: Đối với máy POS (máy tính tiền chính), nếu rớt mạng Internet, hệ thống vẫn phải cho phép order, tính tiền và in bill cục bộ. Dữ liệu sẽ tự động đồng bộ (sync) lên server đám mây ngay khi có mạng trở lại.
- **Tốc độ phản hồi (Performance)**: Thao tác tìm kiếm món ăn hoặc thêm món vào giỏ hàng phải diễn ra tức thì (dưới 100ms) để không làm chậm nhịp độ phục vụ trong giờ cao điểm.

