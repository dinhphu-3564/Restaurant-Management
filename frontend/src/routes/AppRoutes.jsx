import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import MenuPage from "../pages/MenuPage";
import CartPage from "../pages/CartPage";
import ScrollToTop from "../components/ScrollToTop";
import CheckoutPage from "../pages/CheckoutPage";
import PaymentQRPage from "../pages/PaymentQRPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import ReservationPage from "../pages/ReservationPage";
import BookingSuccessPage from "../pages/BookingSuccessPage";
import DealsPage from "../pages/DealsPage";
import DealDetailPage from "../pages/DealDetailPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-qr" element={<PaymentQRPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
