import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import MenuPage from "../pages/MenuPage";
import CartPage from "../pages/CartPage";
import ScrollToTop from "../components/ScrollToTop";
import CheckoutPage from "../pages/CheckoutPage";
import PaymentQRPage from "../pages/PaymentQRPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import ReservationPage from "../pages/ReservationPage";
import BookingSuccessPage from "../pages/BookingSuccessPage";
import BookingDetailPage from "../pages/BookingDetailPage";
import DealsPage from "../pages/DealsPage";
import DealDetailPage from "../pages/DealDetailPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

//Admin
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminProtectedRoute from "../components/admin/AdminProtectedRoute";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminMenuPage from "../pages/admin/AdminMenuPage";
import AdminDealsPage from "../pages/admin/AdminDealsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminRevenuePage from "../pages/admin/AdminRevenuePage";

function MainLayout({ children }) {
  const location = useLocation();

  const pathToPage = {
    "/": "home",
    "/home": "home",
    "/menu": "menu",
    "/cart": "cart",
    "/checkout": "cart",
    "/reservation": "reservation",
    "/deals": "deals",
    "/about": "about",
    "/contact": "contact",
    "/profile": "profile",
  };

  const currentPage = pathToPage[location.pathname] || "";

  return (
    <>
      <Header currentPage={currentPage} />
      <div className="h-16"></div>
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/home"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Menu */}
        <Route
          path="/menu"
          element={
            <MainLayout>
              <MenuPage />
            </MainLayout>
          }
        />
        {/* Giỏ hàng */}
        <Route
          path="/cart"
          element={
            <MainLayout>
              <CartPage />
            </MainLayout>
          }
        />
        {/* Hình thức phục vụ */}
        <Route
          path="/checkout"
          element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          }
        />
        {/* Thanh toán */}
        <Route
          path="/payment-qr"
          element={
            <MainLayout>
              <PaymentQRPage />
            </MainLayout>
          }
        />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route
          path="/profile/order-detail/:id"
          element={
            <MainLayout>
              <OrderDetailPage />
            </MainLayout>
          }
        />
        {/* Đạt bàn */}
        <Route
          path="/reservation"
          element={
            <MainLayout>
              <ReservationPage />
            </MainLayout>
          }
        />
        {/* Đặt bàn */}
        <Route
          path="/booking-success"
          element={
            <MainLayout>
              <BookingSuccessPage />
            </MainLayout>
          }
        />
        {/* Khuyến mãi */}
        <Route
          path="/deals"
          element={
            <MainLayout>
              <DealsPage />
            </MainLayout>
          }
        />
        {/* Khuyến mãi chi tiết */}
        <Route
          path="/deals/:dealId"
          element={
            <MainLayout>
              <DealDetailPage />
            </MainLayout>
          }
        />
        {/* Giới thiệu */}
        <Route
          path="/about"
          element={
            <MainLayout>
              <AboutPage />
            </MainLayout>
          }
        />
        {/* Liên hệ */}
        <Route
          path="/contact"
          element={
            <MainLayout>
              <ContactPage />
            </MainLayout>
          }
        />
        {/* Trang cá nhân */}
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
        {/* CHi tiết đặt bàn */}
        <Route
          path="/profile/booking-detail/:id"
          element={
            <MainLayout>
              <BookingDetailPage />
            </MainLayout>
          }
        />
        {/* 404 */}
        <Route
          path="*"
          element={
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          }
        />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="deals" element={<AdminDealsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
