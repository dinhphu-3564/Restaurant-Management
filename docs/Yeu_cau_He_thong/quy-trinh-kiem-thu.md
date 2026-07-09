# Quy trình Kiểm thử và Đảm bảo Chất lượng (Quality Assurance Process)
*Dành cho Dự án Nhà hàng DinhPhuu*

Vì dự án hiện tại đã có mã nguồn (codebase), quy trình này được thiết kế để áp dụng cho cả các tính năng hiện có (cần refactor/bảo trì) và các tính năng mới phát triển (như thêm chức năng đặt bàn, quản lý nhân viên).

## 1. Tổng quan Quy trình (Process Overview)
Quy trình đảm bảo chất lượng bao gồm 5 bước cốt lõi:
1. **Linting & Formatting**: Kiểm tra cú pháp và định dạng code tự động.
2. **Review Code (Peer Review)**: Đánh giá chéo giữa các lập trình viên.
3. **Kiểm thử Tự động (Automated Testing)**: Chạy Unit Test và Integration Test.
4. **Kiểm thử Thủ công & Giao diện (Manual & UI/UX Testing)**: Kiểm thử người dùng dựa trên chuẩn thiết kế của nhà hàng.
5. **Nghiệm thu (UAT - User Acceptance Testing)**: Đội ngũ vận hành nhà hàng kiểm tra trước khi phát hành.

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 1: Linting & Formatting (Đảm bảo chuẩn Code)
- **Mục tiêu**: Loại bỏ lỗi cú pháp, đảm bảo code dễ đọc và tuân thủ giới hạn dòng (Ví dụ: Không quá 800 dòng/file theo chuẩn Workspace).
- **Hành động**:
  - Chạy công cụ Linter (như ESLint đối với dự án JS/TS) trước mỗi lần commit code.
  - Tự động format code (Prettier) để thống nhất phong cách viết code.
- **Tiêu chí hoàn thành**: Code không còn cảnh báo lỗi (0 warnings/errors) từ Linter.

### Bước 2: Review Code (Đánh giá chéo)
- **Mục tiêu**: Phát hiện sớm các lỗi logic nghiệp vụ nhà hàng (ví dụ: tính sai tổng tiền hóa đơn, trừ sai số lượng món ăn trong kho).
- **Hành động**:
  - Lập trình viên tạo Pull Request/Merge Request.
  - Ít nhất 1 người khác (hoặc Tech Lead) phải review và phê duyệt (Approve).
  - Kiểm tra xem code có tuân thủ quy chuẩn **Web UI Design Guidelines** và **Validation Standards** đã đề ra hay không.

### Bước 3: Kiểm thử Tự động (Automated Testing)
Do dự án đã có code, cần ưu tiên viết test cho các luồng quan trọng nhất trước.
- **Unit Testing (Kiểm thử mức hàm)**:
  - Tập trung vào các hàm tính toán phức tạp: Tính giá giảm giá, tính thuế VAT, tính điểm tích lũy của khách.
- **Integration Testing (Kiểm thử tích hợp)**:
  - Đảm bảo các API (Backend) giao tiếp đúng với Cơ sở dữ liệu và Frontend.
  - Ví dụ: Test luồng `Tạo Đơn Hàng` -> `Trừ Kho nguyên liệu` -> `Ghi nhận doanh thu`.
- **Tiêu chí hoàn thành**: Toàn bộ Test Cases phải `PASSED` trước khi gộp code.

### Bước 4: Kiểm thử Thủ công & Giao diện (Manual & UI/UX Testing)
- **Mục tiêu**: Đảm bảo trải nghiệm người dùng mượt mà, giao diện không bị vỡ trên các thiết bị khác nhau (Đặc biệt là máy tính bảng dùng để order tại bàn).
- **Hành động**:
  - **Kiểm tra Giao diện (UI)**: Đảm bảo nút bấm chính `.btn-primary` đúng màu xanh/đỏ thương hiệu, chữ màu trắng `#ffffff`, trạng thái hover/active không bị lỗi (Theo chuẩn Web UI Design).
  - **Kiểm tra Validation**: Thử nhập sai định dạng (số điện thoại chữ, bỏ trống món ăn...) để kiểm tra xem hệ thống có hiển thị viền đỏ và thông báo lỗi rõ ràng hay không.
  - **Kiểm tra thiết bị (Responsive)**: Test trên màn hình máy POS, iPad của nhân viên phục vụ, và điện thoại của khách hàng.

