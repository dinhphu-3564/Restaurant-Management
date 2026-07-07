# Quy chuẩn kiểm tra dữ liệu và UX (Validation Standards)
*Dành cho Dự án Nhà hàng DinhPhuu*

Bộ quy chuẩn này định nghĩa các cách tiếp cận tiêu chuẩn cho việc kiểm tra đầu vào và xử lý lỗi xuyên suốt trong dự án Nhà hàng (đặt bàn, gọi món, quản lý nhân viên, v.v.). Mọi tính năng mới cần phải tuân theo các quy tắc này.

## 1. Giao diện (Frontend UI/UX Pattern)

### 1.1 Trạng thái hiển thị (Visual States)
- **Trạng thái bình thường**: Viền và màu sắc tiêu chuẩn theo theme của nhà hàng.
- **Trạng thái lỗi**:
    - **Viền**: Chuyển sang màu đỏ (ví dụ: `border-red-500`).
    - **Icon**: Các icon đi kèm trường nhập liệu chuyển sang màu đỏ.
    - **Phản hồi**: Hiển thị thông báo lỗi ngắn gọn ngay bên trên hoặc dưới trường nhập liệu (VD: Số điện thoại không đúng).
    - **Hiệu ứng**: Sử dụng hiệu ứng xuất hiện nhẹ nhàng (ví dụ: `animate-in fade-in slide-in`) cho thông báo lỗi để thu hút sự chú ý của khách hàng/nhân viên.
- **Trạng thái Focus**: Giữ nguyên vòng báo hiệu (focus ring) rõ ràng nhưng nếu trường đang bị lỗi, viền đỏ vẫn phải được ưu tiên hiển thị.

### 1.2 Logic tương tác
- **Chặn gửi dữ liệu (Submission Block)**: Không bao giờ cho phép gọi API nếu việc kiểm tra tính hợp lệ tại frontend bị lỗi (ví dụ: đặt bàn nhưng để trống số lượng người).
- **Thời điểm phản hồi**:
    - **Khi nhấn Submit**: Kiểm tra toàn bộ các trường khi người dùng nhấn nút hành động chính (như "Đặt Bàn" / "Thanh Toán" / "Gửi Order").
    - **Khi thay đổi/Rời khỏi trường (Tùy chọn)**: Cung cấp cảnh báo ngay khi người dùng gõ sai định dạng để có trải nghiệm mượt mà hơn.
- **Trạng thái tải (Loading State)**: Vô hiệu hóa nút submit và hiển thị icon tải (spinner) trong lúc đang xử lý để tránh khách hàng nhấn thanh toán nhiều lần gây trùng lặp đơn hàng.

### 1.3 Thông báo lỗi (Messaging)
- **Giọng văn**: Chuyên nghiệp, rõ ràng, và mang tính hỗ trợ khách hàng thân thiện.
- **Độ dài**: Thông báo lỗi nên được giữ dưới 5-7 từ.
- **Ngôn ngữ**: Sử dụng ngôn ngữ hiển thị tương ứng (ưu tiên tiếng Việt, không dùng thuật ngữ kỹ thuật khó hiểu).

### 1.4 Quy tắc cuộn/bố cục Cửa sổ nổi (Modal Scrolling Standards)
- **Sticky Header & Footer**: Mọi cửa sổ nổi (Modal, ví dụ: Xem chi tiết món ăn, Checkout giỏ hàng) phải giữ cố định Header (tiêu đề) và Footer (các nút hành động như "Hủy", "Xác nhận đặt món"). Tránh tình trạng cuộn mất nút khi danh sách món quá dài.
- **Scrollable Body**: Chỉ cho phép vùng chứa nội dung của modal (danh sách món) cuộn dọc ở giữa.

## 2. Tiêu chuẩn API Backend (Backend Validation Pattern)

### 2.1 Tính nhất quán
- Mọi API endpoint nhận dữ liệu từ người dùng (như tạo hóa đơn mới, chỉnh sửa trạng thái bàn) **BẮT BUỘC** phải kiểm tra tính hợp lệ ở phía server, bất kể frontend đã kiểm tra hay chưa.

### 2.2 Cấu trúc phản hồi lỗi
Hệ thống backend nên trả về chuẩn JSON lỗi chính xác như sau:
```json
{
  "code": "error",
  "msg": "Vui lòng kiểm tra lại thông tin đơn hàng.",
  "errors": {
    "phone": "Số điện thoại không hợp lệ",
    "table_number": "Bàn này hiện đã có người đặt"
  }
}
```

## 3. Xử lý lỗi toàn cục (Global Error Handling)
- Nếu một biểu mẫu (form) nhập liệu thông tin cá nhân hoặc lên thực đơn tiệc có nhiều lỗi phức tạp cùng lúc, hãy sử dụng một thông báo lỗi tổng hợp (Alert) đặt ở trên cùng hoặc dưới cùng của trang/modal để người dùng dễ nhìn thấy toàn bộ vấn đề.
