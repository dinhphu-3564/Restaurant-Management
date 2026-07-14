# TÀI LIỆU ĐẶC TẢ NGHIỆP VỤ
## Logic, Quy trình & Quy chuẩn Dữ liệu — Module Tổng quan / Doanh thu / Báo cáo chi tiết
### Dự án: Hệ thống Quản lý Nhà hàng "Dê Hương Sơn"

---

## MỤC LỤC
1. Phạm vi tài liệu
2. Quy chuẩn dữ liệu gốc (Data Model)
3. Logic tính giá bán, giá vốn, lợi nhuận
4. Thuế và các loại phí
5. Trang Tổng quan (Dashboard)
6. Trang Doanh thu
7. Trang Báo cáo chi tiết
8. Quy trình nghiệp vụ tổng thể (End-to-end flow)
9. Quy tắc làm tròn & xử lý ngoại lệ

---

## 1. PHẠM VI TÀI LIỆU

Tài liệu này mô tả:
- Cách hệ thống **tính toán** các con số tiền (doanh thu, giá vốn, lợi nhuận, thuế, phí).
- **Nguồn dữ liệu** và **công thức** cho từng chỉ số hiển thị trên 3 trang: Tổng quan, Doanh thu, Báo cáo chi tiết.
- **Quy chuẩn đặt tên trường dữ liệu** để đội phát triển (backend/frontend) dùng thống nhất.

Tài liệu **không** bao gồm thiết kế giao diện chi tiết (UI spec), chỉ tập trung vào logic nghiệp vụ và dữ liệu.

---

## 2. QUY CHUẨN DỮ LIỆU GỐC (DATA MODEL)

Mọi số liệu doanh thu/báo cáo đều được suy ra (derived) từ 4 nhóm bảng dữ liệu gốc. Đội dev cần đảm bảo các bảng này có đầy đủ trường dưới đây — thiếu trường nào thì báo cáo phía sau sẽ sai lệch.

### 2.1. Bảng `menu_items` (Món ăn / Thực đơn)
| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `item_id` | string/uuid | Mã món |
| `name` | string | Tên món |
| `category_id` | string | Nhóm món (Khai vị, Món chính, Đồ uống...) |
| `cost_price` | decimal | **Giá vốn** — chi phí nguyên vật liệu + chế biến cho 1 đơn vị món |
| `sell_price` | decimal | **Giá bán niêm yết** (chưa gồm thuế/phí dịch vụ) |
| `unit` | string | Đơn vị tính (phần, con, kg, ly...) |
| `is_active` | boolean | Còn bán hay đã ngừng |
| `vat_rate` | decimal | Thuế suất GTGT áp dụng riêng cho món (nếu khác mức chung) |

> ⚠️ **Lưu ý quan trọng**: `cost_price` phải được nhập/cập nhật định kỳ (theo biến động giá nguyên liệu). Nếu không có `cost_price` chuẩn, mọi con số "lợi nhuận" trong hệ thống chỉ là ước tính, cần cảnh báo rõ trên UI (ví dụ hiển thị "*Lợi nhuận ước tính*").

### 2.2. Bảng `orders` (Đơn hàng)
| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `order_id` | uuid | Mã đơn |
| `table_id` | string | Bàn/khu vực |
| `created_at` | datetime | Thời điểm mở đơn |
| `closed_at` | datetime | Thời điểm thanh toán xong |
| `status` | enum | `pending / serving / paid / cancelled` |
| `channel` | enum | `dine_in / takeaway / grab / shopeefood / other` |
| `subtotal` | decimal | Tổng tiền món (trước giảm giá, phí, thuế) |
| `discount_amount` | decimal | Tổng tiền giảm giá áp dụng |
| `service_charge` | decimal | Phí dịch vụ (nếu có) |
| `vat_amount` | decimal | Tiền thuế GTGT |
| `platform_fee` | decimal | Phí sàn (nếu bán qua Grab/ShopeeFood...) |
| `total_amount` | decimal | **Tổng khách phải trả** |
| `payment_method` | enum | `cash / bank_transfer / card / e_wallet` |
| `staff_id` | string | Nhân viên phụ trách |

