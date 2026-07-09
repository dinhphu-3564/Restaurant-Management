import { checkLogin } from "../utils/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Clock,
  CalendarDays,
  ShieldCheck,
  Truck,
  Store,
  Utensils,
  Trash2,
} from "lucide-react";
import {
  ServiceCard,
  DineInForm,
  PickupForm,
  DeliveryForm
} from "../components/checkout/CheckoutSubComponents";

function CheckoutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);

  const [lockedAccountModal, setLockedAccountModal] = useState({
    open: false,
    message: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = "http://localhost:5001";

  const navigate = useNavigate();
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser")) ||
    {};

  const getAuthToken = () => {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  };

  const savedCheckoutForm =
    JSON.parse(localStorage.getItem("checkoutForm")) || {};

  const [checkoutForm, setCheckoutForm] = useState({
    name: savedCheckoutForm.name || "",
    phone: savedCheckoutForm.phone || "",
    address: savedCheckoutForm.address || "",
    date: savedCheckoutForm.date || "",
    time: savedCheckoutForm.time || "",
    guests: savedCheckoutForm.guests || "",
    note: savedCheckoutForm.note || "",
  });

  const [serviceType, setServiceType] = useState(
    savedCheckoutForm.serviceType || "dinein",
  );

  const [deliveryTimeType, setDeliveryTimeType] = useState(
    savedCheckoutForm.deliveryTimeType || "now",
  );

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const normalizeMoney = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const number = Number(String(value || "").replace(/[^\d]/g, ""));

    return Number.isFinite(number) ? number : 0;
  };

  // Tính tổng tiền tạm tính
  const subtotal = cartItems.reduce(
    (sum, item) => sum + normalizeMoney(item.price) * Number(item.qty || 1),
    0,
  );

  const checkoutSummary =
    JSON.parse(localStorage.getItem("checkoutSummary")) || null;
  const savedCoupon = checkoutSummary?.appliedCoupon || null;

  const SERVICE_TYPE_LABELS = {
    dinein: "Ăn tại quán",
    delivery: "Giao tận nơi",
    pickup: "Đến lấy tại quán",
  };

  const couponServiceTypes = Array.isArray(savedCoupon?.serviceTypes)
    ? savedCoupon.serviceTypes
    : [];

  const isCouponServiceValid =
    savedCoupon && couponServiceTypes.includes(serviceType);

  const isCouponMinOrderValid =
    savedCoupon && subtotal >= Number(savedCoupon.minOrder || 0);

  const autoDiscountRule = checkoutSummary?.autoDiscountRule || {
    title: "Hóa đơn trên 2.000.000đ",
    percent: 5,
    minOrder: 2000000,
    serviceTypes: ["dinein"],
  };

  // Chỉ áp dụng mã nếu mã đó hỗ trợ hình thức phục vụ đang chọn
  const appliedCoupon =
    savedCoupon && isCouponServiceValid && isCouponMinOrderValid
      ? savedCoupon
      : null;
  // Tự động giảm giá
  const canUseAutoDiscount =
    !appliedCoupon &&
    subtotal >= autoDiscountRule.minOrder &&
    autoDiscountRule.serviceTypes.includes(serviceType);

  const autoDiscountTotal = canUseAutoDiscount
    ? (subtotal * autoDiscountRule.percent) / 100
    : 0;

  const rawCouponDiscountTotal = appliedCoupon
    ? appliedCoupon.discountType === "fixed"
      ? appliedCoupon.amount
      : (subtotal * appliedCoupon.percent) / 100
    : 0;

  const couponDiscountTotal = Math.min(rawCouponDiscountTotal, subtotal);

  const discountTotal = appliedCoupon ? couponDiscountTotal : autoDiscountTotal;

  // tính tổng số lượng món
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  const validateOrder = () => {
    const newErrors = {};
    const name = checkoutForm.name.trim();
    const phone = checkoutForm.phone.trim();
    const date = checkoutForm.date;
    const time = checkoutForm.time;
    const guests = checkoutForm.guests;
    const address = checkoutForm.address.trim();

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
      newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)";
    }

    if (serviceType === "dinein" && (!guests || Number(guests) <= 0)) {
      newErrors.guests = "Vui lòng nhập số lượng khách";
    }

    if (serviceType === "delivery" && !address) {
      newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    }
    // kiểm tra thời gian giao hàng
    if (serviceType === "delivery" && deliveryTimeType === "now") {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const openMinutes = 8 * 60; // 08:00
      const closeMinutes = 22 * 60; // 22:00

      if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
        newErrors.deliveryTime =
          "Hiện tại ngoài giờ hoạt động. Nhà hàng chỉ giao từ 08:00 đến 22:00";
      }
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

      const [hour, minute] = time.split(":").map(Number);
      const selectedMinutes = hour * 60 + minute;

      const openMinutes = 8 * 60; // 08:00
      const closeMinutes = 22 * 60; // 22:00

      if (selectedDateOnly < todayOnly) {
        newErrors.date = "Ngày phải lớn hơn hoặc bằng hôm nay";
      } else if (selectedDateTime <= now) {
        newErrors.time = "Giờ phải lớn hơn thời gian hiện tại";
      } else if (
        selectedMinutes < openMinutes ||
        selectedMinutes > closeMinutes
      ) {
        newErrors.time = "Nhà hàng chỉ nhận đặt lịch từ 08:00 đến 22:00";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const shippingFee = serviceType === "delivery" ? 15000 : 0;
  const total = subtotal - discountTotal + shippingFee;

  // Kiểm tra trạng thái đăng nhập khi component được mount
  useEffect(() => {
    setIsLoggedIn(checkLogin());
  }, []);

  //lưu giỏ hàng
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems]);

  //hàm lưu / xóa form
  const saveCheckoutForm = (newForm) => {
    setCheckoutForm(newForm);
    localStorage.setItem("checkoutForm", JSON.stringify(newForm));
  };

  const clearCheckoutForm = () => {
    localStorage.removeItem("checkoutForm");

    setCheckoutForm({
      name: "",
      phone: "",
      address: "",
      date: "",
      time: "",
      guests: "",
      note: "",
    });
  };

  const handleLockedAccount = (message) => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("avatar");

    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("avatar");

    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("loginStatusChanged"));
    window.dispatchEvent(new Event("avatarUpdated"));

    setLockedAccountModal({
      open: true,
      message:
        message || "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ nhà hàng.",
    });
  };

  const handleChangeServiceType = (type) => {
    if (type !== serviceType) {
      clearCheckoutForm();
      setErrors({});
    }

    setServiceType(type);

    const newDeliveryTimeType = type === "delivery" ? deliveryTimeType : "now";
    setDeliveryTimeType(newDeliveryTimeType);

    localStorage.setItem(
      "checkoutForm",
      JSON.stringify({
        name: "",
        phone: "",
        address: "",
        date: "",
        time: "",
        guests: "",
        note: "",
        serviceType: type,
        deliveryTimeType: newDeliveryTimeType,
      }),
    );
  };
  // Hàm xóa món trong checkout và thông báo khi xóa
  const removeCheckoutItem = (id) => {
    const removedItem = cartItems.find((item) => item.id === id);
    const newCartItems = cartItems.filter((item) => item.id !== id);

    setCartItems(newCartItems);

    setToast({
      show: true,
      message: `Đã xóa "${removedItem?.name}" khỏi đơn hàng`,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
      });
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

    setCartItems(newCartItems);
  };

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
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
                  onClick={() => handleChangeServiceType("dinein")}
                />

                <ServiceCard
                  active={serviceType === "delivery"}
                  icon={<Truck className="w-full h-full" />}
                  title="Giao tận nơi"
                  subtitle="Delivery"
                  text="Giao món tận nơi nhanh chóng, nóng hổi."
                  onClick={() => handleChangeServiceType("delivery")}
                />

                <ServiceCard
                  active={serviceType === "pickup"}
                  icon={<Store className="w-full h-full" />}
                  title="Đến lấy tại quán"
                  subtitle="Pickup / Take Away"
                  text="Đặt trước, đến lấy tại quán, không cần chờ lâu."
                  onClick={() => handleChangeServiceType("pickup")}
                />
              </div>
            </div>

            {/* // Hiển thị form tương ứng với hình thức đã chọn */}
            {serviceType === "dinein" && (
              <DineInForm
                errors={errors}
                checkoutForm={checkoutForm}
                saveCheckoutForm={saveCheckoutForm}
                serviceType={serviceType}
                deliveryTimeType={deliveryTimeType}
              />
            )}
            {serviceType === "delivery" && (
              <DeliveryForm
                errors={errors}
                deliveryTimeType={deliveryTimeType}
                setDeliveryTimeType={setDeliveryTimeType}
                checkoutForm={checkoutForm}
                saveCheckoutForm={saveCheckoutForm}
                serviceType={serviceType}
              />
            )}
            {serviceType === "pickup" && (
              <PickupForm
                errors={errors}
                checkoutForm={checkoutForm}
                saveCheckoutForm={saveCheckoutForm}
                serviceType={serviceType}
                deliveryTimeType={deliveryTimeType}
              />
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

              {serviceType === "delivery" && (
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <b>{formatPrice(shippingFee)}</b>
                </div>
              )}

              <div>
                {/* // Hiển thị chi tiết giảm giá trong checkout */}
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <b className="text-green-800">
                    - {formatPrice(discountTotal)}
                  </b>
                </div>
                <div className="mt-2 space-y-1 pl-3 border-l-2 border-[#eadfcd]">
                  {appliedCoupon ? (
                    <div className="flex justify-between gap-3 text-xs text-green-800">
                      <span>
                        Mã {appliedCoupon.code} - {appliedCoupon.title} giảm{" "}
                        {appliedCoupon.discountType === "fixed"
                          ? formatPrice(appliedCoupon.amount)
                          : `${appliedCoupon.percent}%`}
                      </span>

                      <span className="shrink-0">
                        - {formatPrice(couponDiscountTotal)}
                      </span>
                    </div>
                  ) : (
                    canUseAutoDiscount && (
                      <div className="flex justify-between gap-3 text-xs text-green-800">
                        <span>
                          {autoDiscountRule.title} giảm{" "}
                          {autoDiscountRule.percent}%
                        </span>

                        <span className="shrink-0">
                          - {formatPrice(autoDiscountTotal)}
                        </span>
                      </div>
                    )
                  )}
                  {!savedCoupon &&
                    !appliedCoupon &&
                    subtotal >= autoDiscountRule.minOrder &&
                    !autoDiscountRule.serviceTypes.includes(serviceType) && (
                      <p className="text-xs text-red-500 mt-2">
                        Ưu đãi giảm {autoDiscountRule.percent}% chỉ áp dụng khi
                        ăn tại quán.
                      </p>
                    )}

                  {savedCoupon && !isCouponServiceValid && (
                    <p className="text-xs text-red-500 mt-2">
                      Mã {savedCoupon.code} chỉ áp dụng cho:{" "}
                      {couponServiceTypes
                        .map((type) => SERVICE_TYPE_LABELS[type])
                        .filter(Boolean)
                        .join(", ")}
                      <br />
                      Hình thức hiện tại là {
                        SERVICE_TYPE_LABELS[serviceType]
                      }{" "}
                      nên mã đã được loại khỏi đơn.
                    </p>
                  )}

                  {savedCoupon &&
                    isCouponServiceValid &&
                    !isCouponMinOrderValid && (
                      <p className="text-xs text-red-500 mt-2">
                        Đơn hàng cần tối thiểu{" "}
                        {formatPrice(savedCoupon.minOrder)} để dùng mã{" "}
                        {savedCoupon.code}.
                      </p>
                    )}
                </div>
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
              disabled={isSubmitting}
              onClick={async () => {
                if (isSubmitting) return;

                if (cartItems.length === 0) {
                  setShowEmptyCartModal(true);
                  return;
                }

                if (!checkLogin()) {
                  navigate("/login");
                  return;
                }

                if (!validateOrder()) return;

                setIsSubmitting(true);

                try {
                  const orderId = "DH" + Date.now();
                  const paymentContent = `DH${String(orderId).replace(/\D/g, "")}`;

                  const customerName = checkoutForm.name || "";
                  const phone = checkoutForm.phone || "";
                  const address = checkoutForm.address || "";
                  const date = checkoutForm.date || "";
                  const time = checkoutForm.time || "";
                  const guests = checkoutForm.guests || "";
                  const note = checkoutForm.note || "";

                  const normalizedCartItems = cartItems.map((item) => ({
                    ...item,
                    id: item.id || item.code,
                    code: item.code || item.id,
                    price: normalizeMoney(item.price),
                    qty: Number(item.qty || 1),
                  }));

                  if (serviceType === "dinein") {
                    const token = getAuthToken();

                    if (!token) {
                      navigate("/login");
                      return;
                    }

                    const bookingData = {
                      source: "checkout_page",
                      type: "table_with_order",

                      customerName: customerName || currentUser.name || currentUser.fullName || "",
                      name: customerName || currentUser.name || currentUser.fullName || "",
                      phone: phone || currentUser.phone || "",
                      email: currentUser.email || "",

                      date,
                      time,
                      guests: Number(guests || 1),

                      selectedArea: "",
                      selectedAreaTitle: "Nhà hàng sắp xếp",
                      selectedTable: "",

                      note,

                      cartItems: normalizedCartItems,
                      subtotal,
                      total,
                      totalQty: totalItems,

                      status: "pending",
                      createdAt: new Date().toISOString(),
                    };

                    const res = await fetch(`${API_URL}/api/bookings`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(bookingData),
                    });

                    const data = await res.json();

                    if (
                      data.code === "ACCOUNT_LOCKED" ||
                      data.code === "ACCOUNT_INACTIVE"
                    ) {
                      handleLockedAccount(data.message);
                      return;
                    }

                    if (!res.ok || !data.success) {
                      alert(
                        data.message ||
                          "Không thể tạo đặt bàn. Vui lòng thử lại.",
                      );
                      return;
                    }

                    const savedBooking = {
                      ...bookingData,
                      ...data.booking,
                    };

                    localStorage.setItem(
                      "currentBooking",
                      JSON.stringify(savedBooking),
                    );

                    localStorage.removeItem("cartItems");
                    localStorage.removeItem("checkoutSummary");
                    localStorage.removeItem("appliedCoupon");
                    localStorage.removeItem("checkoutForm");

                    window.dispatchEvent(new Event("cartUpdated"));
                    window.dispatchEvent(new Event("bookingsUpdated"));

                    setCartItems([]);

                    navigate("/booking-success");
                    return;
                  }

                  const finalOrderData = {
                    id: orderId,

                    userId: currentUser.id || "",
                    customerName: customerName || currentUser.name || currentUser.fullName || "",
                    email: currentUser.email || "",
                    phone: phone || currentUser.phone || "",

                    cartItems: normalizedCartItems,
                    serviceType,
                    deliveryTimeType,
                    paymentMethod: "bank",
                    paymentContent,
                    name: customerName,
                    address,
                    date,
                    time,
                    note,
                    subtotal,
                    appliedCoupon,
                    autoDiscountTotal,
                    couponDiscountTotal,
                    discountTotal,
                    shippingFee,
                    total,
                    qty: totalItems,
                    images: normalizedCartItems.map((item) => item.image),
                    extra: Math.max(normalizedCartItems.length - 4, 0),
                    status: "pending",
                    paymentStatus: "pending_payment",
                    createdAt: new Date().toISOString(),
                  };

                  const token = getAuthToken();

                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  const res = await fetch(`${API_URL}/api/orders`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(finalOrderData),
                  });

                  const data = await res.json();

                  if (
                    data.code === "ACCOUNT_LOCKED" ||
                    data.code === "ACCOUNT_INACTIVE"
                  ) {
                    handleLockedAccount(data.message);
                    return;
                  }

                  if (!res.ok || !data.success) {
                    alert(
                      data.message ||
                        "Không thể tạo đơn hàng. Vui lòng thử lại.",
                    );
                    return;
                  }
                  const savedOrder = {
                    ...finalOrderData,
                    ...data.order,
                  };

                  localStorage.setItem(
                    "currentOrder",
                    JSON.stringify(savedOrder),
                  );

                  window.dispatchEvent(new Event("ordersUpdated"));

                  navigate("/payment-qr");
                  return;
                } catch (error) {
                  console.error(error);
                  alert(
                    "Không kết nối được backend. Kiểm tra server port 5001.",
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className={`mt-6 w-full h-12 md:h-14 rounded-2xl font-black transition-all duration-300 flex items-center justify-center ${
                cartItems.length === 0 || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-primary text-white hover:bg-primary-light hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-md"
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              {isSubmitting
                ? "ĐANG XỬ LÝ..."
                : serviceType === "dinein"
                  ? "XÁC NHẬN ĐẶT BÀN"
                  : "TẠO ĐƠN & THANH TOÁN"}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="mt-3 w-full h-11 md:h-12 rounded-xl border-2 border-primary text-primary font-black hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center"
            >
              ← QUAY LẠI GIỎ HÀNG
            </button>
          </aside>
        </div>
      </main>

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

      {lockedAccountModal.open && (
        <div className="fixed inset-0 z-[99999] bg-black/45 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-[390px] overflow-hidden rounded-3xl bg-white border border-red-100 shadow-2xl">
            <div className="px-6 pt-7 pb-5 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl font-black">
                !
              </div>

              <h2 className="mt-4 text-xl font-black text-green-950">
                Tài khoản đã bị khóa
              </h2>

              <p className="mt-2 text-sm font-semibold text-gray-600 leading-relaxed">
                {lockedAccountModal.message}
              </p>
            </div>

            <div className="px-6 pb-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  setLockedAccountModal({
                    open: false,
                    message: "",
                  });

                  navigate("/login");
                }}
                className="h-12 rounded-2xl bg-green-800 text-white font-black hover:bg-green-900 transition"
              >
                Tôi đã hiểu
              </button>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="h-11 rounded-2xl border border-[#eadfcd] text-green-900 font-black hover:bg-green-50 transition"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component hiển thị thông báo khi xóa món ăn khỏi checkout */}
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

export default CheckoutPage;
