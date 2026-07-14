const getBackendUrl = () => {
  const hostname = window.location.hostname;
  // Nếu đang chạy local (localhost hoặc 127.0.0.1) thì giữ nguyên localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5001";
  }
  // Nếu truy cập từ thiết bị khác trong mạng LAN, tự động trỏ về IP của máy chủ chạy backend
  return `http://${hostname}:5001`;
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE_URL = `${BACKEND_URL}/api`;
