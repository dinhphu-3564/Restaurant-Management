# SƠ ĐỒ LUỒNG HOẠT ĐỘNG CÁC CHỨC NĂNG DÀNH CHO KHÁCH HÀNG
**Hệ thống Quản lý Nhà hàng (Customer Features Workflow Diagrams)**

---

## 1. TỔNG QUAN CÁC CHỨC NĂNG CỦA KHÁCH HÀNG (CUSTOMER MAP)

```mermaid
mindmap
  root((KHÁCH HÀNG))
    Tài khoản & Xác thực
      Đăng ký tài khoản
      Kích hoạt Email Nodemailer
      Đăng nhập JWT
      Quản lý Hồ sơ Cá nhân
    Khám phá Nhà hàng
      Xem Trang chủ & Giới thiệu
      Tìm kiếm & Lọc Thực đơn
      Xem Mã Khuyến mãi / Voucher
    Đặt món & Thanh toán
      Quản lý Giỏ hàng
      Đặt hàng (Tại chỗ / Delivery / Pickup)
      Áp dụng Mã giảm giá
      Thanh toán tự động SePay VietQR
      Theo dõi Lịch sử Đơn hàng
    Đặt bàn Trực tuyến
      Đặt bàn theo ngày/giờ/số khách
      Chọn Khu vực / Bàn cụ thể
      Đặt trước Món ăn (Pre-order)
      Theo dõi Lịch sử Đặt bàn
```

---

## 2. CHI TIẾT SƠ ĐỒ TỪNG LUỒNG CHỨC NĂNG KHÁCH HÀNG

### 🔑 Chức năng 1: Đăng ký Tài khoản & Xác thực Email
Dưới đây là sơ đồ luồng từng bước từ khi khách điền thông tin đăng ký cho tới khi nhận email kích hoạt.

```mermaid
flowchart TD
    A["👤 Khách hàng mở form Đăng ký (Register.jsx)"] --> B["Nhập: Họ tên, Email, Số điện thoại, Mật khẩu"]
    B --> C{"Client Validate?"}
    
    C -- "Mật khẩu < 8 ký tự / Thiếu ô" --> D["❌ Báo lỗi trực tiếp trên giao diện"]
    C -- "Hợp lệ" --> E["🚀 Gửi POST /api/auth/register"]
    
    E --> F{"Backend Check: Email/SĐT bị trùng?"}
    F -- "Đã tồn tại" --> G["❌ Trả về lỗi 400: Email/SĐT đã được đăng ký"]
    F -- "Chưa tồn tại" --> H["🔒 Bcrypt Mã hóa Mật khẩu"]
    
    H --> I["💾 Lưu User mới vào CSDL (email_verified = 0)"]
    I --> J["✉️ Nodemailer tự động gửi Email chứa Token kích hoạt"]
    J --> K["✅ Màn hình báo: Đăng ký thành công, vui lòng kiểm tra Email"]
    
    J -.-> L["📩 Khách mở Hòm thư Email & bấm vào Link Xác minh"]
    L --> M["🌐 Chuyển hướng tới Trang VerifyEmailPage.jsx"]
    M --> N["🚀 Backend kiểm tra Token -> Update email_verified = 1"]
    N --> O["🎉 Xác thực Email thành công! Khách có thể Đăng nhập"]
```

---

### 🔓 Chức năng 2: Đăng nhập & Duy trì Phiên làm việc (Session)
Luồng xử lý khi khách đăng nhập và cơ chế lưu trữ JWT Token để duy trì trạng thái đăng nhập trên ứng dụng.

```mermaid
flowchart TD
    A["👤 Khách hàng mở trang Đăng nhập (Login.jsx)"] --> B["Nhập Email/SĐT + Mật khẩu"]
    B --> C["🚀 Gửi POST /api/auth/login"]
    
    C --> D{"Tìm thấy Email/SĐT trong CSDL?"}
    D -- "Không thấy" --> E["❌ Lỗi 401: Tài khoản không tồn tại"]
    D -- "Thấy tài khoản" --> F{"Kiểm tra Trạng thái Account?"}
    
    F -- "status = 'locked'" --> G["⛔ Lỗi 403: Tài khoản của bạn đã bị KHÓA!"]
    F -- "status = 'active'" --> H{"Bcrypt Đối soát Mật khẩu"}
    
    H -- "Mật khẩu sai" --> I["❌ Lỗi 401: Mật khẩu không chính xác"]
    H -- "Mật khẩu đúng" --> J["🔑 Backend cấp JWT Token (Thời hạn 7 ngày)"]
    
    J --> K["💾 Save Token + Thông tin Khách vào LocalStorage"]
    K --> L["🎉 Đăng nhập thành công -> Hiển thị Avatar & Tên khách trên Header"]
```

---

### 🍕 Chức năng 3: Tìm kiếm & Khám phá Thực đơn (Menu Search & Filter)
Luồng hỗ trợ khách hàng tìm kiếm món ăn theo tên và lọc theo từng danh mục món.

