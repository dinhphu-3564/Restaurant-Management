# TÀI LIỆU CẤU TRÚC HỆ THỐNG & LUỒNG THAO TÁC QUẢN LÝ NHÀ HÀNG
**Hệ thống Quản lý Nhà hàng (Restaurant Management System)**

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

Hệ thống được thiết kế theo kiến trúc **Fullstack Separation (Client-Server)** với giao diện người dùng đơn trang (SPA) và máy dịch vụ API độc lập:

* **Frontend**: Xây dựng bằng **React** (Vite), điều hướng qua **React Router DOM v6**. Sử dụng bộ icon **Lucide React**, giao diện phân chia rõ rệt thành 2 phân khu: **Khách hàng** (Customer Site) và **Quản trị viên / Nhân viên** (Admin BackOffice Panel).
* **Backend**: Xây dựng bằng **Node.js** với framework **Express.js (v5)** chạy tại cổng `5001`, triển khai chuẩn kiến trúc RESTful API, tích hợp các Middleware xác thực, phân quyền và xử lý dữ liệu.
* **Cơ sở dữ liệu (Database)**: **MySQL 8.4** chạy trong Docker Container (cổng `3307`), kết nối thông qua thư viện `mysql2` (Pool connection 10 kết nối, thiết lập tự động múi giờ Việt Nam `+07:00`).
* **Hạ tầng Container (Docker Compose)**:
  * Container `restaurant_mysql`: Chạy MySQL 8.4 với volume dữ liệu `mysql_data`.
  * Container `restaurant_phpmyadmin`: Quản trị CSDL trực quan qua giao diện web tại cổng `8080`.
* **Cổng thanh toán tự động (SePay Webhook Integration)**:
  * Tích hợp Webhook SePay tại endpoint `POST /api/sepay/webhook`.
  * Tự động chuẩn hóa chuỗi và đối soát nội dung chuyển khoản ngân hàng với `order_code` / `payment_content` trong CSDL.
  * Tự động cập nhật `payment_status = 'paid'`, `payment_method = 'bank'`, thời gian `paid_at = NOW()`, ghi nhận chi tiết giao dịch `sepay_transaction` và số tiền `sepay_amount`.
* **Các Dịch vụ & Thư viện bổ trợ**:
  * **Xác thực & Bảo mật**: **JWT (JSON Web Token)** cấp token thời hạn 7 ngày; **Bcryptjs** mã hóa mật khẩu 1 chiều. Middleware bảo mật chia cấp: `requireAuth`, `requireAdmin`, `requireBackOffice` (`admin`, `manager`, `staff`), và `requireRoles`.
  * **Gửi Email tự động (Nodemailer)**: Gửi email chứa token kích thực tài khoản (`Verify Email`) và liên kết đặt lại mật khẩu.
  * **Upload Tệp tin (Multer)**: Lưu trữ ảnh món ăn, voucher, avatar người dùng vào `/backend/uploads/` (giới hạn 5MB, hỗ trợ định dạng JPG, PNG, WebP).
  * **Ghi vết Hoạt động (User Activity Logs)**: Tự động ghi nhật ký thao tác vào bảng `user_activity_logs` mỗi khi có thay đổi vai trò, khóa/mở khóa tài khoản hoặc reset mật khẩu.
  * **Phân nhóm Khách hàng Tự động (User Grouping)**: Thuật toán tính toán tổng chi tiêu và số lượt giao dịch để phân hạng tài khoản: `VIP` (chi tiêu ≥ 15,000,000đ hoặc ≥ 20 lượt), `Regular` (chi tiêu ≥ 3,000,000đ hoặc ≥ 5 lượt), `New` (Khách mới).

---

