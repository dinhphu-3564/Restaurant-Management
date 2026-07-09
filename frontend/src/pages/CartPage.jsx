import { checkLogin } from "../utils/auth";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import LoginRequiredModal from "../components/LoginRequiredModal";
import {
  Leaf,
  ShoppingCart,
  X,
  Trash2,
  Minus,
  Plus,
  Gift,
  ShieldCheck,
  Truck,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CartModals, { Service } from "../components/cart/CartModals";

import goatIcon from "../assets/images/Icon_De.png";
import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import deXaoLan from "../assets/images/menu/de-xao-lan.jpg";
import suonDeNuong from "../assets/images/menu/suon-de-nuong.jpg";
import deHapTiaTo from "../assets/images/menu/de-hap-tia-to.jpg";

function CartPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmptyCartAlert, setShowEmptyCartAlert] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState("description");

  const toastTimerRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // mã giảm giá
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [adminCoupons, setAdminCoupons] = useState([]);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  const suggestions = [
    {
      id: 5,
      name: "Dê hấp sả",
      price: 299000,
      image: deHapTiaTo,
    },
    {
      id: 6,
      name: "Dê nấu chao",
      price: 269000,
      image: lauDe,
    },
    {
      id: 7,
      name: "Dê nướng tảng",
      price: 189000,
      image: deNuongTang,
    },
    {
      id: 8,
      name: "Rau rừng xào tỏi",
      price: 79000,
      image: deXaoLan,
    },
  ];
  const filteredSuggestions = suggestions.filter(
    (dish) => !cartItems.some((item) => item.id === dish.id),
  );
  // toast thông báo khi xóa món ăn khỏi giỏ hàng
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    dishName: "",
    type: "delete",
  });

  // Kiểm tra trạng thái đăng nhập khi component được mount
  useEffect(() => {
    setIsLoggedIn(checkLogin());
  }, []);

  // Lưu trạng thái mã giảm giá đã áp dụng vào localStorage để giữ khi reload trang
  useEffect(() => {
    const savedCoupon = JSON.parse(localStorage.getItem("appliedCoupon"));

    if (!savedCoupon) return;

    const latestCoupon = adminCoupons.find(
      (item) =>
        String(item.code || "").toUpperCase() ===
        String(savedCoupon.code || "").toUpperCase(),
    );

    if (!latestCoupon || latestCoupon.status !== "active") {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponMessage("Mã ưu đãi hiện không còn hiệu lực.");

      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("checkoutSummary");

      return;
    }

    setAppliedCoupon(latestCoupon);
    setCouponCode(latestCoupon.code);
  }, [adminCoupons]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems]);

  //Thêm API lấy khuyến mãi
  function parseMoneyFromText(value) {
    const number = String(value || "").replace(/[^\d]/g, "");
    return Number(number || 0);
  }
  const convertDealToCoupon = (deal) => {
    const discountText = String(deal.discount || "").trim();
    const isPercent = discountText.includes("%");

    return {
      id: deal.id,
      code: deal.code,
      title: deal.name,
      discountType: isPercent ? "percent" : "fixed",
      percent: isPercent ? Number(discountText.replace(/[^\d]/g, "")) : 0,
      amount: isPercent ? 0 : parseMoneyFromText(discountText),
      minOrder: parseMoneyFromText(deal.condition),
      status: deal.status || "active",

      usageLimit: Number(deal.usageLimit || 0),
      used: Number(deal.used || 0),

      serviceTypes:
        deal.serviceTypes && deal.serviceTypes.length > 0
          ? deal.serviceTypes
          : ["delivery", "pickup", "dinein"],
    };
  };

  const loadCoupons = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/deals");
      const data = await res.json();

      const coupons = (data.deals || []).map(convertDealToCoupon);

      setAdminCoupons(coupons);

      return coupons;
    } catch (error) {
      console.error("Lỗi tải mã ưu đãi:", error);
      setAdminCoupons([]);

      return [];
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + "đ";
  };


  // Hàm áp dụng mã giảm giá với các điều kiện kiểm tra và lưu trạng thái đã áp dụng
  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    const latestCoupons = await loadCoupons();

    const coupon = latestCoupons.find(
      (item) => String(item.code || "").toUpperCase() === code,
    );

    if (!code) {
      setAppliedCoupon(null);
      setCouponMessage("Vui lòng nhập mã ưu đãi.");
      localStorage.removeItem("appliedCoupon");
      return;
    }

    if (!coupon) {
      setAppliedCoupon(null);
      setCouponMessage("Mã ưu đãi không tồn tại hoặc không đúng.");
      localStorage.removeItem("appliedCoupon");
      return;
    }

    if (coupon.status !== "active") {
      setAppliedCoupon(null);
      setCouponMessage("Mã ưu đãi hiện không còn hiệu lực.");
      localStorage.removeItem("appliedCoupon");
      return;
    }

    if (subtotal < coupon.minOrder) {
      setAppliedCoupon(null);
      setCouponMessage(
        `Đơn hàng cần tối thiểu ${formatPrice(coupon.minOrder)} để dùng mã ${coupon.code}.`,
      );
      localStorage.removeItem("appliedCoupon");
      return;
    }

    // chặn mã khi hết lượt
    if (
      coupon.usageLimit &&
      Number(coupon.used || 0) >= Number(coupon.usageLimit)
    ) {
      setAppliedCoupon(null);
      setCouponMessage("Mã ưu đãi đã hết lượt sử dụng.");
      localStorage.removeItem("appliedCoupon");
      return;
    }

    setAppliedCoupon(coupon);
    localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
    setCouponMessage(
      coupon.discountType === "fixed"
        ? `Đã áp dụng mã ${coupon.code} - giảm ${formatPrice(coupon.amount)} cho đơn hàng.`
        : `Đã áp dụng mã ${coupon.code} - giảm ${coupon.percent}% cho đơn hàng.`,
    );
  };
  // Hàm hiển thị toast thông báo với tự động ẩn sau 3 giây
  const showToast = (title, message, type = "delete", dishName = "") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      title,
      message,
      type,
      dishName,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast({
        show: false,
        title: "",
        message: "",
        type: "delete",
      });
    }, 4000);
  };

  const promotionCoupons = adminCoupons;

  // Tính toán subtotal, discount và total giảm giá
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  //biến kiểm tra giảm 5%
  const autoDiscountRule = {
    title: "Hóa đơn trên 2.000.000đ",
    percent: 5,
    minOrder: 2000000,
    serviceTypes: ["dinein"],
  };

  // Tính toán tổng giảm giá tự động và từ mã ưu đãi nếu có, sau đó tính tổng cuối cùng
  const autoDiscountTotal =
    !appliedCoupon && subtotal >= autoDiscountRule.minOrder
      ? (subtotal * autoDiscountRule.percent) / 100
      : 0;

  const rawCouponDiscountTotal = appliedCoupon
    ? appliedCoupon.discountType === "fixed"
      ? appliedCoupon.amount
      : (subtotal * appliedCoupon.percent) / 100
    : 0;

  const couponDiscountTotal = Math.min(rawCouponDiscountTotal, subtotal);

  const discountTotal = appliedCoupon ? couponDiscountTotal : autoDiscountTotal;

  const total = subtotal - discountTotal;

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const changeQty = (id, type) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            qty:
              type === "increase" ? item.qty + 1 : Math.max(1, item.qty - 1),
          }
          : item,
      ),
    );
  };
  // Hàm xóa món ăn khỏi giỏ hàng và hiển thị toast thông báo
  const removeItem = (id) => {
    const removedItem = cartItems.find((item) => item.id === id);

    setCartItems((prev) => prev.filter((item) => item.id !== id));

    showToast(
      "Đã xóa món ăn",
      `Đã xóa "${removedItem?.name}" khỏi giỏ hàng`,
      "delete",
    );
  };
  // Hàm thêm món ăn gợi ý vào giỏ hàng và hiển thị toast thông báo
  const addSuggestion = (dish) => {
    setCartItems((prev) => {
      const existed = prev.find((item) => item.id === dish.id);

      if (existed) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          ...dish,
          qty: 1,
          desc: "Món ăn gợi ý dùng kèm trong bữa chính.",
        },
      ];
    });

    showToast(
      "Đã thêm vào giỏ hàng",
      "đã được thêm vào giỏ hàng",
      "success",
      dish.name,
    );
  };

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {/* MAIN CART */}
      <main className="max-w-[1600px] mx-auto px-3 md:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-3xl md:text-4xl font-black text-green-900">
            Giỏ hàng
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Link to="/home" className="hover:text-green-800">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-green-900 font-medium">Giỏ hàng</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-4 items-start">
          {/* LEFT */}
          <section className="bg-white/80 border border-[#eadfcd] rounded-2xl shadow-sm p-3 md:p-5">
            <div className="hidden md:grid sticky top-0 z-10 bg-white/95 grid-cols-[2fr_120px_150px_140px_50px] gap-4 pb-4 border-b border-[#eadfcd] text-sm font-black text-gray-600 pl-8">
              <p>SẢN PHẨM</p>
              <p className="ml-6">ĐƠN GIÁ</p>

              <p className="text-center ml-6">SỐ LƯỢNG</p>

              <p className="ml-6">THÀNH TIỀN</p>
              <p></p>
            </div>

            <div className="max-h-[560px] overflow-y-auto pr-2">
              {cartItems.length === 0 ? (
                <div className="min-h-[360px] flex flex-col items-center justify-center text-center text-gray-400">
                  <div className="w-20 h-20 rounded-full bg-[#fbf0dc] flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-[#d6c4a3]" />
                  </div>

                  <h3 className="text-xl font-black text-gray-500">
                    Chưa có món ăn trong giỏ hàng
                  </h3>

                  <p className="text-sm mt-2">
                    Hãy chọn món ngon từ thực đơn để bắt đầu đặt hàng.
                  </p>

                  <Link
                    to="/menu"
                    className="mt-5 px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-light shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    Xem thực đơn
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white md:bg-transparent rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-[#eadfcd] md:border-0 md:border-b p-3 md:p-0 md:py-4 grid md:grid-cols-[1.6fr_120px_150px_140px_50px] gap-3 md:gap-4 items-center mb-3 md:mb-0"
                  >
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedDish(item);
                          setDetailQty(item.qty);
                          setActiveDetailTab("description");
                        }}
                        className="w-[120px] h-[88px] md:w-[150px] md:h-[105px] rounded-2xl overflow-hidden shrink-0 bg-gray-100"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div>
                        <div className="leading-snug">
                          <h3 className="font-black text-green-900 inline text-[18px]">
                            {item.name}
                          </h3>

                          {item.tag && (
                            <span className="inline-flex ml-2 align-middle bg-[#f4ead6] text-[#b88935] text-xs font-bold px-3 py-1 rounded-full">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        <p className="text-[15px] text-gray-600 mt-2 max-w-sm line-clamp-1 md:line-clamp-none">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="md:contents flex items-center justify-between gap-3 mt-2">
                      <div className="md:ml-6">
                        <p className="text-xs text-gray-500 md:hidden">
                          Đơn giá
                        </p>
                        <p className="font-black text-[#b88935]">
                          {formatPrice(item.price)}
                        </p>

                        <p className="text-xs text-gray-500 mt-1 md:hidden">
                          Thành tiền
                        </p>
                        <p className="font-black text-[#b88935] md:hidden">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>

                      <div className="md:ml-6 w-32 h-10 rounded-xl border border-[#eadfcd] flex items-center justify-between px-3">
                        <button
                          onClick={() => changeQty(item.id, "decrease")}
                          className="text-green-950"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            setCartItems((prev) =>
                              prev.map((cartItem) =>
                                cartItem.id === item.id
                                  ? {
                                    ...cartItem,
                                    qty: value < 1 ? 1 : value,
                                  }
                                  : cartItem,
                              ),
                            );
                          }}
                          className="w-10 bg-transparent text-center font-black text-green-950 outline-none appearance-none [appearance:textfield]"
                        />

                        <button
                          onClick={() => changeQty(item.id, "increase")}
                          className="text-green-950"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="hidden md:block ml-6 font-black text-[#b88935]">
                        {formatPrice(item.price * item.qty)}
                      </p>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 rounded-lg border border-[#eadfcd] text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="flex justify-end pt-5">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="h-11 px-6 rounded-lg border border-[#d7c8ae] text-gray-700 font-bold hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  XÓA TẤT CẢ
                </button>
              </div>
            )}
          </section>

          {/* RIGHT */}
          <aside className="bg-white/80 border border-[#eadfcd] rounded-2xl shadow-sm p-4 md:p-5 h-fit sticky top-24">
            <h2 className="text-xl font-black text-green-900">
              TÓM TẮT ĐƠN HÀNG
            </h2>
            <div className="w-12 h-[2px] bg-[#c99a45] my-3"></div>
            <div className="mb-5 bg-[#fbf7ec] border border-[#eadfcd] rounded-xl p-3">
              <p className="font-black text-green-900 text-sm mb-2">
                Mã ưu đãi
              </p>

              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập mã ưu đãi"
                  className="flex-1 h-11 rounded-lg border border-[#eadfcd] px-3 outline-none text-sm bg-white uppercase"
                />

                <button
                  onClick={applyCoupon}
                  className="h-11 px-5 rounded-xl bg-primary text-white font-bold hover:bg-primary-light transition-colors"
                >
                  Áp dụng
                </button>
              </div>

              {couponMessage && (
                <p
                  className={`text-xs mt-2 font-medium ${appliedCoupon ? "text-green-800" : "text-red-500"
                    }`}
                >
                  {couponMessage}
                </p>
              )}

              {appliedCoupon && (
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setCouponMessage("");
                    localStorage.removeItem("appliedCoupon");
                  }}
                  className="text-xs text-red-500 font-bold mt-2"
                >
                  Gỡ mã ưu đãi
                </button>
              )}
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="font-bold">Tạm tính ({totalQty} món)</span>

                <b>{formatPrice(subtotal)}</b>
              </div>

              <div>
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <b>- {formatPrice(discountTotal)}</b>
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
                    subtotal >= 2000000 && (
                      <div className="flex justify-between gap-3 text-xs text-green-800">
                        <span>
                          Ăn tại quán, hóa đơn trên 2.000.000đ giảm 5%
                        </span>

                        <span className="shrink-0">
                          - {formatPrice(autoDiscountTotal)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#eadfcd] mt-5 pt-5 flex items-center justify-between">
              <span className="font-black">Tổng cộng</span>
              <span className="text-3xl font-black text-[#b88935]">
                {formatPrice(total)}
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm text-gray-600 mt-4">
              <ShieldCheck className="w-5 h-5 text-[#c99a45]" />
              Giá đã bao gồm VAT
            </p>
            {/* // thông báo khi giỏ hàng trống mà vẫn bấm vào thanh toán */}
            <button
              onClick={async () => {
                if (cartItems.length === 0) {
                  setShowEmptyCartAlert(true);
                  return;
                }

                if (!isLoggedIn) {
                  setShowLoginModal(true);
                  return;
                }

                if (appliedCoupon) {
                  const latestCoupons = await loadCoupons();

                  const latestCoupon = latestCoupons.find(
                    (item) =>
                      String(item.code || "").toUpperCase() ===
                      String(appliedCoupon.code || "").toUpperCase(),
                  );

                  if (!latestCoupon || latestCoupon.status !== "active") {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setCouponMessage("Mã ưu đãi hiện không còn hiệu lực.");
                    localStorage.removeItem("appliedCoupon");
                    localStorage.removeItem("checkoutSummary");
                    return;
                  }

                  if (
                    latestCoupon.usageLimit &&
                    Number(latestCoupon.used || 0) >=
                    Number(latestCoupon.usageLimit)
                  ) {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setCouponMessage("Mã ưu đãi đã hết lượt sử dụng.");
                    localStorage.removeItem("appliedCoupon");
                    localStorage.removeItem("checkoutSummary");
                    return;
                  }

                  localStorage.setItem(
                    "appliedCoupon",
                    JSON.stringify(latestCoupon),
                  );
                }

                localStorage.setItem(
                  "checkoutSummary",
                  JSON.stringify({
                    subtotal,
                    autoDiscountRule,
                    autoDiscountTotal,
                    couponDiscountTotal,
                    discountTotal,
                    total,
                    appliedCoupon,
                    couponStatus: appliedCoupon?.status,
                  }),
                );

                navigate("/checkout");
              }}
              className={`mt-6 w-full h-14 rounded-2xl font-black transition-all duration-300 shadow-md flex items-center justify-center ${cartItems.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-primary text-white hover:bg-primary-light hover:-translate-y-1 hover:shadow-xl active:scale-95"
                }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              TIẾN HÀNH THANH TOÁN
            </button>

            {!appliedCoupon && (
              <div className="mt-10 bg-[#f8f0df] rounded-xl p-5">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-800">
                    <Gift className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-black text-green-900">
                      ƯU ĐÃI CHO BẠN
                    </h3>

                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      Ăn tại quán với hóa đơn từ <b>2.000.000đ</b> sẽ được giảm
                      5% và tặng món tráng miệng.
                    </p>

                    <div className="h-2 bg-[#dfcfad] rounded-full mt-4 overflow-hidden">
                      <div
                        className="h-full bg-green-900 rounded-full"
                        style={{
                          width: `${Math.min(
                            (subtotal / 2000000) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    {subtotal >= 2000000 ? (
                      <p className="text-xs text-green-700 mt-3 font-semibold">
                        ✓ Đơn hàng của bạn đã đủ điều kiện giảm 5%
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-3">
                        Bạn cần thêm{" "}
                        <b className="text-[#b88935]">
                          {formatPrice(2000000 - subtotal)}
                        </b>{" "}
                        để được giảm 5%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* SUGGESTION */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-green-900 text-lg">
              ✣ Bạn có thể thêm
            </h2>

            {filteredSuggestions.length > 4 && (
              <div className="hidden md:flex gap-2">
                <button className="w-9 h-9 rounded-full border border-[#eadfcd] bg-white">
                  <ChevronLeft className="w-4 h-4 mx-auto" />
                </button>

                <button className="w-9 h-9 rounded-full border border-[#eadfcd] bg-white">
                  <ChevronRight className="w-4 h-4 mx-auto" />
                </button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSuggestions.map((dish) => (
              <div
                key={dish.id}
                className="bg-white border border-[#eadfcd] rounded-xl p-3 flex items-center gap-3"
              >
                <button
                  onClick={() => {
                    setSelectedDish({
                      ...dish,
                      desc: "Món ăn gợi ý dùng kèm trong bữa chính.",
                      tag: dish.name.includes("Dê") ? "Đặc trưng" : "",
                    });
                    setDetailQty(1);
                  }}
                  className="w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100"
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-green-900 text-sm truncate">
                    {dish.name}
                  </h3>
                  <p className="text-[#b88935] font-black text-sm mt-1">
                    {formatPrice(dish.price)}
                  </p>
                </div>

                <button
                  onClick={() => addSuggestion(dish)}
                  className="w-9 h-9 rounded-lg border border-[#d7c8ae] text-green-900 hover:bg-green-900 hover:text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICE BAR */}
        <section className="mt-6 bg-[#fbf0dc] rounded-xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Service
            icon={<Leaf />}
            title="Nguyên liệu tươi ngon"
            text="Dê núi Hương Sơn tuyển chọn mỗi ngày"
          />
          <Service
            icon={<ShieldCheck />}
            title="Không chất bảo quản"
            text="An toàn cho sức khỏe"
          />
          <Service
            icon={<Truck />}
            title="Giao hàng nhanh chóng"
            text="Freeship trong bán kính 10km"
          />
          <Service
            icon={<Headphones />}
            title="Hỗ trợ 24/7"
            text="Hotline: 038 713 6878"
          />
        </section>
      </main>

      <CartModals
        selectedDish={selectedDish}
        setSelectedDish={setSelectedDish}
        activeDetailTab={activeDetailTab}
        setActiveDetailTab={setActiveDetailTab}
        detailQty={detailQty}
        setDetailQty={setDetailQty}
        cartItems={cartItems}
        setCartItems={setCartItems}
        showToast={showToast}
        formatPrice={formatPrice}
        showEmptyCartAlert={showEmptyCartAlert}
        setShowEmptyCartAlert={setShowEmptyCartAlert}
        showClearConfirm={showClearConfirm}
        setShowClearConfirm={setShowClearConfirm}
        navigate={navigate}
      />
      {/* // toast thông báo khi xóa món ăn khỏi giỏ hàng */}
      {toast.show && (
        <div className="fixed top-20 right-5 z-[9999]">
          <div className="bg-white border border-[#eadfcd] shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 w-[330px] max-w-[calc(100vw-32px)] animate-[slideIn_.25s_ease-out]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === "delete" ? "bg-red-50" : "bg-green-50"
                }`}
            >
              {toast.type === "delete" ? (
                <Trash2 className="w-5 h-5 text-red-500" />
              ) : (
                <ShoppingCart className="w-5 h-5 text-green-700" />
              )}
            </div>

            <div>
              <p className="font-black text-green-900 tracking-wide">
                {toast.title}
              </p>
              <p className="text-sm text-gray-600">
                {toast.dishName && (
                  <span className="font-black text-[#b88935]">
                    "{toast.dishName}"
                  </span>
                )}{" "}
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => navigate("/login")}
        />
      )}
    </div>
  );
}

export default CartPage;
