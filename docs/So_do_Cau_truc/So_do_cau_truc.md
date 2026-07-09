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

Sequence Diagram thể hiện chi tiết luồng thanh toán đơn hàng online, ghi nhận thanh toán từng phần qua bảng `order_payments` và kích hoạt Socket.io.

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
    
    BE->>BE: 4. Kiểm tra Voucher (Hạn dùng, điều kiện)
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
        BE->>DB: 14. INSERT INTO order_payments (amount, payment_method='bank')
        BE->>DB: 15. SELECT SUM(amount) FROM order_payments WHERE order_id = order.id
        Note over BE,DB: Nếu tổng thanh toán >= tổng trị giá đơn hàng
        BE->>DB: 16. UPDATE orders SET payment_status='paid', paid_at=NOW(), sepay_transaction=...
        BE->>BE: 17. Emit event qua Socket.io ("order_updated")
        BE-->>SePay: 18. Res 200 { success: true }
    else Không tìm thấy đơn
        BE-->>SePay: 18. Res 200 { success: true, message: "Không tìm thấy đơn" }
    end
    
    FE->>BE: 19. Polling / Check trạng thái đơn /me/:id (Hoặc lắng nghe Socket.io)
    BE-->>FE: 20. Trả về Order status paymentStatus='paid'
    FE->>FE: 21. Tự động chuyển hướng sang OrderSuccessPage.jsx
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
    
    CheckConflict -- "Trùng ngày & giờ (status pending/confirmed/serving)" --> ErrConflict["Trả về Lỗi 409: Bàn đã có lịch đặt trước"]
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
    
    GetUserRole --> CheckRole{"Role thuộc BackOffice role?"}
    CheckRole -- "Không (Role là user/khách hàng)" --> KickHome["Redirect về Trang chủ Khách /home"]
    CheckRole -- "Có (admin/manager/staff/cashier/waiter/chef)" --> AllowAdmin["Cho phép render AdminLayout + Admin Pages"]
```

---

## 6. LUỒNG QUẢN LÝ VÒNG ĐỜI ĐƠN HÀNG TRONG ADMIN (ORDER LIFECYCLE STATE DIAGRAM)

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
        Unpaid_COD --> Paid_Manual : Admin ghi nhận thanh toán thủ công (order_payments)
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
    
    NotifyUser -.-> KhachDen["Khách đến nhà hàng nhận bàn"]
    KhachDen --> TableOccupied["Lịch đặt bàn chuyển sang 'serving'<br>Sơ đồ Bàn chuyển sang 'serving' (Đang phục vụ)"]
    TableOccupied --> FinishMeal["Khách ăn xong & Thanh toán tại bàn (Bảng 11)"]
    
    FinishMeal --> CompleteBk["UPDATE bookings SET status = 'completed'"]
    CompleteBk --> TableFree["Sơ đồ Bàn trở về 'available' (Trống)"]
```

---

## 8. LUỒNG QUẢN LÝ BÀN & TỰ ĐỘNG SINH MÃ BÀN (TABLE & SMART CODE GENERATION)

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
    InputCoupon([Khách nhập mã Voucher]) --> CallCheckCoupon["Kiểm tra Voucher"]
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

---

## 11. LUỒNG THANH TOÁN TẠI BÀN (TABLE BILLING & CHECKOUT)

