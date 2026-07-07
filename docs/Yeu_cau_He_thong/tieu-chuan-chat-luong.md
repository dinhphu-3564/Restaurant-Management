# TIÊU CHUẨN YÊU CẦU CHẤT LƯỢNG PHẦN MỀM
## Dự án: Hệ thống Quản lý Nhà hàng (Restaurant Management System - RMS)

**Phiên bản:** 1.0
**Căn cứ áp dụng:** ISO/IEC 25010 (SQuaRE - System and Software Quality Requirements and Evaluation), ISO/IEC/IEEE 29148 (Requirements Engineering), OWASP ASVS (bảo mật)

---

## 1. MỤC ĐÍCH VÀ PHẠM VI

Tài liệu này định nghĩa các tiêu chuẩn chất lượng bắt buộc mà đội phát triển phải tuân thủ trong suốt vòng đời dự án Hệ thống Quản lý Nhà hàng, bao gồm: đặt món, gọi món tại bàn/mang đi/online, quản lý bếp (KDS), thanh toán, quản lý kho nguyên liệu, quản lý nhân sự - ca làm, báo cáo doanh thu, và tích hợp thiết bị (máy in bill, máy POS, máy quét QR).

Phạm vi áp dụng: toàn bộ thành phần front-end (web/POS/app khách hàng), back-end (API, service), cơ sở dữ liệu, hạ tầng triển khai và tài liệu đi kèm.

---

## 2. MÔ HÌNH CHẤT LƯỢNG THAM CHIẾU (ISO/IEC 25010)

Mỗi đặc tính dưới đây phải có **tiêu chí đo lường (metric)** và **ngưỡng chấp nhận (acceptance threshold)** cụ thể, không chấp nhận mô tả định tính chung chung.

| Đặc tính chất lượng | Yêu cầu cụ thể cho dự án QLNH |
|---|---|
| **1. Functional Suitability** (Phù hợp chức năng) | Đầy đủ, đúng, phù hợp nghiệp vụ nhà hàng (xem mục 3) |
| **2. Performance Efficiency** (Hiệu năng) | Thời gian phản hồi, khả năng chịu tải giờ cao điểm |
| **3. Compatibility** (Tương thích) | Tích hợp máy in nhiệt, máy POS, cổng thanh toán, phần mềm kế toán |
| **4. Usability** (Khả năng sử dụng) | Nhân viên phục vụ/thu ngân thao tác được sau ≤ 30 phút đào tạo |
| **5. Reliability** (Độ tin cậy) | Không mất đơn hàng, không sai lệch hóa đơn |
| **6. Security** (Bảo mật) | Bảo vệ dữ liệu thanh toán, phân quyền theo vai trò |
| **7. Maintainability** (Khả năng bảo trì) | Code sạch, dễ mở rộng module mới (vd: thêm chi nhánh) |
| **8. Portability** (Khả năng di trú) | Triển khai được trên nhiều môi trường (cloud/on-premise) |

---

## 3. YÊU CẦU CHẤT LƯỢNG CHỨC NĂNG (Functional Suitability)

### 3.1 Tính đầy đủ (Functional Completeness)
- Bao phủ 100% use case trong đặc tả nghiệp vụ đã duyệt: đặt bàn, gọi món, chuyển món giữa các bàn, ghép/tách hóa đơn, giảm giá, khuyến mãi, hoàn/hủy món, đóng ca, kiểm kho.
- Ma trận truy vết (Traceability Matrix) giữa yêu cầu nghiệp vụ ↔ test case ↔ mã nguồn phải đạt 100% trước khi release.

### 3.2 Tính đúng đắn (Functional Correctness)
- Sai số tính tiền, thuế, phí dịch vụ = 0 (kiểm thử bằng bộ dữ liệu biên: giảm giá 100%, số lượng âm, món hết hàng).
- Đồng bộ trạng thái đơn hàng giữa POS – Bếp (KDS) – Ứng dụng khách hàng có độ trễ ≤ 2 giây.

### 3.3 Tính thích hợp (Functional Appropriateness)
- Luồng thao tác tối thiểu hóa số bước cho các tác vụ tần suất cao (gọi món, thanh toán ≤ 3 thao tác chạm/click).

---

## 4. YÊU CẦU HIỆU NĂNG (Performance Efficiency)

