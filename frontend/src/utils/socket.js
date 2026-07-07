import { io } from "socket.io-client";

// Lấy URL backend (có thể cấu hình lại theo môi trường production)
const BACKEND_URL = "http://localhost:5001";

// Khởi tạo connection duy nhất
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
});
