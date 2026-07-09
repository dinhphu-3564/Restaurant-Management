# Quy chuẩn & Đặc tả Kỹ thuật: Component Phân Trang Dùng Chung (GlobalPagination)

Tài liệu này quy định các tiêu chuẩn nghiệp vụ, thiết kế giao diện (UI/UX), đa ngôn ngữ và kiến trúc kỹ thuật của Component Phân Trang Dùng Chung (`GlobalPagination`) áp dụng thống nhất cho toàn bộ các màn hình danh sách, bảng dữ liệu trong hệ thống.

---

## 1. Bài toán Nghiệp vụ & Mục tiêu

### Bài toán
Trước đây, các màn hình danh sách tự xây dựng logic phân trang riêng lẻ dẫn đến trải nghiệm không đồng bộ (nhất là trên thiết bị di động), tốn tài nguyên phát triển và khó bảo trì các tính năng nâng cao như Dark Mode, đa ngôn ngữ hay đồng bộ URL.

### Mục tiêu (`GlobalPagination`)
*   **Giao diện Premium**: Font chữ rõ ràng, bố cục cân đối, hiệu ứng glassmorphism mờ nhẹ thích ứng mượt mà theo chế độ Light/Dark Theme.
*   **Tính năng hoàn chỉnh**: Hiển thị tổng số bản ghi và phạm vi dòng hiện tại, cho phép thay đổi Page Size (Limit), rút gọn trang thông minh bằng dấu ba chấm (`...`).
*   **Đồng bộ hóa URL không reload**: Tự động đồng bộ các tham số `?page=X&limit=Y` lên thanh địa chỉ của trình duyệt mà không kích hoạt tải lại trang cứng (Hard Reload), giữ nguyên vị trí cuộn.
*   **Zero Hydration Mismatch**: Chạy an toàn trong môi trường SSR của Next.js.
*   **Hiệu năng**: Phản hồi dưới 50ms ở client, ngăn chặn Double Request.

---

## 2. Bố cục Giao diện (UI/UX) & Responsive

### 2.1. Trên Desktop (Bản rộng)
Bố cục ngang phân tách rõ ràng thành 3 phần chính:
*   **Bên trái**: Thống kê số dòng đang hiển thị.
*   **Bên phải**: Bộ chọn số dòng trên mỗi trang (Limit Selector) kết hợp cụm nút điều hướng trang (First, Prev, Page Numbers, Next, Last).

```
+---------------------------------------------------------------------------------------------------------------+
| Hiển thị 11 - 20 trong số 125 kết quả  |  Hiển thị mỗi trang: [ 10 v ]  |  [<<]  [<]  [1]  [2] [3]  [>]  [>>] |
+----------------------------------------+--------------------------------+-------------------------------------+
```

### 2.2. Trên Mobile / Tablet (Bản thu gọn - Width < 768px)
Tự động chuyển sang bố cục dọc hoặc ẩn bớt các nút số cụ thể để tránh bấm nhầm và dễ thao tác bằng một tay:

```
+-------------------------------------------------------------+
| Hiển thị 11 - 20 trong tổng số 125 dòng                     | (Canh giữa)
+-------------------------------------------------------------+
| Mỗi trang: [ 10 v ]   |   [< Trước]  Trang 2 / 13  [Sau >]  | (Canh giữa / Flex wrap)
+-------------------------------------------------------------+
```

---

## 3. Quy chuẩn Giao diện & Trạng thái Tương tác

| Phần tử (Element) | Chế độ Sáng (Light Theme) | Chế độ Tối (Dark Theme) | CSS Class / Token |
| :--- | :--- | :--- | :--- |
| **Nền tổng thể** | Trắng đục mờ (`rgba(255, 255, 255, 0.8)`) | Tối nguyên khối mờ (`rgba(15, 17, 26, 0.7)`) | `.glass-panel` + `backdrop-filter: blur(12px)` |
| **Đường viền** | Xám nhạt (`rgba(229, 231, 235, 0.8)`) | Xám tối (`rgba(255, 255, 255, 0.08)`) | `1px solid var(--border-glass)` |
| **Màu chữ phụ** | Xám đậm (`#4b5563`) | Xám sáng dịu (`#9ca3af`) | `font-family: var(--font-body)` |
| **Nút số active** | Xanh lá (`#16af5a`) | Xanh lá (`#16af5a`) | Bo góc `8px`, Text trắng |
| **Nút thường hover** | Xám sáng (`#f3f4f6`) | Xám rất tối (`rgba(255, 255, 255, 0.05)`) | Bo góc `8px`, transition `200ms` |