| Chỉ tiêu | Ngưỡng chấp nhận |
|---|---|
| Thời gian phản hồi API (P95) | ≤ 500ms cho thao tác đọc, ≤ 1s cho thao tác ghi (tạo đơn, thanh toán) |
| Thời gian tải trang gọi món (First Contentful Paint) | ≤ 2 giây trên mạng 4G |
| Số giao dịch đồng thời (concurrent orders) | Chịu tải ≥ 200 đơn hàng/phút tại 1 chi nhánh vào giờ cao điểm |
| Sử dụng tài nguyên | CPU trung bình < 70%, không rò rỉ bộ nhớ (memory leak) sau 72 giờ chạy liên tục |
| Khả năng mở rộng (Scalability) | Kiến trúc hỗ trợ scale ngang (horizontal scaling) khi tăng số chi nhánh |

Kiểm thử hiệu năng bắt buộc: Load test, Stress test, Soak test trước mỗi lần release lớn (major release).

---

## 5. YÊU CẦU BẢO MẬT (Security)

Tuân thủ OWASP Top 10 và OWASP ASVS mức độ Level 2 (do có xử lý thanh toán).

- **Xác thực & phân quyền:** RBAC (Role-Based Access Control) rõ ràng theo vai trò: Quản lý, Thu ngân, Phục vụ, Bếp, Chủ nhà hàng. Không nhân viên nào truy cập được chức năng ngoài quyền hạn.
- **Dữ liệu thanh toán:** Không lưu trữ trực tiếp số thẻ (PAN); tuân thủ PCI-DSS nếu tích hợp cổng thanh toán thẻ. Dữ liệu nhạy cảm mã hóa khi lưu trữ (at-rest) và truyền tải (in-transit, TLS 1.2+).
- **Nhật ký (Audit log):** Ghi log mọi thao tác hủy đơn, giảm giá, sửa hóa đơn đã in — không thể chỉnh sửa/xóa log (immutable audit trail).
- **Chống tấn công phổ biến:** SQL Injection, XSS, CSRF phải được kiểm thử và chặn ở tầng API và Front-end.
- **Session:** Tự động đăng xuất sau thời gian không hoạt động cấu hình được (mặc định 15 phút với tài khoản thu ngân).

---

## 6. YÊU CẦU ĐỘ TIN CẬY (Reliability)

| Chỉ tiêu | Ngưỡng |
|---|---|
| Uptime hệ thống (giờ hoạt động nhà hàng) | ≥ 99.5% |
| Mất dữ liệu đơn hàng (Data loss) | 0% — có cơ chế lưu tạm cục bộ (offline-first) khi mất kết nối mạng, đồng bộ lại khi có mạng |
| Khôi phục sau lỗi (MTTR) | ≤ 15 phút với lỗi mức nghiêm trọng (Sev-1) |
| Sao lưu dữ liệu (Backup) | Tự động hàng ngày, kiểm thử khôi phục (restore drill) tối thiểu mỗi quý |
| Khả năng chịu lỗi | Nếu mất kết nối internet, hệ thống POS tại chỗ vẫn hoạt động được (chế độ offline) |

---

## 7. YÊU CẦU KHẢ NĂNG SỬ DỤNG (Usability)

- Giao diện thu ngân/phục vụ tối ưu cho thao tác nhanh, ít bước, hỗ trợ bàn phím tắt.
- Ứng dụng đặt món cho khách (nếu có QR order) phải đạt điểm SUS (System Usability Scale) ≥ 70 trong kiểm thử người dùng.
- Hỗ trợ đa ngôn ngữ tối thiểu Tiếng Việt/Tiếng Anh nếu phục vụ khách quốc tế.
- Thông báo lỗi rõ ràng, hướng dẫn khắc phục (không hiển thị mã lỗi kỹ thuật thô cho người dùng cuối).
- Đạt chuẩn khả năng tiếp cận (Accessibility) tối thiểu WCAG 2.1 mức AA cho các giao diện web công khai.

---

## 8. YÊU CẦU KHẢ NĂNG BẢO TRÌ (Maintainability) — Chuẩn Code