## 2. SƠ ĐỒ CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```text
restaurant-management/
├── docker-compose.yml          # Cấu hình container MySQL 8.4 & phpMyAdmin
├── docs/                       # Thư mục chứa tài liệu dự án
│   ├── So_do_Cau_truc/         # Chứa tài liệu cấu trúc & luồng hoạt động hệ thống
│   └── Yeu_cau_He_thong/       # Chứa yêu cầu nghiệp vụ và tài liệu thiết kế
├── backend/                    # Máy chủ API (Node.js/Express)
│   ├── server.js               # Khởi chạy Express server, cấu hình CORS, tĩnh tệp uploads & Webhook SePay
│   ├── package.json            # Thư viện Backend (express, mysql2, jsonwebtoken, bcryptjs, multer, v.v)
│   ├── sync_areas_to_spaces.js # Script đồng bộ dữ liệu
│   ├── uploads/                # Lưu trữ file upload
│   │   ├── menu/               # Ảnh món ăn
│   │   ├── deals/              # Ảnh voucher / banner khuyến mãi
│   │   └── spaces/             # Ảnh không gian nhà hàng
│   └── src/
│       ├── config/             # Cấu hình DB Pool (db.js), Firebase Admin, Scripts Migrate
│       ├── middleware/         # Auth Middlewares (requireAuth, requireAdmin, requireBackOffice, requireRoles)
│       ├── routes/             # Định tuyến API
│       │   ├── authRoutes.js       # API Đăng ký, Đăng nhập, Verify Email, Đổi/Quên mật khẩu
│       │   ├── userRoutes.js       # API Cá nhân & Quản lý danh sách người dùng (Admin)
│       │   ├── roleRoutes.js       # API Quản lý vai trò (Roles) & Xem nhật ký hoạt động
│       │   ├── menuRoutes.js       # API Xem thực đơn & danh mục công khai
│       │   ├── adminMenuRoutes.js  # API Thêm/Sửa/Xóa món ăn, danh mục & upload ảnh
│       │   ├── orderRoutes.js      # API Đặt hàng, giỏ hàng, cập nhật đơn & lịch sử đơn
│       │   ├── bookingRoutes.js    # API Đặt bàn trực tuyến & duyệt đặt bàn
│       │   ├── tableRoutes.js      # API Quản lý sơ đồ bàn, tự sinh mã bàn & khu vực
│       │   ├── dealRoutes.js       # API Khuyến mãi, kiểm tra & tiêu dùng mã voucher
│       │   ├── spaceRoutes.js      # API Quản lý không gian nhà hàng
│       │   └── dashboardRoutes.js  # API Dashboard báo cáo thống kê
│       └── utils/              # Helper gửi mail (mail.js), ghi vết (activityLog.js)
└── frontend/                   # Mã nguồn ứng dụng Client (React/Vite)
    ├── index.html              # Trang HTML đầu vào
    ├── vite.config.js          # Cấu hình Vite bundler
    ├── package.json            # Thư viện Frontend (react, react-router-dom, lucide-react)
    └── src/
        ├── App.jsx             # Root component (gọi AppRoutes)
        ├── main.jsx            # Entry point mount React DOM
        ├── assets/             # Hình ảnh (Menu, Deals, About, Booking, Home, v.v)
        ├── components/         # Reusable UI components
        │   ├── Header.jsx, Footer.jsx, ScrollToTop.jsx
        │   ├── DishCard.jsx, RatingStars.jsx, LoginRequiredModal.jsx
        │   └── admin/
        │       ├── AdminHeader.jsx, AdminSidebar.jsx, AdminToast.jsx
        │       ├── StatCard.jsx, AdminProtectedRoute.jsx
        ├── data/               # Dữ liệu tĩnh giả lập (menuCategories.js)
        ├── layouts/
        │   └── AdminLayout.jsx # Khung giao diện Admin (Sidebar nav + Header admin)
        ├── pages/              # Trang giao diện Khách hàng
        │   ├── Home.jsx, AboutPage.jsx, ContactPage.jsx, NotFoundPage.jsx
        │   ├── MenuPage.jsx, DealsPage.jsx, DealDetailPage.jsx
        │   ├── BookingPage.jsx, BookingSuccessPage.jsx, BookingDetailPage.jsx
        │   ├── CartPage.jsx, CheckoutPage.jsx, PaymentQRPage.jsx, OrderSuccessPage.jsx, OrderDetailPage.jsx
        │   ├── ProfilePage.jsx, Login.jsx, Register.jsx, VerifyEmailPage.jsx
        │   └── admin/                # Phân vùng Quản trị (BackOffice Pages)
        │       ├── AdminLoginPage.jsx, AdminDashboardPage.jsx, AdminRevenuePage.jsx
        │       ├── AdminOrdersPage.jsx, AdminBookingsPage.jsx, AdminTablesPage.jsx
        │       ├── AdminMenuPage.jsx, AdminDealsPage.jsx, AdminSpacesPage.jsx
        │       └── AdminUsersPage.jsx, AdminRolesPage.jsx
        ├── routes/
        │   └── AppRoutes.jsx   # Khai báo toàn bộ React Routes (MainLayout & AdminLayout)
        ├── services/           # Đóng gói hàm gọi API (auth, booking, deal, space, table, user, firebase)
        └── utils/
            ├── auth.js         # Lưu/lấy JWT Token, thông tin user trong LocalStorage
            ├── string.js       # Xử lý chuỗi
            └── permissions.js  # Xử lý phân quyền