### 2.3. Bảng `order_items` (Chi tiết món trong đơn)
| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `order_item_id` | uuid | Mã dòng |
| `order_id` | uuid | Thuộc đơn nào |
| `item_id` | string | Món nào |
| `quantity` | int | Số lượng |
| `unit_price` | decimal | Giá bán tại thời điểm bán (snapshot — **không lấy giá hiện tại của menu** để tránh sai lệch khi giá thay đổi sau này) |
| `unit_cost` | decimal | Giá vốn tại thời điểm bán (snapshot) |
| `line_total` | decimal | `= quantity × unit_price` |
| `line_discount` | decimal | Giảm giá riêng cho món này (nếu có) |

> **Nguyên tắc snapshot**: Khi món được thêm vào đơn, hệ thống phải **copy** `sell_price` và `cost_price` tại thời điểm đó vào `order_items`, không tham chiếu động đến `menu_items`. Điều này đảm bảo báo cáo lịch sử không bị thay đổi khi giá món cập nhật sau này.

### 2.4. Bảng `expenses` (Chi phí vận hành — phục vụ báo cáo lợi nhuận ròng)
| Trường | Ý nghĩa |
|---|---|
| `expense_id` | Mã chi phí |
| `type` | Loại: `rent / salary / utility / marketing / other` |
| `amount` | Số tiền |
| `date` | Ngày phát sinh |

---

## 3. LOGIC TÍNH GIÁ BÁN, GIÁ VỐN, LỢI NHUẬN

Đây là phần cốt lõi — cần thống nhất công thức trước khi code, vì "markup" và "margin" là hai khái niệm khác nhau và dễ gây nhầm lẫn.

### 3.1. Hai công thức định giá phổ biến

**Cách 1 — Markup (Tính trên giá vốn):**
```
Giá bán = Giá vốn × (1 + % Markup)
```
Ví dụ: Giá vốn 100.000đ, muốn markup 150% → Giá bán = 100.000 × 2.5 = 250.000đ

**Cách 2 — Margin (Tính trên giá bán):**
```
Giá bán = Giá vốn ÷ (1 − % Margin mong muốn)
```
Ví dụ: Giá vốn 100.000đ, muốn margin (biên lợi nhuận gộp) 60% → Giá bán = 100.000 ÷ 0.4 = 250.000đ

> Hai ví dụ trên cho cùng giá bán 250.000đ, nhưng **% Markup ≠ % Margin** (150% markup ≈ 60% margin). Hệ thống nên **chỉ chọn 1 cách hiển thị chuẩn** (khuyến nghị dùng **Margin trên giá bán**, vì đây là chỉ số ngành F&B thường dùng để so sánh với báo cáo tài chính).

### 3.2. Công thức lợi nhuận cho từng món / từng đơn
```
Lợi nhuận gộp (món)   = (unit_price − unit_cost) × quantity
Tỷ suất LN gộp (món)  = Lợi nhuận gộp ÷ (unit_price × quantity) × 100%

Lợi nhuận gộp (đơn)   = Σ Lợi nhuận gộp từng dòng món − discount phân bổ
```

### 3.3. Công thức tính từ Doanh thu → Lợi nhuận ròng
```
Doanh thu gộp (Gross Revenue)  = Σ subtotal của tất cả đơn đã thanh toán (status = paid)
Doanh thu thuần (Net Revenue)  = Doanh thu gộp − discount_amount − hàng trả/hủy
Giá vốn hàng bán (COGS)        = Σ (unit_cost × quantity) của các đơn đã bán
Lợi nhuận gộp (Gross Profit)   = Doanh thu thuần − COGS
Tỷ suất LN gộp (Gross Margin%) = Lợi nhuận gộp ÷ Doanh thu thuần × 100%

Lợi nhuận ròng (Net Profit)    = Lợi nhuận gộp − Chi phí vận hành (expenses) − Thuế TNDN (nếu tính)
```

### 3.4. Ví dụ minh họa thực tế
| Mục | Giá trị |
|---|---|
| Doanh thu gộp trong ngày | 20.000.000đ |
| Giảm giá/khuyến mãi | −500.000đ |
| **Doanh thu thuần** | **19.500.000đ** |
| Giá vốn nguyên liệu (COGS) | −8.000.000đ |
| **Lợi nhuận gộp** | **11.500.000đ** |
| **Tỷ suất LN gộp** | 11.500.000 ÷ 19.500.000 = **58,97%** |
| Chi phí vận hành trong ngày (phân bổ) | −4.000.000đ |
| **Lợi nhuận ròng** | **7.500.000đ** |

