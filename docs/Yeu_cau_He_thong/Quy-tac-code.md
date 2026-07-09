# QUY TẮC PHÁT TRIỂN & CHUẨN CODE (CODING STANDARDS)
## Dự án: Hệ thống Quản lý Nhà hàng (Restaurant Management System - RMS)

Tài liệu này quy định các quy tắc viết code nghiêm ngặt nhằm duy trì tính dễ bảo trì (Maintainability), tính mở rộng (Scalability) và hiệu năng (Performance) của dự án theo đúng tiêu chuẩn ISO/IEC 25010.

---

## 1. GIỚI HẠN ĐỘ DÀI FILE (FILE LENGTH LIMITS)

Để tránh tình trạng "God File" (file chứa quá nhiều trách nhiệm, cực kỳ khó đọc và bảo trì), đội ngũ phát triển bắt buộc phải tuân thủ giới hạn dòng code (Lines of Code - LOC) sau:

| Loại file | Cảnh báo (Soft Limit) | Giới hạn cứng (Hard Limit) | Hành động khắc phục |
|---|---|---|---|
| **React Page / Component** | **800 dòng** | **1000 dòng** | Tách nhỏ thành sub-components, di chuyển helper UI ra file ngoài, sử dụng custom hook để tách logic. |
| **Express Route / Controller** | **250 dòng** | **300 dòng** | Di chuyển logic xử lý nghiệp vụ phức tạp (business logic) vào tầng Helper Service / Model. |
| **Database Helpers / Services** | **600 dòng** | **800 dòng** | Chia nhỏ helper theo Module chức năng (Ví dụ: tách orderHelper, menuHelper, stockHelper). |
| **File Config / Mock Data / Schema** | **1000 dòng** | **1300 dòng** | Tránh ghi đè hoặc phình to file quá mức, chia nhỏ dữ liệu test nếu vượt hạn mức. |

---

## 2. QUY TẮC CODE FRONTEND (REACT / VITE / TAILWIND)

1. **Tách nhỏ Component (Component Modularization)**:
   - Các modal lớn (như Add/Edit Form, Details View, Confirmation Popups) không được viết chung trong file Page chính mà phải tách ra thư mục `src/components/...` để tái sử dụng và kiểm soát độ dài file.
   - Các hàm định dạng tĩnh (định dạng tiền tệ, ngày tháng...) hoặc hàm xử lý chuỗi phải được chuyển vào thư mục `src/utils/...`.

2. **Quản lý dữ liệu động (Dynamic Data Management)**:
   - **Tuyệt đối không sử dụng dữ liệu cứng (hardcoded)** đối với danh sách món ăn, danh mục hoặc cấu hình thực đơn trên trang chủ và trang menu. Toàn bộ dữ liệu phải được gọi từ API backend.
   - Thêm thuộc tính hiển thị dự phòng (Ví dụ: `badge` dự phòng cho `tag`) để đảm bảo không bị lỗi giao diện khi cấu trúc CSDL thay đổi.

3. **Thiết kế giao diện và Lưới (UI / Grid Guidelines)**:
   - Đảm bảo thiết kế co giãn (Responsive) tốt trên mọi thiết bị.
   - Khi thiết kế lưới hiển thị danh sách (như Grid 5 cột trên desktop), bắt buộc phải điều chỉnh tỷ lệ hình ảnh (`md:h-36`) và kích thước đệm của thẻ con để không bị méo tỷ lệ hoặc đè văn bản.
   - Không được để text bị tràn hoặc đè lên nhau giữa các cột trong bảng (sử dụng CSS `whitespace-nowrap truncate` kèm thẻ `title` để hiển thị đầy đủ khi di chuột).

4. **Trải nghiệm cuộn độc lập (Scroll Experience)**:
   - Khi thanh sidebar chứa quá nhiều danh mục, bắt buộc phải chia chiều cao tối đa của thanh sidebar theo viewport (`max-h-[calc(100vh-180px)]`) và cho phép cuộn độc lập, không ảnh hưởng đến cuộn của trang chính.
   - Đảm bảo thanh cuộn có thiết kế mỏng nhẹ, tinh tế (sử dụng lớp tiện ích `.custom-scrollbar`).
   - Tự động cuộn màn hình mượt mà (`smooth scroll`) lên đầu danh sách món ăn mỗi khi người dùng đổi danh mục.