### 8.1 Quy chuẩn viết mã nguồn
- Tuân thủ style guide theo ngôn ngữ (ESLint/Prettier cho JS/TS, PSR-12 cho PHP, PEP8 cho Python, v.v.), cấu hình lint chạy tự động trong CI.
- Đặt tên biến/hàm rõ nghĩa, tránh viết tắt tùy tiện; comment cho logic nghiệp vụ phức tạp (vd: công thức tính hoa hồng, thuế).
- Nguyên tắc SOLID, tách rõ layer: Presentation – Business Logic – Data Access.
- Không hard-code cấu hình (giá, thuế, thông tin kết nối) — dùng file cấu hình/biến môi trường.

### 8.2 Kiểm thử (Testing) — bắt buộc theo tháp kiểm thử

| Loại kiểm thử | Độ phủ tối thiểu | Ghi chú |
|---|---|---|
| Unit Test | ≥ 80% cho tầng business logic | Bắt buộc cho module tính tiền, thuế, khuyến mãi |
| Integration Test | 100% API endpoint chính | Bao gồm tích hợp máy in, cổng thanh toán |
| End-to-End Test | 100% luồng nghiệp vụ chính (happy path) | Đặt món → bếp → thanh toán → in hóa đơn |
| UAT (User Acceptance Test) | Có sự tham gia của nhân viên nhà hàng thực tế | Trước mỗi lần release |
| Regression Test | Tự động hóa, chạy mỗi lần merge code | CI pipeline |

### 8.3 Quy trình review & CI/CD
- Mọi thay đổi code phải qua Pull Request, tối thiểu 1 người review, không tự merge code của chính mình.
- Pipeline CI phải chạy: lint → build → unit test → security scan (SAST) → deploy staging tự động.
- Sử dụng semantic versioning (MAJOR.MINOR.PATCH) cho mỗi bản phát hành.
- Có changelog rõ ràng cho mỗi phiên bản.

### 8.4 Quản lý lỗi (Defect Management)
- Phân loại mức độ nghiêm trọng: Blocker / Critical / Major / Minor / Cosmetic.
- SLA xử lý: Blocker ≤ 4 giờ, Critical ≤ 24 giờ, Major ≤ 3 ngày, Minor theo kế hoạch sprint.
- Không release nếu còn lỗi mức Blocker/Critical chưa xử lý.

---

## 9. YÊU CẦU KHẢ NĂNG DI TRÚ (Portability)

- Đóng gói bằng container (Docker) để triển khai nhất quán giữa các môi trường (dev/staging/production).
- Không phụ thuộc cứng vào một nhà cung cấp cloud cụ thể (tránh vendor lock-in) ở tầng ứng dụng.
- Hỗ trợ import/export dữ liệu (thực đơn, danh mục nguyên liệu) qua định dạng chuẩn (CSV/Excel/JSON) khi di chuyển giữa hệ thống cũ và mới.

---

## 10. TÀI LIỆU BẮT BUỘC ĐI KÈM

1. Đặc tả yêu cầu phần mềm (SRS) đã được nghiệp vụ ký duyệt.
2. Tài liệu thiết kế kiến trúc hệ thống (System Architecture Document).
3. Tài liệu API (OpenAPI/Swagger).
4. Kế hoạch kiểm thử (Test Plan) và báo cáo kết quả kiểm thử.
5. Hướng dẫn vận hành (Operation Manual) và hướng dẫn sử dụng (User Manual) cho nhân viên nhà hàng.
6. Biên bản đánh giá bảo mật (Security Assessment Report) trước khi go-live.

---

## 11. TIÊU CHÍ NGHIỆM THU (Definition of Done cấp dự án)

Một phiên bản chỉ được coi là đạt chất lượng để bàn giao/phát hành khi thỏa mãn đồng thời:

- [ ] 100% chức năng trong phạm vi sprint/release hoạt động đúng theo đặc tả.
- [ ] Độ phủ Unit test ≥ 80% cho các module nghiệp vụ lõi.
- [ ] Không còn lỗi mức Blocker/Critical.
- [ ] Đã qua kiểm thử hiệu năng đạt ngưỡng ở mục 4.
- [ ] Đã qua rà soát bảo mật (security checklist OWASP) không phát hiện lỗ hổng nghiêm trọng.
- [ ] Tài liệu (mục 10) đầy đủ và cập nhật.
- [ ] UAT được nghiệm thu bởi đại diện phía nhà hàng (chủ quán/quản lý).

---

*Tài liệu này nên được rà soát và cập nhật định kỳ mỗi quý hoặc khi có thay đổi lớn về phạm vi/kiến trúc dự án.*
