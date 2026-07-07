# Đặc Tả Phân Quyền Hệ Thống - Dê Hương Sơn

Tài liệu này quy định chi tiết quyền hạn của 4 vai trò (`user`, `staff`, `manager`, `admin`) trên cả hệ thống Frontend và Backend của website quản lý nhà hàng Dê Hương Sơn.

---

## 1. Khách hàng (`user`)
Đối tượng sử dụng chính của website bán hàng và đặt bàn công cộng.
*   **Giao diện sử dụng:** Giao diện khách hàng.
*   **Quyền hạn chi tiết:**
    *   Xem thực đơn (Menu public), tìm kiếm và lọc món ăn.
    *   Thêm/sửa/xóa các món ăn trong giỏ hàng cá nhân.
    *   Tiến hành đặt hàng (Checkout) và đặt bàn trực tuyến.
    *   Xem chi tiết lịch sử đơn hàng và trạng thái đơn hàng của chính mình.
    *   Xem lịch sử và trạng thái đặt bàn của chính mình.
    *   Cập nhật thông tin hồ sơ cá nhân (Họ tên, số điện thoại, địa chỉ, avatar).
*   **Hạn chế:** Không được phép truy cập vào bất kỳ đường dẫn quản trị nào bắt đầu bằng `/admin`.

---

## 2. Nhân viên (`staff`)
Vai trò phục vụ vận hành hàng ngày của nhà hàng (nhận đơn, chuẩn bị món, giao hàng, check bàn).
*   **Giao diện sử dụng:** Giao diện quản trị `/admin`.
*   **Quyền hạn chi tiết:**
    *   Xem trang Tổng quan (Dashboard) với các số liệu cơ bản (Đơn hàng, Đặt bàn, Khách hàng mới, Món bán chạy).
    *   Xem danh sách và chi tiết các đơn hàng của nhà hàng.
    *   Cập nhật trạng thái đơn hàng (Chờ xác nhận → Đang chuẩn bị → Đang giao → Hoàn thành / Hủy đơn).
    *   Xem danh sách và chi tiết các lượt đặt bàn.
    *   Thực hiện thao tác xác nhận, hoàn thành hoặc hủy đặt bàn cho khách hàng.
    *   Xem danh sách bàn, khu vực và trạng thái của các bàn.
    *   Xem thông tin khách hàng (Danh sách khách hàng).
*   **Hạn chế quan trọng:**
    *   **Không được phép xem doanh thu, lợi nhuận** (các chỉ số tài chính trên Dashboard và các biểu đồ cột/tròn doanh thu sẽ bị lọc bỏ hoặc hiển thị bằng `0`/rỗng).
    *   Không được truy cập trang **Doanh thu** và trang **Báo cáo chi tiết** ở sidebar.
    *   Không được xuất Excel báo cáo doanh thu.
    *   Không được phép tạo mới, chỉnh sửa, xóa thực đơn (Menu), bàn/khu vực hoặc các chương trình khuyến mãi.
    *   Không được vào trang cấu hình vai trò hay cài đặt hệ thống.

---

## 3. Quản lý (`manager`)
Vai trò quản lý vận hành chung, cấu hình thực đơn, khuyến mãi và báo cáo kinh doanh của nhà hàng.
*   **Giao diện sử dụng:** Giao diện quản trị `/admin`.
*   **Quyền hạn chi tiết:**
    *   Toàn quyền quản lý đơn hàng (Xem, sửa thông tin, cập nhật trạng thái).
    *   Toàn quyền quản lý đặt bàn (Xem, tạo đặt bàn mới từ admin, sửa, xóa đặt bàn).
    *   Toàn quyền quản lý thực đơn (Xem danh sách, thêm món mới, sửa món, ngừng bán, xóa món).
    *   Toàn quyền quản lý bàn & khu vực (Thêm/sửa/xóa bàn, đổi trạng thái bàn, quản lý khu vực, không gian nhà hàng).
    *   Toàn quyền quản lý khuyến mãi (Thêm/sửa/xóa mã giảm giá, chương trình khuyến mãi).
    *   Xem thông tin và nhóm khách hàng.
    *   Xem đầy đủ Dashboard, báo cáo doanh thu, biểu đồ phân tích và được phép xuất báo cáo Excel doanh thu.
*   **Hạn chế quan trọng:**
    *   Không được vào trang quản lý phân quyền (Vai trò).
    *   Không được thay đổi vai trò tài khoản của người khác, không được khóa hoặc mở khóa tài khoản của `admin`, `manager` hay `staff`.
    *   Không được vào phần Cài đặt hệ thống (các cấu hình nhạy cảm của nhà hàng).

---

## 4. Quản trị viên (`admin`)
Vai trò tối cao, nắm toàn quyền kiểm soát và quản trị kỹ thuật của toàn bộ hệ thống.
*   **Giao diện sử dụng:** Giao diện quản trị `/admin`.
*   **Quyền hạn chi tiết:**
    *   Nắm giữ tất cả quyền hạn vận hành và báo cáo của vai trò `manager`.
    *   Quản lý phân quyền tài khoản (Đổi vai trò giữa `admin`, `manager`, `staff`, `user`).
    *   Quản lý trạng thái tài khoản (Khóa hoặc mở khóa tài khoản của bất kỳ người dùng nào).
    *   Xem nhật ký hoạt động hệ thống (Nhật ký phân quyền, đổi trạng thái tài khoản).
    *   Truy cập và cấu hình cài đặt hệ thống.
*   **Quy tắc an toàn hệ thống:**
    *   **Không được phép tự thay đổi vai trò của chính mình** (tránh tình trạng tự hạ quyền gây mất tài khoản admin).
    *   **Chặn xóa admin cuối cùng:** Hệ thống sẽ từ chối thay đổi vai trò nếu đó là tài khoản `admin` đang hoạt động cuối cùng của hệ thống.