---

## 4. THUẾ VÀ CÁC LOẠI PHÍ

Đây là phần cần xác nhận với kế toán/chủ nhà hàng trước khi fix cứng vào hệ thống, vì tỷ lệ có thể thay đổi theo quy định và theo chính sách riêng của quán. Dưới đây là khung tham khảo phổ biến tại Việt Nam:

### 4.1. Thuế GTGT (VAT)
- Áp dụng theo mức thuế suất hiện hành cho dịch vụ ăn uống (hệ thống nên để **cấu hình được**, không hard-code, vì mức thuế có thể thay đổi theo chính sách nhà nước theo từng thời kỳ).
- Công thức: `vat_amount = (subtotal − discount) × vat_rate`
- Cách tính giá: cần xác định rõ **giá niêm yết đã gồm VAT hay chưa** — đây là quyết định nghiệp vụ quan trọng cần chốt với chủ quán:
  - Nếu giá niêm yết **đã gồm VAT**: `giá gốc chưa thuế = sell_price ÷ (1 + vat_rate)`
  - Nếu giá niêm yết **chưa gồm VAT**: `giá khách trả = sell_price × (1 + vat_rate)`

### 4.2. Thuế khoán / Thuế TNCN (áp dụng cho hộ kinh doanh cá thể)
- Nếu nhà hàng đăng ký dạng hộ kinh doanh, có thể áp dụng thuế khoán theo doanh thu (không tính chi tiết từng đơn), hệ thống chỉ cần xuất báo cáo **tổng doanh thu theo tháng/quý** để chủ hộ tự kê khai.

### 4.3. Phí dịch vụ (Service Charge)
- Phổ biến 5%–10% trên `subtotal`, cộng thêm vào hóa đơn khách hàng, **không phải là doanh thu bán món** mà nên tách riêng thành khoản mục để phân biệt khi tính lương/thưởng nhân viên (nhiều nơi dùng service charge để chia quỹ phục vụ).
```
service_charge = subtotal × service_charge_rate
```

### 4.4. Phí sàn / Phí đối tác giao hàng (Platform Fee)
- Áp dụng khi đơn đến từ kênh `grab`, `shopeefood`, v.v. Tỷ lệ hoa hồng do đối tác quy định (thường 15%–25%, cần cấu hình riêng theo từng kênh vì mỗi platform một mức khác nhau).
```
platform_fee = subtotal_kenh_do × platform_commission_rate
doanh_thu_thuc_nhan = subtotal − platform_fee
```
> Lưu ý: Doanh thu **ghi nhận kế toán** vẫn tính theo `subtotal` (giá bán cho khách), còn `platform_fee` được ghi nhận là **chi phí bán hàng**, không trừ thẳng vào doanh thu để tránh làm sai lệch số liệu doanh thu gộp.

### 4.5. Phí thanh toán điện tử (Payment Gateway Fee)
- Áp dụng khi thanh toán qua thẻ/ví điện tử, thường 1%–3% giá trị giao dịch, cấu hình theo từng `payment_method`.

### 4.6. Tổng hợp công thức tính "Tổng khách phải trả"
```
total_amount = subtotal
             − discount_amount
             + service_charge
             + vat_amount
```
*(platform_fee và payment_gateway_fee không cộng vào total_amount khách trả — đây là chi phí nhà hàng gánh, trừ vào lợi nhuận, không phải khoản thu thêm từ khách, trừ khi quán chủ động thu phụ phí thanh toán thẻ.)*

---

## 5. TRANG TỔNG QUAN (DASHBOARD)

Mục tiêu: cho chủ quán cái nhìn nhanh trong **1 màn hình** về tình hình vận hành hôm nay.

| Widget | Công thức / Nguồn dữ liệu | Khoảng thời gian mặc định |
|---|---|---|
| Doanh thu hôm nay | `Σ total_amount` các đơn `status=paid`, `closed_at` = hôm nay | Hôm nay (real-time, cập nhật theo phút) |
| So sánh với hôm qua | `(DT hôm nay − DT hôm qua) ÷ DT hôm qua × 100%` | So với cùng khung giờ hôm qua (để công bằng) |
| Số đơn hàng | `COUNT(order_id)` where `status=paid` | Hôm nay |
| Giá trị đơn trung bình (AOV) | `Doanh thu hôm nay ÷ Số đơn hàng` | Hôm nay |
| Số bàn đang phục vụ | `COUNT(table)` where `status=occupied` | Real-time |
| Đơn đặt bàn mới | `COUNT(reservation)` where `status=pending_confirm` | Real-time — đây là nguồn gốc badge "1" ở menu Đặt bàn |
| Top món bán chạy | `SUM(quantity) GROUP BY item_id ORDER BY DESC LIMIT 5` | Hôm nay hoặc 7 ngày |
| Lợi nhuận gộp ước tính hôm nay | Theo công thức mục 3.3 | Hôm nay |

