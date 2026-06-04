import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  ShoppingCart,
  User,
  UserRound,
  ClipboardList,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  MapPin,
  Phone,
  Clock,
  CalendarDays,
  ShieldCheck,
  Truck,
  Store,
  Utensils,
  Trash2,
} from "lucide-react";

function CheckoutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);
  const navigate = useNavigate();

  const [serviceType, setServiceType] = useState("dinein");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryTimeType, setDeliveryTimeType] = useState("now");

  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + "đ";
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // tính tổng tiền tạm tính
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  // tính tổng số lượng món
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  //trừ đi các ưu đãi nếu có
  const discountRules = [
    {
      id: 1,
      title: "Hóa đơn trên 2.000.000đ",
      percent: 5,
      condition: subtotal >= 2000000,
    },
  ];
  // Hiển thị thông báo khi xóa món ăn
  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  const discountTotal = discountRules
    .filter((rule) => rule.condition)
    .reduce((sum, rule) => sum + (subtotal * rule.percent) / 100, 0);

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

  const validateOrder = () => {
    const newErrors = {};

    const name = document.querySelector('input[name="name"]')?.value.trim();
    const phone = document.querySelector('input[name="phone"]')?.value.trim();
    const date = document.querySelector('input[name="date"]')?.value;
    const time = document.querySelector('input[name="time"]')?.value;
    const guests = document.querySelector('input[name="guests"]')?.value;
    const address = document
      .querySelector('input[name="address"]')
      ?.value.trim();

    const needDateTime =
      serviceType !== "delivery" || deliveryTimeType === "schedule";

    if (!name) {
      newErrors.name =
        serviceType === "pickup"
          ? "Vui lòng nhập tên người lấy"
          : serviceType === "delivery"
            ? "Vui lòng nhập tên người nhận"
            : "Vui lòng nhập họ và tên";
    }

    if (!phoneRegex.test(phone || "")) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (serviceType === "dinein" && (!guests || Number(guests) <= 0)) {
      newErrors.guests = "Vui lòng nhập số lượng khách";
    }

    if (serviceType === "delivery" && !address) {
      newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    }

    if (needDateTime && !date) {
      newErrors.date = "Vui lòng chọn ngày";
    }

    if (needDateTime && !time) {
      newErrors.time = "Vui lòng chọn giờ";
    }

    if (needDateTime && date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();

      const selectedDateOnly = new Date(`${date}T00:00`);
      const todayOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      if (selectedDateOnly < todayOnly) {
        newErrors.date = "Ngày phải lớn hơn hoặc bằng hôm nay";
      } else if (selectedDateTime <= now) {
        newErrors.time = "Giờ phải lớn hơn thời gian hiện tại";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const shippingFee = serviceType === "delivery" ? 15000 : 0;
  const total = subtotal - discountTotal + shippingFee;
  // Kiểm tra trạng thái đăng nhập khi component được mount
  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Hàm xóa món trong checkout và thông báo khi xóa
  const removeCheckoutItem = (id) => {
    const removedItem = cartItems.find((item) => item.id === id);
    const newCartItems = cartItems.filter((item) => item.id !== id);

    localStorage.setItem("cartItems", JSON.stringify(newCartItems));

    setToast({
      show: true,
      message: `Đã xóa "${removedItem?.name}" khỏi đơn hàng`,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
      });

      window.location.reload();
    }, 3000);
  };
  // Hàm cập nhật số lượng món trong checkout
  const updateCheckoutQty = (id, type) => {
    const newCartItems = cartItems.map((item) =>
      item.id === id
        ? {
            ...item,
            qty: type === "increase" ? item.qty + 1 : Math.max(1, item.qty - 1),
          }
        : item,
    );

    localStorage.setItem("cartItems", JSON.stringify(newCartItems));

    window.location.reload();
  };
  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
          <Link
            to="/home"
            onClick={scrollToTop}
            className="flex items-center gap-2"
          >
            <Leaf className="w-8 h-8 text-green-800" />
            <div>
              <h1 className="font-bold text-green-800 leading-4">
                Dê Hương Sơn
              </h1>
              <p className="text-xs text-green-700 font-medium">HÀ TĨNH</p>
            </div>
          </Link>

          <nav className="hidden lg:flex gap-8 text-sm font-semibold">
            <Link to="/home">Trang chủ</Link>
            <Link to="/menu">Thực đơn</Link>
            <Link to="/reservation">Đặt bàn</Link>
            <Link to="/deals">Khuyến mãi</Link>
            <Link to="/about">Giới thiệu</Link>
            <Link to="/contact">Liên hệ</Link>
          </nav>

          <div className="hidden md:flex gap-3">
            {isLoggedIn ? (
              <div
                ref={profileMenuRef}
                className="relative flex items-center gap-3"
              >
                <Link
                  to="/cart"
                  className="relative text-green-900 flex flex-col items-center"
                >
                  <ShoppingCart className="w-5 h-5" />

                  <span className="absolute -top-5 -right-4 min-w-[22px] h-[22px] px-1.5 bg-red-600 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                    {totalQty}
                  </span>

                  <span className="absolute -bottom-4 w-8 h-[2px] bg-green-800 rounded-full"></span>
                </Link>

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-11 h-11 rounded-full bg-green-50 text-green-800 flex items-center justify-center border border-green-700 hover:bg-green-100 transition"
                >
                  <User className="w-6 h-6" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999]">
                    <Link
                      to="/profile"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <UserRound className="w-5 h-5" />
                      Thông tin tài khoản
                    </Link>

                    <Link
                      to="/order-history"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <ClipboardList className="w-5 h-5" />
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      to="/my-booking"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      Đặt bàn của tôi
                    </Link>

                    <button
                      onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        setIsLoggedIn(false);
                        setIsProfileOpen(false);
                        navigate("/home");
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 text-red-600 font-medium border-t"
                    >
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border border-green-800 text-green-800 px-5 py-2 rounded-lg font-semibold hover:bg-green-50"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="bg-green-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-green-900"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg border border-green-800 text-green-800 flex items-center justify-center"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* MENU MOBILE */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-md">
            <nav className="px-5 py-4 flex flex-col gap-4 text-sm font-semibold text-green-950">
              <Link onClick={() => setIsMenuOpen(false)} to="/home">
                Trang chủ
              </Link>

              <Link onClick={() => setIsMenuOpen(false)} to="/menu">
                Thực đơn
              </Link>

              <Link onClick={() => setIsMenuOpen(false)} to="/reservation">
                Đặt bàn
              </Link>

              <Link onClick={() => setIsMenuOpen(false)} to="/deals">
                Khuyến mãi
              </Link>

              <Link onClick={() => setIsMenuOpen(false)} to="/about">
                Giới thiệu
              </Link>

              <Link onClick={() => setIsMenuOpen(false)} to="/contact">
                Liên hệ
              </Link>

              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <Link
                  onClick={() => setIsMenuOpen(false)}
                  to="/cart"
                  className="relative w-11 h-11 rounded-xl bg-green-50 text-green-800 border border-green-100 flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5" />

                  {totalQty > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-red-600 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                      {totalQty}
                    </span>
                  )}
                </Link>

                {isLoggedIn ? (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-11 h-11 rounded-xl bg-green-50 text-green-800 border border-green-100 flex items-center justify-center"
                  >
                    <User className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <Link
                      onClick={() => setIsMenuOpen(false)}
                      to="/login"
                      className="flex-1 border border-green-800 text-green-800 px-4 py-2.5 rounded-lg font-semibold text-center"
                    >
                      Đăng nhập
                    </Link>

                    <Link
                      onClick={() => setIsMenuOpen(false)}
                      to="/register"
                      className="flex-1 bg-green-800 text-white px-4 py-2.5 rounded-lg font-semibold text-center"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="max-w-[1500px] mx-auto px-3 md:px-6 py-5 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-black text-green-900">
            Thanh toán
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Link to="/home" className="hover:text-green-800">
              Trang chủ
            </Link>
            <span>›</span>
            <Link to="/cart" className="hover:text-green-800">
              Giỏ hàng
            </Link>
            <span>›</span>
            <span className="text-green-900 font-medium">Thanh toán</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-5 items-start">
          {/* LEFT */}
          <section className="space-y-5">
            {/* 1. CHỌN HÌNH THỨC */}
            <div className="bg-white border border-[#eadfcd] rounded-2xl p-5 shadow-sm">
              <h2 className="font-black text-green-950 mb-4">
                1. CHỌN HÌNH THỨC PHỤC VỤ
              </h2>

              <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
                <ServiceCard
                  active={serviceType === "dinein"}
                  icon={<Utensils className="w-full h-full" />}
                  title="Ăn tại quán"
                  subtitle="Dine In"
                  text="Đặt bàn trước, chúng tôi sẽ chuẩn bị món ngon cho bạn."
                  onClick={() => setServiceType("dinein")}
                />

                <ServiceCard
                  active={serviceType === "delivery"}
                  icon={<Truck className="w-full h-full" />}
                  title="Giao tận nơi"
                  subtitle="Delivery"
                  text="Giao món tận nơi nhanh chóng, nóng hổi."
                  onClick={() => setServiceType("delivery")}
                />

                <ServiceCard
                  active={serviceType === "pickup"}
                  icon={<Store className="w-full h-full" />}
                  title="Đến lấy tại quán"
                  subtitle="Pickup / Take Away"
                  text="Đặt trước, đến lấy tại quán, không cần chờ lâu."
                  onClick={() => setServiceType("pickup")}
                />
              </div>
            </div>
            {/* // Hiển thị form tương ứng với hình thức đã chọn */}
            {serviceType === "dinein" && <DineInForm errors={errors} />}
            {serviceType === "delivery" && (
              <DeliveryForm
                errors={errors}
                deliveryTimeType={deliveryTimeType}
                setDeliveryTimeType={setDeliveryTimeType}
              />
            )}
            {serviceType === "pickup" && <PickupForm errors={errors} />}

            {serviceType !== "dinein" && (
              <div className="bg-white border border-[#eadfcd] rounded-2xl p-5 shadow-sm">
                <h2 className="font-black text-green-950 mb-4">
                  3. PHƯƠNG THỨC THANH TOÁN
                </h2>

                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`rounded-xl border p-4 text-left font-bold ${
                      paymentMethod === "cash"
                        ? "border-green-800 bg-green-50 text-green-900"
                        : "border-[#eadfcd]"
                    }`}
                  >
                    Thanh toán khi nhận món
                  </button>

                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`rounded-xl border p-4 text-left font-bold ${
                      paymentMethod === "bank"
                        ? "border-green-800 bg-green-50 text-green-900"
                        : "border-[#eadfcd]"
                    }`}
                  >
                    Chuyển khoản ngân hàng / QR
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT */}
          <aside className="bg-white border border-[#eadfcd] rounded-2xl p-4 md:p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#eadfcd]">
              <h2 className="font-black text-green-950 text-lg md:text-xl">
                ĐƠN HÀNG CỦA BẠN
              </h2>

              <span className="text-xs font-bold text-green-800 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                {totalItems} món
              </span>
            </div>

            <div className="max-h-[380px] md:max-h-[430px] overflow-y-auto pr-2 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#cfe3d4_transparent]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-4 border-b border-[#f1e7d7] last:border-b-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-3 items-start">
                        <h3 className="font-black text-sm text-green-900 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="font-black text-[#c99a45] text-sm shrink-0">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-4 border border-[#eadfcd] rounded-lg px-3 py-1 text-sm font-black">
                          <button
                            onClick={() =>
                              updateCheckoutQty(item.id, "decrease")
                            }
                            className="text-green-900 hover:text-red-600"
                          >
                            -
                          </button>

                          <b>{item.qty}</b>

                          <button
                            onClick={() =>
                              updateCheckoutQty(item.id, "increase")
                            }
                            className="text-green-900 hover:text-green-700"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeCheckoutItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#eadfcd] mt-5 pt-5 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black text-green-900">
                    Tạm tính ({totalItems} món)
                  </p>
                </div>

                <b className="font-black text-green-900">
                  {formatPrice(subtotal)}
                </b>
              </div>

              <div className="flex justify-between">
                <span>
                  {serviceType === "delivery"
                    ? "Phí giao hàng"
                    : "Phí lấy hàng"}
                </span>
                <b>{formatPrice(shippingFee)}</b>
              </div>

              <div className="flex justify-between">
                <span>Giảm giá</span>
                <b className="text-green-800">- {formatPrice(discountTotal)}</b>
              </div>
            </div>

            <div className="border-t border-[#eadfcd] mt-5 pt-5 flex justify-between items-center">
              <span className="font-black">Tổng cộng</span>
              <span className="text-2xl md:text-3xl font-black text-green-900">
                {formatPrice(total)}
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm text-gray-600 mt-4">
              <ShieldCheck className="w-5 h-5 text-green-800" />
              Giá đã bao gồm VAT
            </p>

            <button
              onClick={() => {
                if (cartItems.length === 0) {
                  setShowEmptyCartModal(true);
                  return;
                }

                if (!validateOrder()) return;

                const orderData = {
                  cartItems,
                  serviceType,
                  deliveryTimeType,
                  paymentMethod:
                    serviceType === "dinein" ? "pay_after_meal" : paymentMethod,
                  subtotal,
                  discountTotal,
                  shippingFee,
                  total,
                  createdAt: new Date().toISOString(),
                };

                localStorage.setItem("currentOrder", JSON.stringify(orderData));

                if (serviceType === "dinein") {
                  const bookingData = {
                    id: Date.now(),
                    source: "checkout_page",
                    type: "table_with_order",
                    cartItems,
                    subtotal,
                    total,
                    status: "pending",
                    createdAt: new Date().toISOString(),
                  };

                  const oldBookings =
                    JSON.parse(localStorage.getItem("bookings")) || [];

                  localStorage.setItem(
                    "bookings",
                    JSON.stringify([bookingData, ...oldBookings]),
                  );

                  localStorage.setItem(
                    "currentBooking",
                    JSON.stringify(bookingData),
                  );

                  navigate("/booking-success");
                  return;
                }

                if (paymentMethod === "bank") {
                  navigate("/payment-qr");
                } else {
                  navigate("/order-success");
                }
              }}
              className={`mt-6 w-full h-12 md:h-14 rounded-xl font-black transition-all ${
                cartItems.length === 0
                  ? "bg-[#c8ccd4] text-[#6b7280] cursor-pointer"
                  : "bg-green-800 hover:bg-green-900 text-white shadow-md"
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              {serviceType === "dinein"
                ? "XÁC NHẬN ĐẶT BÀN"
                : "XÁC NHẬN & THANH TOÁN"}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="mt-3 w-full h-11 md:h-12 rounded-lg border border-[#d7c8ae] text-green-900 font-black hover:bg-green-50"
            >
              ← QUAY LẠI GIỎ HÀNG
            </button>
          </aside>
        </div>
      </main>
      {/* FOOTER */}
      <footer className="bg-green-950 text-white overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-5 py-7 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div>
            <Link
              to="/home"
              onClick={scrollToTop}
              className="flex items-center gap-2 mb-3"
            >
              <Leaf className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold leading-5">Dê Hương Sơn</h3>
                <p className="text-sm text-white/70">Hà Tĩnh</p>
              </div>
            </Link>

            <p className="text-white/75 text-sm leading-relaxed mb-2 md:mb-5 max-w-xs">
              Dê núi Hương Sơn – đậm đà bản sắc, tươi ngon, bổ dưỡng.
            </p>
          </div>

          <div className="pl-2">
            <h3 className="font-bold text-lg mb-3 md:mb-5">
              Thông tin liên hệ
            </h3>

            <div className="space-y-2 text-white/75 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-1 text-white shrink-0" />
                <p>
                  Thị trấn Phố Châu, <br />
                  Hương Sơn, Hà Tĩnh
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 mt-1 text-white shrink-0" />
                <p>
                  038 713 6878
                  <br />
                  076 877 4619
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-white">
                  ✉
                </span>
                <p>dehuongson.ht@gmail.com</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 md:mb-5">Giờ mở cửa</h3>

            <div className="flex items-center gap-3 text-white/75 text-sm leading-7">
              <Clock className="w-5 h-5 text-white shrink-0" />
              <div>
                <p>08:00 - 22:00</p>
                <p>Tất cả các ngày trong tuần</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-5">Kết nối với chúng tôi</h3>

            <div className="flex gap-4 items-center justify-center">
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/1280px-2021_Facebook_icon.svg.png"
                  alt="facebook"
                  className="w-5 h-5"
                />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                  alt="zalo"
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-5">Bản đồ</h3>
            <div className="h-40 bg-white/15 rounded-2xl flex items-center justify-center text-white/80 text-sm">
              Khu vực bản đồ
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 text-center py-3 text-xs md:text-sm text-white/60">
          © 2026 Dê Hương Sơn Hà Tĩnh. All rights reserved.
        </div>
      </footer>
      {showEmptyCartModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#fbf0dc] text-[#c99a45] flex items-center justify-center mx-auto">
              <ShoppingCart className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-green-950 mt-5">
              Giỏ hàng đang trống
            </h2>

            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Bạn chưa có món ăn nào trong giỏ hàng.
              <br />
              Hãy chọn món trước khi tiến hành thanh toán nhé.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <button
                onClick={() => setShowEmptyCartModal(false)}
                className="h-12 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-100"
              >
                Đóng
              </button>

              <button
                onClick={() => navigate("/menu")}
                className="h-12 rounded-xl bg-green-900 text-white font-bold hover:bg-green-950"
              >
                Xem thực đơn
              </button>
            </div>
          </div>
        </div>
      )}
      // Component hiển thị thông báo khi xóa món ăn khỏi checkout
      {toast.show && (
        <div className="fixed top-20 right-5 z-[9999]">
          <div className="bg-white border border-[#eadfcd] shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 w-[330px] max-w-[calc(100vw-32px)]">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>

            <div>
              <p className="font-black text-green-900">Đã xóa món ăn</p>

              <p className="text-sm text-green-800">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ active, icon, title, subtitle, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border px-2 py-3 md:p-5 text-center transition-all ${
        active
          ? "border-green-800 bg-green-50 shadow-sm"
          : "border-[#eadfcd] bg-white"
      }`}
    >
      <div
        className={`mx-auto w-9 h-9 md:w-24 md:h-24 rounded-full flex items-center justify-center ${
          active ? "bg-green-100" : "bg-[#fbf0dc]"
        }`}
      >
        <div
          className={`w-5 h-5 md:w-14 md:h-14 ${
            active ? "text-green-800" : "text-[#c99a45]"
          }`}
        >
          {icon}
        </div>
      </div>

      <h3 className="font-black text-green-900 text-[12px] md:text-xl mt-2 md:mt-5 leading-tight">
        {title}
      </h3>

      <p className="font-bold text-gray-500 text-[10px] md:text-base mt-0.5">
        {subtitle}
      </p>

      <p className="hidden md:block text-sm text-gray-500 mt-5 leading-relaxed">
        {text}
      </p>

      {active && (
        <div className="absolute top-2 right-2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-green-800 flex items-center justify-center">
          <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white"></span>
        </div>
      )}
    </button>
  );
}
function DineInForm({ errors }) {
  return (
    <div className="bg-white border border-[#eadfcd] rounded-2xl p-4 md:p-5 shadow-sm">
      <h2 className="font-black text-green-950 text-xl md:text-2xl mb-4">
        2. THÔNG TIN ĐẶT BÀN
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
        <Input
          label="Ngày đặt bàn"
          name="date"
          type="date"
          icon={<CalendarDays />}
          error={errors.date}
        />

        <Input
          label="Giờ đến"
          name="time"
          type="time"
          icon={<Clock />}
          error={errors.time}
        />

        <Input
          label="Số lượng khách"
          name="guests"
          type="number"
          placeholder="Ví dụ: 6"
          error={errors.guests}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Input
          label="Họ và tên"
          name="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          error={errors.name}
        />

        <Input
          label="Số điện thoại"
          name="phone"
          placeholder="Ví dụ: 0901234567"
          error={errors.phone}
        />
      </div>

      <div className="mt-4">
        <Textarea label="Ghi chú / Yêu cầu đặc biệt" />
      </div>
    </div>
  );
}
function PickupForm({ errors }) {
  return (
    <div className="bg-white border border-[#eadfcd] rounded-2xl p-5 shadow-sm">
      <h2 className="font-black text-green-950 text-xl md:text-2xl mb-4">
        2. THÔNG TIN LẤY HÀNG
      </h2>

      <p className="font-bold text-sm mb-3">Thời gian đến lấy</p>

      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <Input
          name="date"
          type="date"
          icon={<CalendarDays />}
          error={errors.date}
        />
        <Input name="time" type="time" icon={<Clock />} error={errors.time} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Input
          label="Tên người lấy"
          name="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          error={errors.name}
        />
        <Input
          label="Số điện thoại"
          name="phone"
          placeholder="Ví dụ: 0901234567"
          error={errors.phone}
        />
      </div>

      <div className="mt-4">
        <Textarea label="Ghi chú (nếu có)" />
      </div>

      <div className="mt-3 bg-[#fbf0dc] rounded-xl p-3 text-xs md:text-sm">
        <b className="text-green-900">Lưu ý:</b> Vui lòng đến đúng giờ đã chọn.
        Nhà hàng sẽ chuẩn bị món theo thời gian bạn đặt.
      </div>
    </div>
  );
}

function DeliveryForm({ errors, deliveryTimeType, setDeliveryTimeType }) {
  return (
    <div className="bg-white border border-[#eadfcd] rounded-2xl p-4 md:p-5 shadow-sm">
      <h2 className="font-black text-green-950 text-xl md:text-2xl mb-4">
        2. THÔNG TIN GIAO HÀNG
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
        <Input
          label="Người nhận"
          name="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          error={errors.name}
        />
        <Input
          label="Số điện thoại"
          name="phone"
          placeholder="Ví dụ: 0901234567"
          error={errors.phone}
        />
      </div>

      <div className="mt-4">
        <Input
          label="Địa chỉ giao hàng"
          name="address"
          placeholder="Ví dụ: 123 Đường Lê Lợi, TP. Hà Tĩnh"
          error={errors.address}
        />
      </div>

      <div className="mt-4">
        <p className="font-bold text-xs md:text-sm mb-1">Thời gian giao hàng</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDeliveryTimeType("now")}
            className={`rounded-xl p-3 border transition ${
              deliveryTimeType === "now"
                ? "bg-green-50 text-green-900 border-green-800"
                : "bg-white border-[#eadfcd] text-green-900"
            }`}
          >
            <Truck className="w-5 h-5 mx-auto mb-1" />

            <p className="font-bold text-sm">Giao ngay</p>

            <p
              className={`text-[11px] mt-1 ${
                deliveryTimeType === "now" ? "text-white/80" : "text-gray-500"
              }`}
            >
              30 - 40 phút
            </p>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryTimeType("schedule")}
            className={`rounded-xl p-3 border transition ${
              deliveryTimeType === "schedule"
                ? "bg-green-50 text-green-900 border-green-800"
                : "bg-white border-[#eadfcd] text-green-900"
            }`}
          >
            <Clock className="w-5 h-5 mx-auto mb-1" />

            <p className="font-bold text-sm">Đặt lịch</p>

            <p
              className={`text-[11px] mt-1 ${
                deliveryTimeType === "schedule"
                  ? "text-white/80"
                  : "text-gray-500"
              }`}
            >
              Chọn ngày giờ
            </p>
          </button>
        </div>
      </div>

      {deliveryTimeType === "schedule" && (
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <Input
            label="Ngày giao hàng"
            name="date"
            type="date"
            icon={<CalendarDays />}
            error={errors.date}
          />

          <Input
            label="Giờ giao hàng"
            name="time"
            type="time"
            icon={<Clock />}
            error={errors.time}
          />
        </div>
      )}

      <div className="mt-4">
        <Textarea label="Ghi chú giao hàng (nếu có)" />
      </div>

      <div className="mt-4 bg-[#fbf0dc] rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 md:w-8 md:h-8 text-[#c99a45]" />
          <div>
            <p className="font-bold text-xs md:text-base">
              {deliveryTimeType === "now"
                ? "Thời gian giao dự kiến"
                : "Giao theo lịch đã chọn"}
            </p>
            <p className="text-base md:text-xl font-black text-green-900">
              {deliveryTimeType === "now"
                ? "30 - 40 phút"
                : "Theo thời gian đặt"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs md:text-sm text-gray-500">Khoảng cách</p>
          <p className="text-base md:text-xl font-black text-green-900">
            3.2 km
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  defaultValue,
  placeholder,
  icon,
  name,
  type = "text",
  error,
}) {
  return (
    <label className="block">
      {label && <p className="font-bold text-xs md:text-sm mb-1.5">{label}</p>}

      <div
        className={`h-11 md:h-12 rounded-lg px-3 md:px-4 flex items-center gap-2 bg-white border overflow-hidden ${
          error ? "border-red-500" : "border-[#eadfcd]"
        }`}
      >
        {icon && (
          <span className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-green-900/60 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
            {icon}
          </span>
        )}

        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full min-w-0 outline-none bg-transparent text-sm md:text-base text-green-950 placeholder:text-[#8b978f] placeholder:font-normal"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </label>
  );
}

function Textarea({ label }) {
  return (
    <label className="block">
      <p className="font-bold text-xs md:text-sm mb-1">{label}</p>

      <textarea
        maxLength={200}
        placeholder="Ví dụ: Gọi trước khi giao, không giao giờ nghỉ trưa..."
        className="w-full h-16 md:h-20 border border-[#eadfcd] rounded-lg p-4 outline-none text-sm resize-none"
      ></textarea>
    </label>
  );
}

export default CheckoutPage;
