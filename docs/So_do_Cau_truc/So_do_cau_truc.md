# SƠ ĐỒ CẤU TRÚC & LUỒNG XỬ LÝ CHỨC NĂNG HỆ THỐNG
**Dự án: Hệ thống Quản lý Nhà hàng (Restaurant Management System)**

---

## 1. TỔNG QUAN LUỒNG HOẠT ĐỘNG HỆ THỐNG (HIGH-LEVEL SYSTEM FLOW)

Sơ đồ thể hiện sự tương tác giữa Khách hàng, Giao diện Client (React), Máy chủ API (Express.js), Cơ sở dữ liệu (MySQL), Cổng thanh toán (SePay) và Dịch vụ Email (Nodemailer).

```mermaid
graph TD
    subgraph Client ["Frontend (React SPA - Port 5173)"]
        CustomerUI["Giao diện Khách hàng (User Pages)"]
        AdminUI["Giao diện Quản trị (Admin BackOffice)"]
    end

    subgraph Server ["Backend (Express.js API - Port 5001)"]
        AuthMiddleware["Middleware Xác thực JWT & Auth Guard"]
        API_Auth["Auth API (/api/auth)"]
        API_Orders["Orders API (/api/orders)"]
        API_Bookings["Bookings API (/api/bookings)"]
        API_Tables["Tables API (/api/tables)"]
        API_Deals["Deals API (/api/deals)"]
        API_SePay["SePay Webhook (/api/sepay/webhook)"]
    end

    subgraph External ["Dịch vụ Bên ngoài (External Services)"]
        SePayService["Cổng Thanh toán SePay Ngân hàng"]
        MailService["Dịch vụ Mail (Nodemailer / SMTP)"]
    end

    subgraph Database ["Cơ sở Dữ liệu (MySQL 8.4 - Port 3307)"]
        DB[(MySQL Container)]
    end

    CustomerUI -->|Request công khai / JWT Token| AuthMiddleware
    AdminUI -->|Header Authorization: Bearer JWT| AuthMiddleware
    
    AuthMiddleware -->|Chấp nhận| API_Auth
    AuthMiddleware -->|Chấp nhận| API_Orders
    AuthMiddleware -->|Chấp nhận| API_Bookings
    AuthMiddleware -->|Chấp nhận| API_Tables
    AuthMiddleware -->|Chấp nhận| API_Deals

    API_Auth -->|Gửi link xác thực| MailService
    SePayService -->|Bắn Webhook khi có tiền về| API_SePay

    API_Auth --> DB
    API_Orders --> DB
    API_Bookings --> DB
    API_Tables --> DB
    API_Deals --> DB
    API_SePay --> DB
```

---

## 2. LUỒNG XÁC THỰC & KÍCH HOẠT TÀI KHOẢN (AUTHENTICATION FLOW)

### 2.1. Đăng ký & Kích hoạt Email
```mermaid
flowchart TD
    Start([Khách hàng Đăng ký]) --> Input["Nhập Họ tên, Email, SĐT, Mật khẩu"]
    Input --> ValidateFE{"Kiểm tra Client"}
    ValidateFE -- "Không hợp lệ" --> ShowErrFE["Báo lỗi trên giao diện"]
    ValidateFE -- "Hợp lệ" --> SendReq["POST /api/auth/register"]
    
    SendReq --> CheckDB{"DB Check: Email / SĐT tồn tại?"}
    CheckDB -- "Đã tồn tại" --> ErrExist["Trả về lỗi 400 Trùng lặp"]
    CheckDB -- "Chưa tồn tại" --> HashPwd["Bcrypt Hash Mật khẩu"]
    
    HashPwd --> CreateUser["INSERT INTO users (email_verified = 0, status = 'active')"]
    CreateUser --> GenToken["Tạo Token Verify Email"]
    GenToken --> SendEmail["Nodemailer Gửi Email kích hoạt"]
    SendEmail --> ResRegister["Trả về thành công: Chờ xác thực Email"]
    
    SendEmail -.-> KhachOpenEmail["Khách nhấn Link trong Email"]
    KhachOpenEmail --> VerifyPage["Client redirect /verify-email?token=..."]
    VerifyPage --> CallVerify["POST /api/auth/verify-email"]
    CallVerify --> UpdateVerified["UPDATE users SET email_verified = 1"]
    UpdateVerified --> CompleteVerify["Tài khoản được Kích hoạt Thành công"]
```

