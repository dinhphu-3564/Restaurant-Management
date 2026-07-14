import { io } from "socket.io-client";
import { BACKEND_URL } from "../config/api";

// Khởi tạo connection duy nhất
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
});