```mermaid
flowchart TD
    A["👤 Khách vào Trang Thực đơn (MenuPage.jsx)"] --> B["🚀 Gọi API GET /api/menu-items"]
    B --> C["📦 Backend trả về Danh sách Món ăn & Danh mục"]
    C --> D["🖥️ Hiển thị Tất cả Món ăn lên Màn hình"]
    
    D --> E{"Khách thực hiện Thao tác"}
    
    E -- "Click chọn Danh mục (Khai vị, Món chính...)" --> F["🔍 Frontend lọc Món ăn thuộc Category ID đã chọn"]
    E -- "Nhập từ khóa vào Ô Tìm kiếm" --> G["🔎 Frontend lọc Món ăn theo Tên món tương ứng"]
    
    F --> H["📋 Hiển thị Kết quả đã Lọc"]
    G --> H
    
    H --> I["👁️ Khách click xem Chi tiết Món ăn (Giá, Mô tả, Ảnh, Trạng thái Còn/Hết món)"]
    I --> J["🛒 Khách bấm nút 'Thêm vào Giỏ hàng'"]
```

---

### 💳 Chức năng 4: Xem Khuyến mãi & Áp dụng Mã giảm giá (Deals & Vouchers)
Luồng khách hàng khám phá mã ưu đãi và áp dụng khi thanh toán đơn hàng.

```mermaid
flowchart TD
    A["👤 Khách vào Trang Khuyến mãi (DealsPage.jsx)"] --> B["🚀 GET /api/deals lấy danh sách Voucher còn hiệu lực"]
    B --> C["📜 Khách chọn 1 Voucher -> Xem Chi tiết DealDetailPage.jsx"]
    C --> D["📌 Lưu lại Mã giảm giá (Ví dụ: BANME20)"]
    
    D -.-> E["🛒 Khách sang Trang CheckoutPage.jsx -> Nhập mã BANME20"]
    E --> F["🚀 Gọi API kiểm tra điều kiện Voucher"]
    
    F --> G{"Backend Kiểm tra Điều kiện Mã"}
    
    G -- "Hết hạn hoặc Hết lượt dùng (used_count >= limit)" --> H["❌ Báo lỗi: Mã đã hết hạn / hết lượt"]
    G -- "Đơn chưa đủ Giá trị Tối thiểu (subtotal < min_order_value)" --> I["❌ Báo lỗi: Đơn chưa đạt giá trị tối thiểu"]
    G -- "Đạt toàn bộ điều kiện" --> J["✅ Hợp lệ! Tính số tiền giảm (couponDiscountTotal)"]
    
    J --> K["💰 Tự động Trừ Tiền giảm vào Tổng giá trị Đơn hàng"]
```

---

### 🛒 Chức năng 5: Đặt món Trực tuyến & Thanh toán Tự động SePay VietQR
Đây là **luồng quan trọng nhất** tích hợp Cổng thanh toán SePay tự động khớp giao dịch chuyển khoản ngân hàng qua Webhook real-time.

```mermaid
sequenceDiagram
    autonumber
    actor Khach as 👤 Khách hàng
    participant FE as 🖥️ React FE (Cart / Checkout)
    participant BE as ⚙️ Express API Server
    participant DB as 🗄️ MySQL Database
    participant SePay as 🏦 SePay Gateway (Ngân hàng)

    Khach->>FE: 1. Thêm món vào Giỏ hàng & Bấm "Thanh toán"
    Khach->>FE: 2. Nhập thông tin nhận hàng & Chọn Thanh toán Chuyển khoản (bank)
    FE->>BE: 3. Gửi yêu cầu POST /api/orders
    
    BE->>DB: 4. Lưu Đơn hàng mới (status='pending', payment_status='pending', order_code='DH1719998822')
    BE-->>FE: 5. Trả về thông tin đơn hàng vừa tạo
    
    FE->>FE: 6. Chuyển sang Màn hình PaymentQRPage.jsx (Hiển thị Mã VietQR SePay)
    
    Note over Khach,FE: Màn hình hiển thị mã QR VietQR chứa chính xác:<br/>Ngân hàng, Số TK, Số tiền và Nội dung: DH1719998822
    
    Khach->>SePay: 7. Mở App Ngân hàng quét mã QR & Thực hiện Chuyển tiền
    
    Note over SePay,BE: Tiền về TK Ngân hàng -> SePay nhận biến động số dư
    
    SePay->>BE: 8. SePay tự động bắn Webhook POST /api/sepay/webhook
    BE->>BE: 9. Tự động chuẩn hóa nội dung CK & Trích xuất mã đơn DH1719998822
    BE->>DB: 10. Tìm đơn DH1719998822 & Cập nhật payment_status = 'paid', paid_at = NOW()
    BE-->>SePay: 11. Phản hồi HTTP 200 OK
    
    FE->>BE: 12. FE gửi request polling kiểm tra trạng thái đơn hàng
    BE-->>FE: 13. Phản hồi đơn hàng đã được ĐÃ THANH TOÁN (paid)
    FE->>FE: 14. 🎉 Tự động chuyển tới trang Đặt hàng Thành công (OrderSuccessPage.jsx)!
```

---

