# Công nghệ và Công cụ sử dụng trong Dự án Quản lý Nhà hàng

Dựa trên mã nguồn của dự án (frontend, backend, database và docker), dưới đây là danh sách chi tiết các công cụ, công nghệ, ngôn ngữ và thư viện đang được áp dụng:

## 1. Hệ thống chung & Triển khai
- **Ngôn ngữ lập trình chính**: JavaScript (JS/JSX)
- **Môi trường chạy (Runtime)**: Node.js (Backend), Trình duyệt (Frontend)
- **Containerization**: Docker & Docker Compose (Quản lý các service CSDL như MySQL, phpMyAdmin)
- **Quản lý phiên bản**: Git

## 2. Frontend (Giao diện người dùng)
- **Thư viện chính**: React (v19)
- **Công cụ Build**: Vite
- **Styling**: Tailwind CSS (v4)
- **Định tuyến (Routing)**: React Router DOM (v7)
- **Real-time**: Socket.IO Client
- **Các tính năng & Thư viện phụ trợ**:
  - Kéo thả (Drag & Drop): `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - Sliders/Carousel: `swiper`
  - Dịch vụ đám mây: `firebase` (Client SDK)
  - Icons: `lucide-react`, `react-icons`
  - Xuất file báo cáo: `xlsx-js-style`, `file-saver`
  - Công cụ kiểm tra mã (Linting): ESLint

## 3. Backend (Máy chủ API)
- **Framework chính**: Express.js (v5)
- **Kết nối CSDL**: `mysql2`
- **Real-time**: Socket.IO
- **Bảo mật và Xác thực**:
  - `jsonwebtoken`: Xác thực người dùng qua JWT.
  - `bcryptjs`: Mã hóa và băm mật khẩu.
  - `cors`: Hỗ trợ bảo mật nguồn gốc (Cross-Origin Resource Sharing).
- **Dịch vụ & Tích hợp**:
  - `firebase-admin`: Tích hợp Firebase Server-side.
  - `nodemailer`: Dịch vụ gửi email.
- **Xử lý Tệp tin**: `multer` (Xử lý upload ảnh/tài liệu)
- **Tiện ích hệ thống**: `dotenv` (Biến môi trường), `crypto`
- **Công cụ phát triển**: Nodemon, ESLint, Prettier

## 4. Database (Cơ sở dữ liệu)
- **Hệ quản trị CSDL**: MySQL (v8.4) chạy trên Docker.
- **Công cụ quản lý trực quan**: phpMyAdmin (truy cập qua port 8080).
- **Kiến trúc**: Dữ liệu được cấu hình giữ lại vĩnh viễn (persistent) qua Docker Volume `mysql_data`.
