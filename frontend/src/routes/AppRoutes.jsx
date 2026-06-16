import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

        <Route
          path="/menu"
          element={
            <MainLayout>
              <MenuPage />
            </MainLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <MainLayout>
              <CartPage />
            </MainLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          }
        />

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

        <Route
          path="/reservation"
          element={
            <MainLayout>
              <ReservationPage />
            </MainLayout>
          }
        />

        <Route
          path="/booking-success"
          element={
            <MainLayout>
              <BookingSuccessPage />
            </MainLayout>
          }
        />

        <Route
          path="/deals"
          element={
            <MainLayout>
              <DealsPage />
            </MainLayout>
          }
        />

        <Route
          path="/deals/:dealId"
          element={
            <MainLayout>
              <DealDetailPage />
            </MainLayout>
          }
        />

        <Route
          path="/about"
          element={
            <MainLayout>
              <AboutPage />
            </MainLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <MainLayout>
              <ContactPage />
            </MainLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />

        <Route
          path="/profile/booking-detail/:id"
          element={
            <MainLayout>
              <BookingDetailPage />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