**Quy tắc hiển thị:**
- Mọi số tiền hiển thị đơn vị VNĐ, định dạng dấu chấm phân cách hàng nghìn (ví dụ `12.500.000đ`).
- Số liệu "hôm nay" cần làm mới tự động (polling hoặc websocket) mỗi 30–60 giây để không cần khách hàng F5.
- Nếu `cost_price` món chưa được nhập đầy đủ, widget lợi nhuận cần hiện chú thích "*Dữ liệu giá vốn chưa đầy đủ*".

---

## 6. TRANG DOANH THU

Mục tiêu: phân tích sâu về doanh thu theo nhiều chiều (thời gian, kênh bán, danh mục món, nhân viên).

### 6.1. Bộ lọc chuẩn
- Khoảng thời gian: Hôm nay / 7 ngày / Tháng này / Tùy chọn (date range picker)
- Kênh bán: Tất cả / Tại bàn / Mang về / Grab / ShopeeFood...
- Khu vực/Bàn

### 6.2. Các khối số liệu chính
| Chỉ số | Công thức |
|---|---|
| Doanh thu gộp | `Σ subtotal` |
| Giảm giá | `Σ discount_amount` |
| **Doanh thu thuần** | Gộp − Giảm giá |
| Thuế GTGT đã thu | `Σ vat_amount` |
| Phí dịch vụ đã thu | `Σ service_charge` |
| Giá vốn (COGS) | `Σ (unit_cost × quantity)` |
| **Lợi nhuận gộp** | Doanh thu thuần − COGS |
| **Tỷ suất lợi nhuận gộp** | Lợi nhuận gộp ÷ Doanh thu thuần |

### 6.3. Biểu đồ đề xuất
- **Biểu đồ đường**: Doanh thu theo ngày trong kỳ (line chart) — giúp nhìn xu hướng.
- **Biểu đồ cột**: Doanh thu theo kênh bán hàng (dine-in vs takeaway vs Grab...).
- **Biểu đồ tròn**: Tỷ trọng doanh thu theo nhóm món (khai vị/món chính/đồ uống...).
- **Bảng xếp hạng**: Top 10 món theo doanh thu và theo lợi nhuận gộp (hai bảng riêng — món bán chạy nhất chưa chắc là món lời nhất).

### 6.4. Doanh thu theo ca / theo nhân viên
```
Doanh thu theo nhân viên = Σ total_amount WHERE staff_id = X
```
Dùng để tính thưởng doanh số hoặc đánh giá hiệu suất phục vụ.

---

## 7. TRANG BÁO CÁO CHI TIẾT

Mục tiêu: xuất dữ liệu **cấp giao dịch** (transaction-level) phục vụ đối soát kế toán, không chỉ là số liệu tổng hợp.

### 7.1. Các loại báo cáo cần có
1. **Báo cáo bán hàng chi tiết theo đơn** — liệt kê từng đơn: giờ mở/đóng, bàn, món, tổng tiền, thuế, phí, phương thức thanh toán, nhân viên.
2. **Báo cáo theo món ăn** — số lượng bán, doanh thu, giá vốn, lợi nhuận từng món trong kỳ.
3. **Báo cáo theo danh mục** — tổng hợp theo nhóm món.
4. **Báo cáo theo phương thức thanh toán** — đối soát tiền mặt/chuyển khoản/thẻ/ví — quan trọng để khớp quỹ cuối ngày.
5. **Báo cáo thuế** — tổng VAT đã thu theo kỳ, phục vụ kê khai thuế.
6. **Báo cáo hủy/hoàn đơn** — các đơn `status=cancelled`, lý do hủy, giá trị thất thoát.
7. **Báo cáo lợi nhuận ròng theo kỳ** — gồm cả `expenses` vận hành (mục 3.3).