*   **Trạng thái Vô hiệu hóa (Disabled)**: Khi ở trang đầu hoặc trang cuối, các nút điều hướng tương ứng sẽ bị mờ (`opacity: 0.4`), con trỏ chuột dạng `not-allowed` và không thể click.
*   **Trạng thái Đang tải (Loading)**: Khi đang gọi API lấy dữ liệu mới, toàn bộ component phân trang sẽ tạm khóa tương tác để ngăn chặn hành động click liên tiếp của người dùng (Double request mitigation).

---

## 4. Đặc tả Kỹ thuật & API Props (TypeScript)

### 4.1. Giao diện Props của Component
```typescript
interface GlobalPaginationProps {
  /** Tổng số lượng bản ghi trên hệ thống */
  total: number;
  
  /** Trang hiện tại (1-indexed) */
  page: number;
  
  /** Số bản ghi hiển thị trên mỗi trang (mặc định là 20) */
  limit: number;
  
  /** Sự kiện kích hoạt khi thay đổi trang */
  onPageChange: (page: number) => void;
  
  /** Sự kiện kích hoạt khi thay đổi số lượng bản ghi mỗi trang */
  onLimitChange?: (limit: number) => void;
  
  /** Trạng thái đang tải dữ liệu (sẽ vô hiệu hóa tương tác tạm thời) */
  isLoading?: boolean;
  
  /** Các mức tùy chọn số dòng hiển thị trên trang (mặc định: [10, 20, 50, 100, 200, 500]) */
  limitOptions?: number[];
  
  /** Tự động đồng bộ hóa trạng thái lên URL query parameter */
  syncToUrl?: boolean;
  
  /** Hiển thị ô nhảy trang nhanh */
  showQuickJump?: boolean;
}
```

### 4.2. Thuật toán chia dải trang (Ellipsis Logic)
Hàm custom hook `usePagination` chịu trách nhiệm chuyển đổi `currentPage`, `totalPages`, và `siblingCount` thành dải trang thích hợp:
*   Nếu `totalPages <= 7`: Trả về dải số đầy đủ từ `1` đến `totalPages`.
*   Nếu `totalPages > 7`:
    *   Trang hiện tại ở gần đầu dải: `[1, 2, 3, 4, 5, '...', totalPages]`
    *   Trang hiện tại ở gần cuối dải: `[1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]`
    *   Trang hiện tại ở giữa dải: `[1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]`

---

## 5. Chuẩn hóa & Bảo mật URL Query (Query Sanitization)

Khi lấy các tham số `page` và `limit` từ URL, phía Client phải thực hiện chuẩn hóa dữ liệu đầu vào để tránh crash giao diện hoặc tấn công DDoS tài nguyên cơ sở dữ liệu qua limit lớn:

```typescript
export function sanitizePaginationParams(
  urlPage: string | null,
  urlLimit: string | null,
  maxLimitAllowed = 500
) {
  let page = parseInt(urlPage || '1', 10);
  let limit = parseInt(urlLimit || '20', 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const allowedLimits = [10, 20, 50, 100, 200, 500];
  if (isNaN(limit) || !allowedLimits.includes(limit)) {
    if (limit > maxLimitAllowed) {
      limit = maxLimitAllowed;
    } else {
      limit = 20; // Giá trị mặc định
    }
  }

  return { page, limit };
}
```

---

## 6. Đa ngôn ngữ (i18n Localization)

Component tự động tra cứu trực tiếp qua hàm `t(key)` với cấu trúc động:

| Key dịch thuật | Giá trị hiển thị Tiếng Việt (`vi`) | Giá trị hiển thị Tiếng Anh (`en`) | Ví dụ hiển thị |
| :--- | :--- | :--- | :--- |
| `pagination.showing` | `Hiển thị` | `Showing` | **Hiển thị** 11 - 20... |
| `pagination.of` | `trong số` | `of` | ... 11 - 20 **trong số** 125... |
| `pagination.results` | `kết quả` | `results` | ... 125 **kết quả** |
| `pagination.perPage` | `Mỗi trang` | `Per page` | **Mỗi trang**: [ 10 ] |
| `pagination.prev` | `Trước` | `Prev` | `[< Trước]` / `[< Prev]` |
| `pagination.next` | `Sau` | `Next` | `[Sau >]` / `[Next >]` |
| `pagination.noData` | `Không có dữ liệu` | `No data available` | `Không có dữ liệu` |
