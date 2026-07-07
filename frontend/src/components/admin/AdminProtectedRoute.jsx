import { Navigate, useLocation } from "react-router-dom";
import { checkLogin, getCurrentUser } from "../../utils/auth";
import { canAccessAdminRoute } from "../../utils/permissions";
import { showAdminToast } from "./AdminToast";

function AdminProtectedRoute({ children }) {
  const isLoggedIn = checkLogin();
  const currentUser = getCurrentUser();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // Nếu là user bình thường (khách hàng), không được vào admin, đẩy ra trang chủ
  if (currentUser?.role === "user") {
    return <Navigate to="/home" replace />;
  }

  // Kiểm tra quyền truy cập route cụ thể của admin
  if (!canAccessAdminRoute(currentUser, location.pathname)) {
    setTimeout(() => {
      showAdminToast({
        title: "Từ chối truy cập",
        message: "Bạn không có quyền truy cập chức năng này.",
        type: "error",
      });
    }, 100);

    // Đẩy về dashboard admin hoặc home tùy role
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