---

## 3. QUY TẮC CODE BACKEND (NODE.JS / EXPRESS / MYSQL)

1. **Tách biệt Routes và Logic**:
   - `routes` chỉ chịu trách nhiệm định tuyến, kiểm tra xác thực (authentication middleware), và phân quyền (authorization).
   - Logic xử lý truy vấn SQL phức tạp nên được viết thành các hàm bất đồng bộ rõ ràng, kiểm soát lỗi bằng khối `try-catch` chặt chẽ.

2. **An toàn Cơ sở dữ liệu (Database Safety)**:
   - Sử dụng các câu lệnh tham số hóa (Parameterized queries) để ngăn chặn tấn công SQL Injection.
   - Khi cập nhật cấu trúc danh mục, cần đảm bảo tính toàn vẹn dữ liệu (sử dụng `FOREIGN KEY` hoặc xử lý cập nhật dây chuyền `ON UPDATE CASCADE`).

---

## 4. QUY TẮC THIẾT KẾ UI/UX (AESTHETICS & DESIGN)

1. **Thẩm mỹ Cao cấp & Hiện đại**:
   - Thiết kế giao diện phải mang tính hiện đại, sử dụng hiệu ứng phủ mờ kính (Glassmorphism), bảng màu sinh động (vibrant colors) và hỗ trợ giao diện Sáng/Tối (Light/Dark mode) nếu hệ thống yêu cầu.
   - Tránh sử dụng các màu sắc đơn điệu hoặc màu cơ bản thô cứng (đỏ, xanh lá, xanh dương thuần). Phải sử dụng các bảng màu phối hợp hài hòa (ví dụ: HSL hoặc các dải màu tối Sleek Dark Mode của dự án).
   - Tích hợp các phông chữ hiện đại từ Google Fonts (như *Inter*, *Roboto*, *Outfit*...) để thay thế phông chữ mặc định của trình duyệt.

2. **Tương tác Sinh động & Trực quan**:
   - Sử dụng các hiệu ứng chuyển động nhỏ (micro-animations) và các hiệu ứng khi di chuột (hover effects) mượt mà để tăng tính sinh động khi người dùng tương tác với nút bấm, thẻ món ăn, hoặc danh mục.

3. **Chân thực về mặt hình ảnh**:
   - Không được sử dụng hình ảnh giả (placeholder) hoặc dữ liệu giả (mock data) trên giao diện chạy chính thức.
   - Nếu cần hình ảnh minh họa cho các món ăn mới chưa có ảnh thực tế, bắt buộc phải sử dụng các công cụ sinh ảnh chuyên dụng hoặc chuẩn bị sẵn ảnh placeholder chất lượng cao của dự án.

---

## 5. QUY TẮC GIỮ GÌN MÃ NGUỒN VÀ BẢO TRÌ (CODE MAINTENANCE)

1. **Giữ gìn mã nguồn**:
   - **Tuyệt đối giữ nguyên** toàn bộ các đoạn chú thích (comments), tài liệu mã nguồn (docstrings) hoặc các đoạn mã cũ không liên quan trực tiếp đến nội dung thay đổi hiện tại.
   - Khi chỉnh sửa một chức năng, chỉ tác động đúng phạm vi được yêu cầu, tránh thay đổi cấu trúc của các module hoạt động độc lập khác.

2. **Tính dễ bảo trì (Maintainability)**:
   - Viết mã nguồn sạch (Clean Code), đặt tên biến/hàm mang tính gợi nhớ rõ ràng bằng tiếng Anh hoặc tiếng Việt nhất quán.
   - Luôn kiểm tra định dạng mã nguồn (Linter/Formatter) trước khi commit để đảm bảo tính đồng bộ trên toàn bộ dự án.

3. **Tính tuân thủ tuyệt đối (Absolute Compliance)**:
   - Tuân thủ tuyệt đối các quy tắc về độ dài file, quy định UI/UX, Flutter FontWeight (nếu áp dụng cho ứng dụng di động liên quan), và cấu trúc của NestJS/Next.js/Node.js trong repository.
   - Viết code hoàn chỉnh, không để lại code TODO, chú thích đánh dấu chưa hoàn thành hoặc hàm rỗng (no placeholders). Mọi chức năng khi triển khai phải được hoàn thiện đầy đủ.