### 7.2. Yêu cầu kỹ thuật cho trang báo cáo
- Cho phép **xuất file Excel/PDF** theo khoảng thời gian tùy chọn.
- Dữ liệu hiển thị dạng bảng, có phân trang, sắp xếp theo cột.
- Ghi log: mỗi lần đơn được **sửa hoặc hủy sau khi đã thanh toán** phải lưu lịch sử (audit trail) — ai sửa, sửa gì, lúc nào — để tránh gian lận thất thoát doanh thu.

### 7.3. Cấu trúc 1 dòng báo cáo chi tiết đơn hàng (ví dụ)
| Mã đơn | Giờ | Bàn | Món | SL | Đơn giá | Giá vốn | Thành tiền | Giảm giá | Phí DV | VAT | Tổng thu | Nhân viên | PT Thanh toán |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

---

## 8. QUY TRÌNH NGHIỆP VỤ TỔNG THỂ (END-TO-END FLOW)

```
1. Mở bàn / Tạo đơn (order.status = pending)
        ↓
2. Order tại bàn thêm order_items (snapshot unit_price + unit_cost tại thời điểm order)
        ↓
3. Bếp xác nhận chế biến (không ảnh hưởng số tiền)
        ↓
4. Khách yêu cầu thanh toán
        ↓
5. Hệ thống tính:
   subtotal → áp discount → tính service_charge → tính vat_amount → total_amount
        ↓
6. Ghi nhận payment_method, đóng đơn (order.status = paid, closed_at = now)
        ↓
7. Dữ liệu đơn đã đóng được đẩy vào:
   - Tổng quan (real-time aggregation)
   - Doanh thu (tổng hợp theo kỳ)
   - Báo cáo chi tiết (lưu vĩnh viễn, phục vụ đối soát/audit)
```

**Nguyên tắc bất biến (Immutability):** Sau khi đơn đã `paid`, các trường tài chính (`subtotal`, `total_amount`, `vat_amount`...) **không được sửa trực tiếp**. Nếu cần điều chỉnh (hoàn tiền, sửa sai), hệ thống phải tạo một **giao dịch điều chỉnh riêng** (`adjustment` hoặc `refund` record) tham chiếu đến `order_id` gốc, để báo cáo luôn truy vết được lịch sử thay đổi.

---

## 9. QUY TẮC LÀM TRÒN & XỬ LÝ NGOẠI LỆ

- **Làm tròn tiền**: làm tròn đến hàng đơn vị VNĐ (không có số thập phân), áp dụng làm tròn ở **bước cuối cùng** của công thức, không làm tròn ở từng bước trung gian (tránh sai số cộng dồn).
- **Đơn bị hủy** (`status = cancelled`): loại khỏi tính doanh thu, nhưng vẫn lưu vào báo cáo hủy đơn (mục 7.1.6) kèm lý do.
- **Đơn gộp bàn / tách bàn**: cần có `parent_order_id` để đảm bảo không đếm trùng hoặc thiếu doanh thu khi gộp/tách.
- **Giảm giá theo %  vs theo số tiền cố định**: hệ thống cần hỗ trợ cả hai (`discount_type = percent | fixed`), và áp dụng thứ tự: giảm giá theo món trước → giảm giá toàn đơn sau → rồi mới tính phí dịch vụ và thuế trên phần còn lại.
- **Món tặng kèm / khuyến mãi (0đ)**: vẫn phải ghi nhận `unit_cost` để trừ đúng vào giá vốn, dù `unit_price = 0` — nếu không, lợi nhuận sẽ bị tính sai (cao ảo).

---

## GHI CHÚ TRIỂN KHAI

Trước khi lập trình, cần chốt với chủ nhà hàng / kế toán các thông số sau (nên đưa vào bảng **cấu hình hệ thống**, không hard-code):
- [ ] Mức thuế suất VAT áp dụng
- [ ] Giá niêm yết đã gồm VAT hay chưa
- [ ] Mức phí dịch vụ (nếu có), và cách chia cho nhân viên
- [ ] Tỷ lệ hoa hồng từng kênh giao hàng (Grab, ShopeeFood...)
- [ ] Có tính thuế TNDN/thuế khoán trong hệ thống hay để kế toán làm ngoài
- [ ] Chuẩn công thức định giá bán áp dụng (Markup hay Margin) cho tính năng gợi ý giá bán món mới
