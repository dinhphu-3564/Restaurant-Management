# Yêu cầu về UX/UI cho Hệ thống Quản lý Nhà hàng

Tài liệu này quy định các tiêu chuẩn và yêu cầu về giao diện người dùng (UI) và trải nghiệm người dùng (UX) cho ứng dụng Web. Mục tiêu là tạo ra một giao diện hiện đại, tối giản, gọn gàng và hài hòa, tối ưu hóa quá trình thao tác mà không làm thay đổi các chức năng hoặc logic nền tảng hiện có.

## 1. Yêu cầu chung
* **Bảo toàn chức năng:** Giữ nguyên toàn bộ chức năng hiện có, luồng xử lý và dữ liệu lấy từ backend.
* **Tối ưu trải nghiệm:** Chỉ tập trung tối ưu lại bố cục, khoảng cách, kích thước, màu sắc, button, card, form, bảng, modal và hiển thị responsive.
* **Trực quan & Hiện đại:** Giao diện cần sạch sẽ, dễ nhìn, giảm bớt chi tiết thừa gây rối mắt. Các phần tử phải được căn chỉnh đều, khoảng cách hợp lý, không bị lệch hoặc tràn layout.
* **Định hướng phong cách:** Ưu tiên cảm giác hiện đại, tối giản (minimalist), chuyên nghiệp, dễ sử dụng, phù hợp với xu hướng các hệ thống quản lý F&B (Food & Beverage).

## 2. Yêu cầu về Bố cục (Layout)
* **Tổ chức Section:** Sắp xếp lại các phần (section) cho gọn gàng, rõ ràng, phân định bằng khoảng cách (whitespace) hoặc divider nhẹ nhàng.
* **Grid & Flexbox:** Căn chỉnh các khối nội dung đồng đều theo hệ thống grid hoặc flexbox hợp lý.
* **Khoảng trống (Spacing):** Tối ưu khoảng cách giữa các phần tử (padding, margin, gap). Không để các thành phần quá sát nhau (gây ngột ngạt) hoặc quá thưa (làm đứt gãy thông tin).
* **Phân cấp thông tin (Hierarchy):** Tiêu đề, nội dung, nút bấm và form phải có sự phân cấp rõ ràng về kích thước font và độ đậm.
* **Màn hình dữ liệu lớn:** Kiểm tra kỹ các màn hình chứa nhiều dữ liệu (như bảng thống kê, danh sách món ăn, báo cáo) để tránh rối mắt, có thể áp dụng các giải pháp như thu gọn (collapse), phân trang (pagination), hoặc thanh cuộn cục bộ (local scroll).

## 3. Yêu cầu về Nút bấm (Button)
* **Đồng bộ:** Thiết kế lại button cho đồng bộ toàn hệ thống. Kích thước button phải cân đối, dễ bấm, không quá to hoặc quá nhỏ.
* **Phân loại rõ ràng:**
  * **Nút chính (Primary):** Đặt bàn, Thanh toán, Lưu, Thêm vào giỏ. (Cần nổi bật nhất).
  * **Nút phụ (Secondary):** Hủy, Đóng, Bỏ qua. (Thiết kế nhẹ nhàng hơn, dạng outline hoặc màu xám nhạt).
  * **Nút nguy hiểm (Danger):** Xóa, Hủy đơn. (Dùng màu cảnh báo như đỏ/cam).
  * **Nút hành động phụ:** Xem chi tiết, Chỉnh sửa.
* **Thống nhất thiết kế:** Border-radius, padding, font-size và icon trong button phải nhất quán.
* **Trạng thái tương tác:** Phải có hiệu ứng mượt mà ở các trạng thái: `hover`, `active`, `focus` (ví dụ: focus ring để hỗ trợ accessibility) và `disabled`.
* **Mobile-friendly:** Trên thiết bị di động, button phải đủ lớn (tối thiểu 44x44px theo tiêu chuẩn) để dễ thao tác bằng ngón tay.

## 4. Yêu cầu về Màu sắc (Color Scheme)
* **Bảng màu:** Tối ưu lại bảng màu theo hướng sạch sẽ, hiện đại và hài hòa. Sử dụng màu nền sáng/nhẹ nhàng, màu chữ tương phản cao để dễ đọc.
* **Màu nhấn (Accent Color):** Sử dụng màu nhấn vừa phải, không dùng quá nhiều màu sặc sỡ trên cùng một màn hình (tuân thủ quy tắc 60-30-10 nếu có thể).
* **Màu trạng thái (Semantic Colors):**
  * **Thành công (Success):** Xanh lá.
  * **Cảnh báo (Warning):** Vàng/Cam.
  * **Lỗi (Error/Danger):** Đỏ.
  * **Thông tin (Info/Processing):** Xanh dương.
  * *Lưu ý:* Các màu này cần rõ ràng nhưng không quá gắt (neon), nên dùng tone màu pastel hoặc muted để dịu mắt.
