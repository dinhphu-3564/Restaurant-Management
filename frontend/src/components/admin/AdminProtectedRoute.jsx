import { Navigate } from "react-router-dom";
import { checkLogin, getCurrentUser } from "../../utils/auth";

function AdminProtectedRoute({ children }) {
  const isLoggedIn = checkLogin();
  const currentUser = getCurrentUser();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (currentUser?.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