### Bước 5: Nghiệm thu (User Acceptance Testing - UAT)
- **Mục tiêu**: Xác nhận tính năng đã đáp ứng đúng nhu cầu vận hành thực tế của Nhà hàng DinhPhuu.
- **Hành động**:
  - Cập nhật phiên bản lên môi trường Staging (Môi trường thử nghiệm).
  - Quản lý nhà hàng, thu ngân, hoặc nhân viên phục vụ sẽ trực tiếp dùng thử nghiệm các luồng: Đặt bàn, gọi món, in hóa đơn.
- **Tiêu chí hoàn thành**: Đội vận hành nhà hàng xác nhận (Sign-off) luồng hoạt động trơn tru, không có lỗi chặn (Blocker). Lúc này tính năng mới sẵn sàng đưa lên môi trường thật (Production).

---

## 3. Checklist Nhanh Trước Khi Deploy
- [ ] Linter và Code Formatter đã chạy thành công.
- [ ] Code đã được Review và Approve.
- [ ] Toàn bộ Unit/Integration Test đã `PASSED`.
- [ ] Đã test hiển thị UI và chặn lỗi Validation thành công ở Frontend.
- [ ] API backend xử lý đúng và trả về lỗi chuẩn khi nhận dữ liệu rác.
- [ ] Quản lý nhà hàng đã dùng thử và xác nhận nghiệm thu.

---

## 4. Kiểm thử Hiệu năng & Khả năng chịu tải (Performance & Load Testing)
- **Công cụ**: Sử dụng Lighthouse (trên Chrome DevTools) hoặc k6.
- **Tiêu chuẩn**:
  - Thời gian phản hồi API (API Response Time) < 200ms.
  - Điểm hiệu năng Frontend (Lighthouse Performance) > 85.
  - Không xảy ra tình trạng "Cascading Renders" khi hiển thị dữ liệu bảng lớn.

---

## 5. Kiểm nghiệm & Rà soát mã nguồn (Verification)

- **Mục tiêu**: Đảm bảo toàn bộ code chạy chính xác, không phát sinh lỗi build/compile và đáp ứng tất cả Acceptance Criteria của tính năng.
- **Đầu vào**: Source code đã được chỉnh sửa hoặc viết mới.
- **Đầu ra**: Dự án build thành công ở các môi trường, test case chạy pass, tạo file báo cáo `walkthrough.md` trong thư mục artifacts của phiên làm việc.
- **Quy trình thực hiện**:
  1. Kiểm tra tính toàn vẹn của mã nguồn: Không để lại các đoạn mã TODO, hàm rỗng hoặc placeholder.
  2. Rà soát lỗi bảo mật cơ bản và tính nhất quán của giao diện (UI) bao gồm kiểm tra khả năng đổi giao diện Sáng/Tối (Light/Dark mode) và đa ngôn ngữ (chuyển đổi ngôn ngữ) hoạt động bình thường nếu dự án áp dụng.
  3. Thực hiện build production thực tế ở local hoặc CI/CD để phát hiện sớm các lỗi import, lỗi kiểu dữ liệu.

### Prompt Mẫu Cho AI Agent (Autopilot Prompt Template)
Dưới đây là prompt tiêu chuẩn được cấu hình cho AI Agent khi thực hiện công việc nghiệm thu tự động:

```markdown
Bạn đang ở Bước Quy trình Autopilot (Kiểm thử & Nghiệm thu).
Nhiệm vụ:
1. Chạy các lệnh kiểm thử tự động, build project (ví dụ: `npm run build`, `npm run test` tùy frontend/backend).
2. Rà soát lại lỗi bảo mật, tối ưu hóa code và kiểm tra tính nhất quán.
3. Đảm bảo hỗ trợ đa ngôn ngữ (chuyển đổi ngôn ngữ hoạt động bình thường) và Light/Dark mode hiển thị chuẩn chỉnh.
4. Tạo file `walkthrough.md` tại thư mục artifacts mô tả chi tiết những gì đã thay đổi và kết quả test.
```