### 📅 Chức năng 6: Đặt bàn Trực tuyến & Đặt trước Món ăn (Table Reservation)
Luồng khách hàng chủ động chọn ngày, giờ, số khách, chọn khu vực/bàn ăn và chọn trước món ăn cho buổi tiệc.

```mermaid
flowchart TD
    A["👤 Khách vào Trang Đặt bàn (BookingPage.jsx)"] --> B["Nhập: Ngày đặt, Giờ đặt, Số lượng khách"]
    B --> C["Lựa chọn Khu vực (Tầng 1, Tầng 2, VIP...) hoặc Bàn cụ thể"]
    
    C --> D{"Khách có chỉ định Bàn cụ thể?"}
    
    D -- "Có chọn Bàn (ví dụ: Bàn 101)" --> E{"Backend Kiểm tra Bàn (validateTableCapacity & hasTableConflict)"}
    E -- "Số khách > Sức chứa hoặc Bàn đã bị trùng lịch" --> F["❌ Báo lỗi: Bàn này không đủ chỗ hoặc đã có khách đặt!"]
    E -- "Bàn hợp lệ & Trống" --> G["✅ Khóa bàn 101 cho yêu cầu đặt"]
    
    D -- "Không chọn bàn" --> H["Ghi nhận Khu vực -> Nhà hàng sẽ tự xếp bàn sau"]
    
    G --> I{"Khách có Muốn Đặt trước Món ăn (Pre-order)?"}
    H --> I
    
    I -- "Có chọn món" --> J["Thêm các món ăn vào Danh sách Đặt trước (cartItems)"]
    I -- "Không chọn món" --> K["Để trống danh sách món"]
    
    J --> L["🚀 Gửi POST /api/bookings"]
    K --> L
    
    L --> M["💾 Lưu Phiếu đặt bàn vào CSDL (status = 'pending', cấp mã Booking Code)"]
    M --> N["🎉 Hiển thị Trang BookingSuccessPage.jsx (Mã phiếu đặt bàn)"]
```

---

### 👤 Chức năng 7: Quản lý Hồ sơ Cá nhân & Lịch sử Đơn / Đặt bàn
Luồng khách hàng theo dõi phân hạng tài khoản và lịch sử giao dịch.

```mermaid
flowchart TD
    A["👤 Khách đăng nhập truy cập Trang Hồ sơ (ProfilePage.jsx)"] --> B["🚀 Gọi API GET /api/users/profile"]
    B --> C["📦 Backend tính toán Tổng chi tiêu & Số lượt giao dịch"]
    
    C --> D{"Phân nhóm Khách hàng (User Grouping)"}
    
    D -- "Chi tiêu >= 15Tr hoặc >= 20 đơn/bàn" --> E["👑 Hiển thị Thẻ hạng: KHÁCH HÀNG VIP"]
    D -- "Chi tiêu >= 3Tr hoặc >= 5 đơn/bàn" --> F["⭐ Hiển thị Thẻ hạng: KHÁCH HÀNG THÂN THIẾT"]
    D -- "Khách mới" --> G["🌱 Hiển thị Thẻ hạng: KHÁCH HÀNG MỚI"]
    
    E --> H["Tabs Quản lý Hồ sơ"]
    F --> H
    G --> H
    
    H --> I{"Khách chuyển Tab xem"}
    
    I -- "Tab Lịch sử Đơn hàng" --> J["📋 Hiển thị danh sách Đơn hàng -> Bấm xem OrderDetailPage.jsx"]
    I -- "Tab Lịch sử Đặt bàn" --> K["📅 Hiển thị phiếu Đặt bàn & Trạng thái duyệt -> Xem BookingDetailPage.jsx"]
    I -- "Tab Đổi thông tin" --> L["✏️ Chỉnh sửa Họ tên, SĐT, Địa chỉ, Avatar"]
```

---

## 3. TỔNG KẾT TÍNH NĂNG NỔI BẬT DÀNH CHO KHÁCH HÀNG

| STT | Chức năng Khách hàng | Điểm nổi bật trong xử lý hệ thống |
| :---: | :--- | :--- |
| **1** | Đăng ký & Kích hoạt Email | Tự động gửi Email qua Nodemailer, mã hóa bảo mật Bcrypt. |
| **2** | Đăng nhập & Lưu Session | Bảo mật qua JWT Token 7 ngày, kiểm tra chặn tài khoản locked. |
| **3** | Tìm kiếm & Lọc Thực đơn | Lọc đa tiêu chí theo danh mục và từ khóa thời gian thực. |
| **4** | Áp dụng Voucher Khuyến mãi | Tự động đối soát điều kiện hạn dùng, số lượt dùng và tổng đơn tối thiểu. |
| **5** | Đặt món & Thanh toán VietQR SePay | **Thanh toán tự động 100% qua Webhook SePay**, đối soát mã đơn và cập nhật trạng thái tức thì mà không cần duyệt tay. |
| **6** | Đặt bàn & Đặt trước Món | Kiểm tra tự động sức chứa bàn & chống đặt trùng lịch bàn. |
| **7** | Quản lý Hồ sơ & Lịch sử | Tự động xếp hạng VIP/Regular dựa trên lịch sử tích lũy chi tiêu. |