### 2.2. Đăng nhập & Duy trì Phiên làm việc JWT
```mermaid
flowchart TD
    LoginStart([Đăng nhập]) --> InputLogin["Nhập Email/SĐT + Mật khẩu"]
    InputLogin --> PostLogin["POST /api/auth/login"]
    
    PostLogin --> FindUser{"Tìm User trong DB?"}
    FindUser -- "Không tìm thấy" --> ErrUser["Lỗi 401: Tài khoản không tồn tại"]
    FindUser -- "Tìm thấy" --> CheckStatus{"Trạng thái Tài khoản?"}
    
    CheckStatus -- "status = 'locked'" --> ErrLocked["Lỗi 403: ACCOUNT_LOCKED (Tài khoản bị khóa)"]
    CheckStatus -- "status = 'active'" --> ComparePwd{"Bcrypt Compare Mật khẩu"}
    
    ComparePwd -- "Sai mật khẩu" --> ErrPwd["Lỗi 401: Sai thông tin đăng nhập"]
    ComparePwd -- "Khớp mật khẩu" --> GenJWT["Tạo JWT Token (Expires 7d)"]
    
    GenJWT --> SaveLocal["Frontend lưu Token + User vào LocalStorage"]
    SaveLocal --> DirectHome["Đăng nhập Thành công -> Chuyển sang /home hoặc /admin"]
```

---

## 3. LUỒNG ĐẶT MÓN TRỰC TUYẾN & THANH TOÁN TỰ ĐỘNG SEPAY QR (ONLINE ORDER & SEPAY)

Sequence Diagram chi tiết luồng Khách chọn món, áp mã giảm giá, chuyển khoản quét QR VietQR và SePay bắn Webhook đối soát tự động.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant FE as React Client (Cart / Checkout)
    participant BE as Express API Server
    participant DB as MySQL Database
    participant SePay as SePay Gateway (Webhook)

    Customer->>FE: 1. Thêm món vào Giỏ hàng & chọn Checkout
    Customer->>FE: 2. Nhập người nhận, dịch vụ (dinein/delivery/pickup), mã Voucher
    FE->>BE: 3. POST /api/orders (Thông tin đơn, phương thức paymentMethod='bank')
    
    BE->>BE: 4. Kiểm tra Voucher (Hạn dùng, giới hạn lượt dùng)
    BE->>DB: 5. UPDATE deals (Tăng used_count, ghi usage_history)
    BE->>DB: 6. INSERT INTO orders (order_code, payment_status='pending', status='pending')
    BE->>DB: 7. INSERT INTO order_items (chi tiết món ăn)
    BE-->>FE: 8. Trả về Order (order_code="DH1719998822")
    
    FE->>FE: 9. Chuyển hướng sang PaymentQRPage.jsx (Hiển thị Mã QR VietQR SePay)
    
    Customer->>Customer: 10. Mở App Ngân hàng quét QR & Chuyển tiền (Nội dung: DH1719998822)
    
    Note over Customer,SePay: Ngân hàng báo biến động số dư cho SePay
    
    SePay->>BE: 11. POST /api/sepay/webhook (Payload: transferAmount, content)
    BE->>BE: 12. Làm sạch chuỗi content & trích xuất mã đơn DH1719998822
    BE->>DB: 13. SELECT order WHERE order_code='DH1719998822' AND payment_status!='paid'
    
    alt Tìm thấy đơn hàng phù hợp
        BE->>DB: 14. UPDATE orders SET payment_status='paid', payment_method='bank', paid_at=NOW(), sepay_amount=...
        BE-->>SePay: 15. Res 200 { success: true }
    else Không tìm thấy đơn
        BE-->>SePay: 15. Res 200 { success: true, message: "Không tìm thấy đơn" }
    end
    
    FE->>BE: 16. Polling / Check trạng thái đơn /me/:id
    BE-->>FE: 17. Trả về Order status paymentStatus='paid'
    FE->>FE: 18. Tự động chuyển hướng sang OrderSuccessPage.jsx