Quy trình quản lý hóa đơn, gọi thêm món, áp coupon và xử lý đối soát SePay tự động cho khách ăn tại chỗ:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách ăn tại bàn
    participant Staff as Nhân viên phục vụ / Thu ngân
    participant FE as Admin Tables Dashboard
    participant BE as Express API Server
    participant SePay as SePay Gateway (Webhook)

    Note over Customer,Staff: Lịch đặt bàn đang ở trạng thái status='serving'
    Customer->>Staff: 1. Yêu cầu gọi thêm món ăn
    Staff->>FE: 2. Nhấp chọn Bàn -> "Gọi thêm món"
    FE->>BE: 3. PATCH /api/bookings/admin/:id/items (Gửi danh sách món ăn gộp mới)
    BE-->>FE: 4. Cập nhật thành công, tính lại subtotal/total của lịch đặt
    
    Customer->>Staff: 5. Yêu cầu thanh toán hóa đơn
    Staff->>FE: 6. Mở bảng thanh toán, nhập mã giảm giá (nếu có)
    FE->>BE: 7. Xác thực mã giảm giá -> Trả về số tiền được khấu trừ
    
    Staff->>FE: 8. Chọn Phương thức Thanh toán (Cash / Bank)
    
    alt Thanh toán Tiền mặt (Cash)
        Staff->>FE: 9. Nhập số tiền nhận của khách (cashReceived)
        Staff->>FE: 10. Click "Xác nhận thanh toán"
        FE->>BE: 11. PATCH /api/bookings/admin/:id/payment (Gửi paymentMethod='cash', paymentStatus='paid')
        BE-->>FE: 12. Cập nhật booking status='completed', giải phóng bàn status='available'
    else Thanh toán Chuyển khoản (Bank via VietQR)
        FE->>FE: 9. Hiển thị mã QR VietQR chứa nội dung "DB{booking_id}"
        Customer->>Customer: 10. Quét QR chuyển khoản qua App Ngân hàng
        Note over Customer,SePay: Hệ thống ngân hàng báo giao dịch thành công sang SePay
        SePay->>BE: 11. POST /api/sepay/webhook (Nội dung chuyển khoản chứa "DB{booking_id}")
        BE->>BE: 12. So khớp "DB{booking_id}" với lịch đặt bàn có status='serving'
        BE->>BE: 13. Cập nhật booking: payment_method='bank', payment_status='paid', paid_at=NOW()
        
        Note over FE,BE: Polling client (mỗi 2.5 giây) phát hiện payment_status chuyển thành 'paid'
        BE-->>FE: 14. Trả về booking thông tin đã thanh toán
        FE->>FE: 15. Phát âm thanh "Ding-dong" thông báo thanh toán thành công
        FE->>Staff: 16. Hiển thị thông báo Toast thành công
        Staff->>FE: 17. Click "Xác nhận & Đóng hóa đơn" -> Cập nhật trạng thái booking='completed', giải phóng bàn='available'
    end
```

---

## 12. LUỒNG TỰ ĐỘNG RESET BÀN HẰNG NGÀY (DAILY AUTO-RESET STALE TABLES)

Sơ đồ hoạt động của dịch vụ nền dọn dẹp các lịch đặt bàn/bàn ăn bị quên hoặc quá hạn sang ngày mới.

```mermaid
flowchart TD
    StartInit([Khởi động Server / 00:00 Hằng Ngày]) --> GetTodayVN["Tính ngày hiện tại theo Múi giờ Việt Nam (UTC+7)"]
    GetTodayVN --> FindStaleBk["Tìm các lịch đặt bàn có status='serving' hoặc 'confirmed'<br>có ngày đặt nhỏ hơn ngày hiện tại"]
    
    FindStaleBk --> CheckStaleCount{"Tìm thấy lịch đặt cũ?"}
    
    CheckStaleCount -- "Có" --> CompleteStaleBk["UPDATE bookings SET status = 'completed' WHERE id IN (...)"]
    CompleteStaleBk --> ReleaseStaleTables["Giải phóng các bàn tương ứng: status = 'available'<br>WHERE table_code IN (...) AND status IN ('serving', 'reserved')"]
    ReleaseStaleTables --> CleanOrphans
    
    CheckStaleCount -- "Không" --> CleanOrphans["Dọn dẹp bàn mồ côi:<br>Tìm bàn có status='serving' nhưng không có lịch đặt active nào"]
    
    CleanOrphans --> CheckOrphans{"Tìm thấy bàn mồ côi?"}
    CheckOrphans -- "Có" --> ReleaseOrphans["UPDATE restaurant_tables SET status = 'available'"]
    ReleaseOrphans --> EndReset([Kết thúc quá trình Reset])
    CheckOrphans -- "Không" --> EndReset
```