```

---

## 3. LUỒNG THAO TÁC CỦA KHÁCH HÀNG (CUSTOMER WORKFLOWS)

### 3.1. Luồng Xác thực & Tài khoản Cá nhân
1. **Đăng ký (`Register.jsx`)**:
   * Khách hàng nhập Họ tên, Email, Số điện thoại và Mật khẩu (yêu cầu tối thiểu 8 ký tự).
   * Hệ thống kiểm tra trùng lặp Email/SĐT trong CSDL.
   * Tạo tài khoản với `status = 'active'`, `email_verified = 0`.
   * Gửi email xác thực tự động qua **Nodemailer** chứa link/token xác minh.
2. **Kích hoạt Email (`VerifyEmailPage.jsx`)**:
   * Khách nhấn vào liên kết trong email -> Chuyển hướng về `/verify-email?token=...`.
   * Backend xác thực token -> Cập nhật `email_verified = 1`.
3. **Đăng nhập (`Login.jsx`)**:
   * Nhập Email/SĐT và Mật khẩu.
   * Backend đối soát mã hóa `bcrypt.compare`. Nếu tài khoản bị khóa (`status = 'locked'`), trả về lỗi 403 `ACCOUNT_LOCKED`.
   * Đăng nhập thành công -> Trả về **JWT Token** (lưu tại LocalStorage) chứa Payload `{ id, role }`.
4. **Hồ sơ Cá nhân (`ProfilePage.jsx`)**:
   * Cho phép xem/chỉnh sửa Họ tên, SĐT, Địa chỉ, Avatar.
   * Hiển thị phân nhóm tài khoản hiện tại (VIP / Regular / Khách mới).
   * Xem tab **Lịch sử Đơn hàng** và tab **Lịch sử Đặt bàn**.

### 3.2. Luồng Khám phá Thực đơn & Ưu đãi
1. **Trang Thực đơn (`MenuPage.jsx`)**:
   * Gọi API `GET /api/menu-items` để lấy danh sách món ăn & danh mục.
   * Lọc món theo từng danh mục (Khai vị, Món chính, Đồ uống, Tráng miệng...), tìm kiếm theo tên món.
   * Xem trạng thái món ăn: `Còn hàng` hoặc `Hết hàng`.
2. **Trang Khuyến mãi (`DealsPage.jsx` & `DealDetailPage.jsx`)**:
   * Xem danh sách các chương trình khuyến mãi/mã giảm giá còn hiệu lực.
   * Xem chi tiết điều kiện áp dụng: Giảm theo phần trăm (%) hoặc giảm số tiền cố định, giá trị đơn hàng tối thiểu, hình thức áp dụng (Tại chỗ, Giao hàng, Đến lấy).

### 3.3. Luồng Đặt món Trực tuyến & Thanh toán Tự động SePay QR (Online Order & Checkout)
1. **Quản lý Giỏ hàng (`CartPage.jsx`)**:
   * Chọn món ăn từ thực đơn -> Thêm vào giỏ hàng.
   * Tăng/giảm số lượng, thêm ghi chú riêng cho từng món (ví dụ: "Ít cay", "Không hành").
   * Tự động tính toán Tổng tạm tính (`subtotal`).
2. **Tiến hành Đặt hàng (`CheckoutPage.jsx`)**:
   * **Hình thức phục vụ (`serviceType`)**:
     * `dinein`: Ăn tại bàn (nhập mã bàn `tableCode`).
     * `delivery`: Giao hàng tận nơi (nhập địa chỉ giao hàng, phí vận chuyển).
     * `pickup`: Khách tự đến nhà hàng lấy.
   * **Thông tin người nhận**: Họ tên, Số điện thoại, Email, Ghi chú chung.
   * **Áp dụng Mã giảm giá**: Khách nhập mã Voucher -> Hệ thống gọi API kiểm tra điều kiện (Hạn sử dụng, giới hạn lượt dùng, giá trị đơn tối thiểu) -> Tự động trừ số tiền giảm (`couponDiscountTotal`).
   * **Chọn Phương thức Thanh toán (`paymentMethod`)**:
     * `cash`: Tiền mặt -> Đơn tạo với `payment_status = 'unpaid'`.
     * `bank`: Chuyển khoản Ngân hàng qua VietQR/SePay -> Đơn tạo với `payment_status = 'pending'`.
3. **Thanh toán tự động bằng SePay VietQR (`PaymentQRPage.jsx`)**:
   * Sau khi chọn `bank`, hệ thống sinh ra một **Mã đơn hàng (`order_code`)** độc nhất (ví dụ: `DH1719998822`).
   * Màn hình hiển thị mã QR chứa thông tin chuyển khoản ngân hàng: **Số tài khoản, Ngân hàng, Số tiền cần chuyển, và Nội dung chuyển khoản** (chứa mã đơn hàng).
   * **Luồng Webhook SePay Tự động (Real-time Payment Checking)**:
     * Khách hàng dùng App Ngân hàng quét QR và thực hiện chuyển khoản.
     * Cổng thanh toán SePay nhận biến động số dư và bắn request `POST /api/sepay/webhook` sang Backend.
     * Backend trích xuất nội dung chuyển khoản, lọc chuỗi ký tự chuẩn hóa và so khớp với đơn hàng chưa thanh toán (`WHERE payment_status != 'paid'`).
     * Khi tìm thấy đơn phù hợp: Cập nhật `payment_status = 'paid'`, `payment_method = 'bank'`, `status = 'pending'`, ghi lại thông tin giao dịch ngân hàng.
     * Trang Frontend `PaymentQRPage.jsx` tự động đối soát thành công và chuyển hướng người dùng sang trang **Xác nhận Đơn hàng Thành công** (`OrderSuccessPage.jsx`).

### 3.4. Luồng Đặt bàn Trực tuyến (Table Reservation & Pre-order)
1. Khách hàng vào trang **Đặt bàn** (`BookingPage.jsx`).
2. Nhập thông tin: Ngày đặt (`date`), Giờ đặt (`time`), Số lượng khách (`guests`).
3. **Chọn Khu vực & Bàn ăn**:
   * Lựa chọn khu vực ưa thích (Tầng 1, Tầng 2, Phòng VIP, Sân vườn...).
   * Khách có thể chỉ định chọn trước Bàn cụ thể hoặc để nhà hàng tự xếp bàn.
   * Backend kiểm tra ngay lập tức:
     * **Sức chứa bàn (`validateTableCapacity`)**: Đảm bảo số lượng khách không vượt quá số ghế của bàn.
     * **Trùng lịch bàn (`hasTableConflict`)**: Đảm bảo bàn chưa bị người khác đặt trùng ngày và khung giờ đó (trạng thái `pending` hoặc `confirmed`).
4. **Đặt trước món ăn (Pre-order Menu Items)**: Khách có thể chọn trước danh sách món ăn đi kèm trong buổi đặt bàn để nhà hàng chuẩn bị sẵn.
5. Gửi yêu cầu đặt bàn -> Hệ thống cấp mã đặt bàn **Booking Code** (ví dụ: `BK1719995544`).
6. Khách theo dõi phiếu đặt bàn tại `ProfilePage.jsx` / `BookingDetailPage.jsx`: Trạng thái từ `pending` (Chờ duyệt) -> `confirmed` (Đã duyệt & xếp bàn).

---

## 4. LUỒNG THAO TÁC CỦA QUẢN TRỊ VIÊN & NHÂN VIÊN (ADMIN & BACKOFFICE WORKFLOWS)

### 4.1. Đăng nhập & Kiểm soát Quyền truy cập (BackOffice Auth Guard)
* Quản trị viên / Nhân viên truy cập `/admin/login`.
* Đăng nhập tài khoản. Middleware `AdminProtectedRoute.jsx` kiểm tra xem tài khoản có thuộc các vai trò được phép (`admin`, `manager`, `staff`) hay không.
* Nếu tài khoản là `user` (Khách hàng), hệ thống sẽ chặn và chuyển hướng về trang chủ `/home`.

### 4.2. Trang Tổng quan & Chỉ số Kinh doanh (`AdminDashboardPage.jsx`)
Hiển thị toàn bộ các chỉ số điều hành nhà hàng:
* **Tổng doanh thu**: Kết hợp doanh thu từ đơn hàng trực tuyến và doanh thu từ các lượt đặt bàn.
* **Thống kê đơn hàng theo trạng thái**: Số đơn Chờ xử lý (`pending`), Đang chuẩn bị (`preparing`), Đang giao (`delivering`), Hoàn thành (`completed`), Đã hủy (`cancelled`).
* **Tổng số khách đặt bàn**: Thống kê số lượng lượt khách đặt bàn trong ngày/tháng.
* **Danh sách giao dịch mới nhất**: Bảng cập nhật các đơn hàng và lượt đặt bàn vừa phát sinh.

### 4.3. Quản lý Đơn hàng (`AdminOrdersPage.jsx`)
* **Xem toàn bộ đơn hàng**: Hỗ trợ lọc đơn theo hình thức (`dinein`, `delivery`, `pickup`), trạng thái đơn và trạng thái thanh toán.
* **Cập nhật Tiến độ xử lý đơn**:
  * Tiếp nhận đơn mới (`pending`) -> Đưa vào chế biến (`preparing`).
  * Giao hàng cho đơn ship (`delivering`).
  * Đánh dấu hoàn thành (`completed`) sau khi giao / trả món.
  * Hủy đơn (`cancelled`) kèm lý do hủy.
* **Xác nhận thanh toán thủ công**: Đánh dấu `paid` cho các đơn trả bằng tiền mặt trực tiếp tại quầy.

### 4.4. Quản lý Đặt bàn & Xếp bàn (`AdminBookingsPage.jsx`)
* Tiếp nhận phiếu đặt bàn từ khách hàng trực tuyến hoặc tạo phiếu đặt bàn trực tiếp tại quầy cho khách gọi điện.
* **Xếp bàn cho khách**: Chọn bàn ăn khả dụng trong sơ đồ bàn phù hợp với số lượng khách -> Cập nhật trạng thái phiếu đặt từ `pending` sang `confirmed`.
* Khi khách đến nhà hàng ăn uống xong -> Chuyển trạng thái phiếu đặt sang `completed` để giải phóng bàn ăn về trạng thái `available`.

### 4.5. Quản lý Sơ đồ Bàn ăn (`AdminTablesPage.jsx`)
* **Quản lý Khu vực (Areas)**: Thêm/Sửa khu vực trong nhà hàng (Tầng 1, Tầng 2, Phòng VIP, Sân vườn...).
* **Tự động Sinh Mã bàn**: Hệ thống tự động tạo mã bàn thông minh dựa trên khu vực:
  * Khu vực VIP -> Mã `VIP01`, `VIP02`...
  * Khu vực Tầng 1, Tầng 2 -> Mã `101`, `102`, `201`, `202`...
  * Khu vực Sân vườn -> Mã `SV01`, `SV02`...
* **Quản lý Trạng thái Bàn gian thực**:
  * `available`: Bàn trống, sẵn sàng đón khách.
  * `serving`: Bàn đang có khách ngồi ăn tại chỗ.
  * `maintenance`: Bàn đang bảo trì / hỏng hóc.
  * `disabled`: Bàn tạm ngưng sử dụng.

### 4.6. Quản lý Thực đơn & Danh mục (`AdminMenuPage.jsx`)
* **Danh mục món ăn**: Tạo các nhóm món (Khai vị, Món chính, Đồ uống, Tráng miệng, Lẩu, Nướng...).
* **Quản lý Món ăn**:
  * Thêm món mới: Nhập Tên món, Mã món (code), Giá bán, Mô tả, Chọn danh mục.
  * Upload hình ảnh minh họa qua **Multer** lưu vào `/backend/uploads/menu/`.
  * Cấu hình trạng thái kinh doanh: `active` (Đang bán), `out_of_stock` (Hết hàng), `disabled` (Tạm ngưng bán).

### 4.7. Quản lý Chương trình Khuyến mãi (`AdminDealsPage.jsx`)
* Tạo mới mã Voucher / Ưu đãi.
* **Thiết lập loại giảm giá**:
  * Giảm theo phần trăm (`percentage`): % giảm, số tiền giảm tối đa (`max_discount`).
  * Giảm số tiền cố định (`fixed_amount`): Giảm trực tiếp X đồng.
* **Cấu hình giới hạn & điều kiện**:
  * Giá trị đơn hàng tối thiểu (`min_order_value`).
  * Tổng số lượt sử dụng tối đa (`usage_limit`).
  * Ngày bắt đầu & Ngày kết thúc hiệu lực.
  * Điều kiện hình thức dịch vụ áp dụng (`dinein`, `delivery`, `pickup`).
* **Theo dõi lịch sử sử dụng (`usage_history`)**: Tự động lưu vết số lượt dùng và tổng tiền đã chiết khấu theo từng ngày dưới dạng JSON.

### 4.8. Quản lý Người dùng & Nhật ký Hoạt động (`AdminUsersPage.jsx`)
* Danh sách toàn bộ tài khoản người dùng trong CSDL.
* **Tự động Phân nhóm Khách hàng (Customer Grouping)**:
  * **VIP**: Khách chi tiêu ≥ 15.000.000đ hoặc ≥ 20 giao dịch.
  * **Regular**: Khách chi tiêu ≥ 3.000.000đ hoặc ≥ 5 giao dịch.
  * **New**: Khách hàng mới.
* **Quản trị Tài khoản**:
  * Khóa tài khoản (`status = 'locked'`) khi vi phạm điều khoản.
  * Mở khóa tài khoản (`status = 'active'`).
  * Reset mật khẩu mặc định cho người dùng.

### 4.9. Phân quyền Vai trò & Quyền hạn (`AdminRolesPage.jsx`)
* Quản lý danh sách các tài khoản nội bộ nhà hàng (Admin, Manager, Staff).
* Phân định các nhóm quyền (Role-Based Access Control - RBAC):
  * **Admin**: Quyền quản trị tối cao (Toàn quyền hệ thống).
  * **Manager**: Quyền quản lý kinh doanh (Đơn hàng, Đặt bàn, Thực đơn, Khuyến mãi).
  * **Staff / Cashier**: Quyền thao tác vận hành (Xem đơn hàng, Duyệt bàn, Cập nhật trạng thái phục vụ).
* **Xem Nhật ký Hoạt động (User Activity Logs)**: Hiển thị danh sách các thao tác nhạy cảm do Admin/Manager thực hiện (Ai đã thay đổi quyền của ai, thời gian thực hiện, giá trị cũ và giá trị mới).

### 4.10. Thống kê Doanh thu & Báo cáo (`AdminRevenuePage.jsx`)
* Báo cáo chi tiết doanh thu theo khoảng thời gian tùy chọn.
* Thống kê tỷ trọng doanh thu giữa các phương thức thanh toán (Chuyển khoản SePay QR vs Tiền mặt).

---

## 5. DỮ LIỆU & CÁC THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ENTITIES)

1. **`users`**: `id`, `name`, `full_name`, `email`, `phone`, `password` (hashed), `address`, `avatar`, `role` (`admin`, `manager`, `staff`, `user`), `status` (`active`, `locked`), `email_verified`, `auth_provider`, `created_at`, `updated_at`, `deleted_at`.
2. **`roles` & `permissions`**: Định nghĩa nhóm quyền và ma trận phân quyền hệ thống.
3. **`categories`**: `id`, `code`, `name`, `description`, `status`, `created_at`.
4. **`menu_items`**: `id`, `code`, `category_id`, `name`, `price`, `description`, `images` (JSON array paths), `status` (`active`, `out_of_stock`, `disabled`), `created_at`.
5. **`areas`**: `id`, `code`, `name`, `description`, `created_at`.
6. **`restaurant_tables`**: `id`, `table_code`, `area_id`, `seats`, `status` (`available`, `serving`, `maintenance`, `disabled`), `deleted_at`.
7. **`bookings`**: `id`, `booking_code`, `user_id`, `customer_name`, `phone`, `email`, `booking_date`, `booking_time`, `guests`, `selected_area`, `selected_table`, `note`, `cart_items` (JSON), `subtotal`, `total`, `status` (`pending`, `confirmed`, `completed`, `cancelled`), `created_at`.
8. **`orders`**: `id`, `order_code`, `customer_name`, `phone`, `email`, `service_type` (`dinein`, `delivery`, `pickup`), `table_code`, `guests`, `address`, `receiver`, `payment_method` (`cash`, `bank`), `payment_status` (`unpaid`, `pending`, `paid`), `status` (`pending`, `preparing`, `delivering`, `completed`, `cancelled`), `subtotal`, `shipping_fee`, `discount_total`, `coupon_discount_total`, `total`, `applied_coupon` (JSON), `payment_content`, `sepay_transaction` (JSON), `sepay_amount`, `paid_at`, `raw_data` (JSON), `created_at`, `updated_at`.
9. **`order_items`**: `id`, `order_id`, `menu_item_code`, `name`, `image`, `price`, `qty`, `note`, `raw_data` (JSON).
10. **`deals`**: `id`, `code`, `title`, `description`, `discount_type` (`percentage`, `fixed_amount`), `discount_value`, `max_discount`, `min_order_value`, `usage_limit`, `used_count`, `service_conditions` (JSON), `usage_history` (JSON), `start_date`, `end_date`, `status` (`active`, `expired`, `disabled`), `created_at`.
11. **`user_activity_logs`**: `id`, `target_user_id`, `actor_user_id`, `action`, `old_value`, `new_value`, `message`, `created_at`.

---

## 6. HƯỚNG DẪN KHỞI CHẠY VẬN HÀNH DỰ ÁN (OPERATIONAL GUIDE)

### 6.1. Cấu hình Môi trường (.env)
* **Backend (`backend/.env`)**:
  ```env
  PORT=5001
  DB_HOST=127.0.0.1
  DB_PORT=3307
  DB_USER=restaurant_user
  DB_PASSWORD=restaurant_pass
  DB_NAME=restaurant_db
  JWT_SECRET=your_jwt_secret_key_here
  JWT_EXPIRES_IN=7d
  ```

### 6.2. Các Lệnh Khởi chạy
1. **Khởi động Cơ sở dữ liệu Docker (MySQL & phpMyAdmin)**:
   ```bash
   docker-compose up -d
   ```
   * MySQL Database: `localhost:3307`
   * phpMyAdmin Dashboard: `http://localhost:8080`

2. **Khởi động Máy chủ API Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   * Server API: `http://localhost:5001`
   * SePay Webhook Endpoint: `http://localhost:5001/api/sepay/webhook`

3. **Khởi động Giao diện Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   * Ứng dụng Khách hàng: `http://localhost:5173`
   * Trang Quản trị Admin: `http://localhost:5173/admin/login`