```

---

## 4. LUỒNG ĐẶT BÀN TRỰC TUYẾN & KIỂM TRA BÀN TRỐNG (TABLE RESERVATION)

Sơ đồ thể hiện thuật toán kiểm tra sức chứa bàn (`validateTableCapacity`) và chống trùng lịch đặt (`hasTableConflict`).

```mermaid
flowchart TD
    StartBk([Khách Đặt Bàn]) --> FormBk["Nhập Ngày, Giờ, Số khách, Khu vực/Bàn, Ghi chú"]
    FormBk --> CheckOption{"Có chọn Bàn cụ thể không?"}
    
    CheckOption -- "Không chọn bàn" --> CreatePendingBk["Tạo Booking (selected_table = null, status = 'pending')"]
    CheckOption -- "Có chọn Bàn cụ thể" --> ValCap{"Kiểm tra Sức chứa Bàn"}
    
    ValCap -- "guests > table.seats hoặc Bàn bận/bảo trì" --> ErrCap["Trả về Lỗi 400: Bàn không đủ chỗ hoặc đang hỏng"]
    ValCap -- "Hợp lệ" --> CheckConflict{"Kiểm tra Trùng lịch đặt (hasTableConflict)"}
    
    CheckConflict -- "Trùng ngày & giờ (status pending/confirmed)" --> ErrConflict["Trả về Lỗi 409: Bàn đã có lịch đặt trước"]
    CheckConflict -- "Không trùng" --> CreateOkBk["Tạo Booking (selected_table = '101', status = 'pending')"]
    
    CreatePendingBk --> PreOrderCheck{"Có Đặt trước món ăn không?"}
    CreateOkBk --> PreOrderCheck
    
    PreOrderCheck -- "Có" --> SaveCartBk["Lưu cart_items + tính tổng tiền subtotal/total"]
    PreOrderCheck -- "Không" --> SaveNoCartBk["cart_items = []"]
    
    SaveCartBk --> InsertBkDB["INSERT INTO bookings (booking_code, status = 'pending')"]
    SaveNoCartBk --> InsertBkDB
    
    InsertBkDB --> BkSuccess["Hiển thị BookingSuccessPage.jsx (Mã Booking Code)"]