* **Độ tương phản:** Đảm bảo độ tương phản (contrast ratio) giữa chữ, nền và button đạt chuẩn (ví dụ WCAG AA) để dễ đọc trong mọi điều kiện ánh sáng nhà hàng.

## 5. Yêu cầu về Form, Card, Bảng và Modal
* **Form:** Gọn gàng, dễ nhập liệu. Label (nhãn) rõ ràng, vị trí nhất quán (trên hoặc bên trái input). Kích thước input đồng đều, có placeholder và báo lỗi inline trực quan.
* **Card:** Có padding hợp lý, border-radius mềm mại (vd: 8px - 12px), và shadow (đổ bóng) rất nhẹ để tạo chiều sâu.
* **Bảng (Table):** Dữ liệu dễ đọc, header (tiêu đề cột) nổi bật/cố định. Dòng dữ liệu cần thoáng (có chiều cao dòng hợp lý), không bị đặc chữ, có xen kẽ màu nền (zebra striping) để dễ dóng hàng.
* **Modal/Dialog:** Căn giữa màn hình, có overlay mờ phía sau. Nội dung không bị chật chội, có padding lớn. Vị trí button (Xác nhận/Hủy) đặt hợp lý ở góc phải hoặc trải đều.
* **Empty/Loading/Error States:** Làm đẹp và thân thiện hóa các trạng thái "Không có dữ liệu", "Đang tải", "Lỗi kết nối", thêm hình ảnh minh họa nhỏ (illustration) nếu cần.

## 6. Yêu cầu Responsive (Thích ứng đa thiết bị)
* **Khả năng co giãn:** Giao diện hiển thị tốt trên Desktop, Tablet và Mobile.
* **Tránh lỗi hiển thị:** Tuyệt đối không xuất hiện thanh cuộn ngang (horizontal scroll) ở mức toàn trang ngoài ý muốn.
* **Mobile:** Ưu tiên layout 1 cột, khoảng cách các khối thu gọn lại, button trải dài toàn chiều rộng (full-width) ở các vị trí dễ bấm.
* **Tablet:** Tự động giảm số cột (ví dụ từ 4 cột trên desktop xuống 2 cột trên tablet).
* **Desktop:** Bố cục rộng rãi, cân đối. Có thể giới hạn `max-width` cho nội dung chính để không bị dàn trải quá mức trên màn hình Ultrawide.
* **Kích thước kiểm tra tối thiểu:** 1440px, 1024px, 768px, 430px, 390px, và 360px.

## 7. Yêu cầu về Hiệu ứng (Animations & Transitions)
* **Tương tác trực quan:** Thêm hiệu ứng transition nhẹ nhàng (0.2s - 0.3s) cho `hover`, `click`, chuyển trạng thái của button, card và modal.
* **Sự tinh tế:** Hiệu ứng phải mượt mà, đơn giản. Chuyển đổi màu sắc nền, đổ bóng (shadow), transform (scale nhẹ), hoặc opacity.
* **Tránh rườm rà:** Không dùng các animation gây chóng mặt, làm chậm thời gian phản hồi hoặc làm người dùng phân tâm khỏi tác vụ chính.

## 8. Yêu cầu Kỹ thuật
* **Bảo toàn Core logic:** Không phá vỡ code hiện tại. Không đổi tên biến, tên API, route hoặc logic xử lý nếu không có sự đồng ý.
* **Code sạch:** CSS/SCSS hoặc các class Tailwind (nếu dùng) phải sạch sẽ, có tổ chức, dễ bảo trì.
* **Tính đồng bộ:** Tạo ra các style/class dùng chung (utility classes/components) để áp dụng đồng bộ toàn giao diện.
* **Tái sử dụng:** Ưu tiên tái sử dụng các component để tránh lặp lại code không cần thiết.
* **Kiểm thử hồi quy UI:** Sau khi chỉnh sửa, phải kiểm tra lại toàn bộ màn hình để đảm bảo: không lỗi responsive, không vỡ layout, không mất chức năng và không làm thay đổi luồng nghiệp vụ.
