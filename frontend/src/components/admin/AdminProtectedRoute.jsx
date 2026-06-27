import { Navigate } from "react-router-dom";
import { checkLogin, getCurrentUser } from "../../utils/auth";

function AdminProtectedRoute({ children }) {
  const isLoggedIn = checkLogin();
  const currentUser = getCurrentUser();

  const allowedRoles = ["admin", "manager", "staff"];

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