```

---

## 5. LUỒNG BẢO VỆ & ĐIỀU HƯỚNG ADMIN (ADMIN AUTH GUARD)

```mermaid
flowchart TD
    AdminAccess([Truy cập đường dẫn /admin/*]) --> CheckLogin{"Đã Đăng nhập? (checkLogin)"}
    
    CheckLogin -- "Chưa đăng nhập" --> GoLogin["Redirect sang /admin/login"]
    CheckLogin -- "Đã đăng nhập" --> GetUserRole["Lấy currentUser.role từ Token"]
    
    GetUserRole --> CheckRole{"Role có thuộc: admin, manager, staff?"}
    CheckRole -- "Không (Role là user/khách hàng)" --> KickHome["Redirect về Trang chủ Khách /home"]
    CheckRole -- "Có (admin / manager / staff)" --> AllowAdmin["Cho phép render AdminLayout + Admin Pages"]
```

---

## 6. LUỒNG QUẢN LÝ VÒNG ĐỜI ĐƠN HÀNG TRONG ADMIN (ORDER LIFECYCLE STATE DIAGRAM)

Trạng thái xử lý Đơn hàng (`status`) và Trạng thái Thanh toán (`payment_status`) chuyển đổi qua từng bước vận hành nhà hàng.

```mermaid
stateDiagram-v2
    [*] --> Pending : Đặt hàng mới (COD / Chuyển khoản)
    
    state Pending {
        [*] --> Unpaid_COD : Phương thức Cash
        [*] --> Pending_Bank : Phương thức Bank (Quét QR SePay)
        Pending_Bank --> Paid_SePay : Webhook SePay nhận tiền thành công
    }

    Pending --> Preparing : Admin / Thu ngân bấm "Duyệt chế biến"
    
    state Preparing {
        Unpaid_COD --> Paid_Manual : Admin thu tiền mặt trực tiếp tại quầy
    }
    
    Preparing --> Delivering : Bếp chế biến xong -> Giao đơn (với serviceType='delivery')
    Preparing --> Completed : Phục vụ xong món tại chỗ (serviceType='dinein')
    Delivering --> Completed : Shipper giao hàng thành công
    
    Pending --> Cancelled : Khách hủy đơn / Admin hủy đơn (Kèm lý do)
    Preparing --> Cancelled : Hủy đơn khi không đủ nguyên liệu
    
    Completed --> [*]
    Cancelled --> [*]
```

---

## 7. LUỒNG DUYỆT ĐẶT BÀN & XẾP BÀN TRONG ADMIN (ADMIN BOOKING & SEAT ASSIGNMENT)

```mermaid
flowchart TD
    RecvBk([Phiếu đặt bàn mới - Status 'pending']) --> AdminView["Admin xem danh sách AdminBookingsPage.jsx"]
    AdminView --> CheckTableState["Kiểm tra sơ đồ bàn trống tại thời điểm khách đặt"]
    
    CheckTableState --> ActionDecide{"Hành động của Admin"}
    
    ActionDecide -- "Hủy phiếu đặt" --> CancelBk["UPDATE bookings SET status = 'cancelled'"]
    ActionDecide -- "Duyệt & Xếp bàn" --> SelectTable["Chọn bàn trống phù hợp (ví dụ: Bàn 102)"]
    
    SelectTable --> UpdateBk["UPDATE bookings SET selected_table = '102', status = 'confirmed'"]
    UpdateBk --> NotifyUser["Khách xem trạng thái trên Profile đổi sang 'Đã xác nhận'"]
    
    NotifyUser -.-> KhachDen["Khách đến nhà hàng ăn uống"]
    KhachDen --> TableOccupied["Sơ đồ Bàn chuyển sang 'serving' (Đang phục vụ)"]
    TableOccupied --> FinishMeal["Khách ăn xong & Thanh toán"]
    
    FinishMeal --> CompleteBk["UPDATE bookings SET status = 'completed'"]
    CompleteBk --> TableFree["Sơ đồ Bàn trở về 'available' (Trống)"]
```

---

## 8. LUỒNG QUẢN LÝ BÀN & TỰ ĐỘNG SINH MÃ BÀN (TABLE & SMART CODE GENERATION)

Quy tắc tự động sinh mã bàn (`getAreaCodeConfig`) dựa trên tên Khu vực:

```mermaid
flowchart TD
    AddTable([Thêm Bàn mới]) --> SelectArea["Chọn Khu vực (Area)"]
    SelectArea --> ParseAreaName["Tự động chuẩn hóa Tên Khu vực (removeVietnameseTones)"]
    
    ParseAreaName --> AreaType{"Kiểm tra Tên Khu vực"}
    
    AreaType -- "Tên chứa 'VIP'" --> PrefixVIP["Prefix = 'VIP' -> Mã bàn: VIP01, VIP02..."]
    AreaType -- "Tên chứa 'Tầng X'" --> PrefixFloor["Prefix = 'X' -> Mã bàn: X01, X02 (ví dụ: 101, 201)..."]
    AreaType -- "Tên chứa 'Tầng Trệt'" --> PrefixTret["Prefix = '1' -> Mã bàn: 101, 102..."]
    AreaType -- "Tên chứa 'Sân vườn'" --> PrefixSV["Prefix = 'SV' -> Mã bàn: SV01, SV02..."]
    AreaType -- "Khu vực khác" --> PrefixGen["Prefix = Ký tự đầu -> Mã bàn: TB01, TB02..."]
    
    PrefixVIP --> SetSeatCount["Nhập số ghế tối đa (seats)"]
    PrefixFloor --> SetSeatCount
    PrefixTret --> SetSeatCount
    PrefixSV --> SetSeatCount
    PrefixGen --> SetSeatCount
    
    SetSeatCount --> SaveTable["INSERT INTO restaurant_tables (status = 'available')"]
```

---

## 9. LUỒNG KIỂM TRA & TIÊU DÙNG MÃ GIẢM GIÁ / VOUCHER (DEALS / VOUCHER FLOW)

```mermaid
flowchart TD
    InputCoupon([Khách nhập mã Voucher]) --> CallCheckCoupon["Kiểm tra Voucher (consumeDealUsage)"]
    CallCheckCoupon --> FindDeal{"Tìm mã trong Bảng deals?"}
    
    FindDeal -- "Không thấy" --> Err404["Lỗi 404: Mã ưu đãi không tồn tại"]
    FindDeal -- "Tìm thấy" --> CheckActive{"status === 'active'?"}
    
    CheckActive -- "Không" --> ErrExpired["Lỗi 400: Mã hết hiệu lực"]
    CheckActive -- "Có" --> CheckLimit{"Lượt dùng used_count < usage_limit?"}
    
    CheckLimit -- "Đã hết lượt" --> ErrLimit["Lỗi 409: Mã đã hết lượt sử dụng"]
    CheckLimit -- "Còn lượt" --> CheckMinOrder{"subtotal >= min_order_value?"}
    
    CheckMinOrder -- "Chưa đủ tiền" --> ErrMin["Lỗi 400: Đơn chưa đạt giá trị tối thiểu"]
    CheckMinOrder -- "Đạt điều kiện" --> CalcDiscount["Tính tiền giảm (Percentage hoặc Fixed Amount)"]
    
    CalcDiscount --> UpdateUsage["Tăng used_count + 1, Cập nhật JSON usage_history"]
    UpdateUsage --> ApplySuccess["Trả về Số tiền giảm -> Trừ trực tiếp vào Tổng đơn"]
```

---

## 10. LUỒNG PHÂN NHÓM KHÁCH HÀNG TỰ ĐỘNG & NHẬT KÝ HOẠT ĐỘNG (USER GROUPING & LOGGING)

### 10.1. Thuật toán Phân nhóm Khách hàng (`getUserGroup`)
```mermaid
flowchart TD
    FetchUser([Lấy danh sách Người dùng]) --> CalcSpent["Tính tổng chi tiêu (totalSpent = orderTotal + bookingTotal)"]
    CalcSpent --> CalcTx["Tính tổng giao dịch (totalTransactions = orderCount + bookingCount)"]
    
    CalcTx --> CheckVIP{"totalSpent >= 15.000.000đ OR totalTransactions >= 20?"}
    CheckVIP -- "Đúng" --> GroupVIP["Gán nhóm: VIP"]
    CheckVIP -- "Sai" --> CheckRegular{"totalSpent >= 3.000.000đ OR totalTransactions >= 5?"}
    
    CheckRegular -- "Đúng" --> GroupRegular["Gán nhóm: Regular (Thân thiết)"]
    CheckRegular -- "Sai" --> GroupNew["Gán nhóm: New (Khách mới)"]
    
    GroupVIP --> DisplayUser["Hiển thị Badge Phân nhóm trên Admin Users Page & Profile Page"]
    GroupRegular --> DisplayUser
    GroupNew --> DisplayUser
```

### 10.2. Ghi nhật ký Hoạt động Quản trị (`user_activity_logs`)
```mermaid
flowchart TD
    AdminAction([Admin thực hiện thao tác nhạy cảm]) --> ActionType{"Loại Thao tác"}
    
    ActionType -- "Thay đổi Vai trò User" --> LogRole["Log: action = 'update_role', old_value, new_value"]
    ActionType -- "Khóa / Mở khóa Tài khoản" --> LogStatus["Log: action = 'update_status', old_value, new_value"]
    ActionType -- "Reset Mật khẩu User" --> LogPwd["Log: action = 'reset_password'"]
    
    LogRole --> InsertActivityLog["INSERT INTO user_activity_logs (target_user_id, actor_user_id, action, message)"]
    LogStatus --> InsertActivityLog
    LogPwd --> InsertActivityLog
    
    InsertActivityLog --> AdminRolesPage["Hiển thị dòng thời gian Hoạt động trên AdminRolesPage.jsx"]
```
