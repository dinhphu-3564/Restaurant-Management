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
  Trash2,
  Minus,
  Plus,
  RefreshCcw,
  Gift,
  ShieldCheck,
  Truck,
  ChefHat,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import deXaoLan from "../assets/images/menu/de-xao-lan.jpg";
import suonDeNuong from "../assets/images/menu/suon-de-nuong.jpg";
import deHapTiaTo from "../assets/images/menu/de-hap-tia-to.jpg";

function CartPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState("description");
  const profileMenuRef = useRef(null);

  const defaultCartItems = [
    {
      id: 1,
      name: "Dê nướng tảng",
      desc: "Thịt dê tươi tảng ướp 12 loại gia vị, nướng trên than hoa hồng.",
      price: 399000,
      qty: 1,
      image: deNuongTang,
      tag: "Đặc trưng",
    },
    {
      id: 2,
      name: "Lẩu dê Hương Sơn",
      desc: "Nước lẩu đậm đà từ xương dê hầm cùng thảo mộc tự nhiên.",
      price: 349000,
      qty: 2,
      image: lauDe,
      tag: "Đặc trưng",
    },
    {
      id: 3,
      name: "Dê xào sả ớt",
      desc: "Thịt dê xào cùng sả, ớt, tỏi và các loại gia vị cay nồng.",
      price: 199000,
      qty: 1,
      image: deXaoLan,
    },
    {
      id: 4,
      name: "Sườn dê nướng",
      desc: "Sườn dê tươi ướp gia vị đặc biệt, nướng than hoa thơm lừng.",
      price: 269000,
      qty: 1,
      image: suonDeNuong,
    },
  ];
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");

    return savedCart ? JSON.parse(savedCart) : defaultCartItems;
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
  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

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

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + "đ";
  };
  // Tính toán subtotal, discount và total giảm giá
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const discountRules = [
    {
      id: 1,
      title: "Hóa đơn trên 2.000.000đ",
      percent: 5,
      condition: subtotal >= 2000000,
    },
  ];

  const discountTotal = discountRules
    .filter((rule) => rule.condition)
    .reduce((sum, rule) => sum + (subtotal * rule.percent) / 100, 0);

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

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

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
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <a href="#">Khuyến mãi</a>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
          </nav>

          <div className="hidden md:flex gap-3">
            {isLoggedIn ? (
              <div
                ref={profileMenuRef}
                className="relative flex items-center gap-3"
              >
                <Link to="/cart" className="relative text-green-900">
                  <ShoppingCart className="w-5 h-5" />

                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center">
                    {totalQty}
                  </span>
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
      </header>

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
            <div className="hidden md:grid grid-cols-[2fr_120px_150px_140px_50px] gap-4 pb-4 border-b border-[#eadfcd] text-sm font-black text-gray-600 pl-8">
              <p>SẢN PHẨM</p>
              <p className="ml-6">ĐƠN GIÁ</p>

              <p className="text-center ml-6">SỐ LƯỢNG</p>

              <p className="ml-6">THÀNH TIỀN</p>
              <p></p>
            </div>

            <div>
              {cartItems.map((item) => (
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
                      <p className="text-xs text-gray-500 md:hidden">Đơn giá</p>
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
              ))}
            </div>

            <div className="flex justify-end pt-5">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="h-11 px-6 rounded-lg border border-[#d7c8ae] text-gray-700 font-bold hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                XÓA TẤT CẢ
              </button>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="bg-white/80 border border-[#eadfcd] rounded-2xl shadow-sm p-4 md:p-5 h-fit sticky top-24">
            <h2 className="text-xl font-black text-green-900">
              TÓM TẮT ĐƠN HÀNG
            </h2>
            <div className="w-12 h-[2px] bg-[#c99a45] my-3"></div>

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
                  {discountRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex justify-between text-xs ${
                        rule.condition ? "text-green-800" : "text-gray-400"
                      }`}
                    >
                      <span>
                        {rule.title} giảm {rule.percent}%
                      </span>

                      <span>
                        {rule.condition
                          ? `- ${formatPrice((subtotal * rule.percent) / 100)}`
                          : "Chưa đạt"}
                      </span>
                    </div>
                  ))}
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

            <button className="mt-5 w-full h-12 rounded-lg bg-green-900 text-white font-black hover:bg-green-950">
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              <button
                onClick={() => navigate("/checkout")}
                className="mt-5 w-full h-12 rounded-lg bg-green-900 text-white font-black hover:bg-green-950"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                TIẾN HÀNH THANH TOÁN
              </button>
            </button>

            <div className="mt-10 bg-[#f8f0df] rounded-xl p-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-800">
                  <Gift className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-black text-green-900">ƯU ĐÃI CHO BẠN</h3>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    Đơn hàng từ <b>2.000.000đ</b> sẽ được giảm 5% và tặng món
                    tráng miệng.
                  </p>

                  <div className="h-2 bg-[#dfcfad] rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-green-900 rounded-full"
                      style={{
                        width: `${Math.min((subtotal / 2000000) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Bạn cần thêm{" "}
                    <b className="text-[#b88935]">
                      {formatPrice(Math.max(0, 2000000 - subtotal))}
                    </b>{" "}
                    để được giảm 5%
                  </p>
                </div>
              </div>
            </div>
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
            text="Hotline: 1900 1234"
          />
        </section>
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

            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              Dê núi Hương Sơn – đậm đà bản sắc, tươi ngon, bổ dưỡng.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 md:mb-5">
              Thông tin liên hệ
            </h3>

            <div className="space-y-2 text-white/75 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 text-white shrink-0" />
                <p>
                  Thị trấn Phố Châu, <br />
                  Hương Sơn, Hà Tĩnh
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-white shrink-0" />
                <p>
                  038 713 6878
                  <br />
                  076 877 4619
                </p>
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
                f
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                Z
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
      {/* popup chi tiết món */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-[998] bg-black/50 flex items-center justify-center px-4 py-6"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thêm nút X mới lên góc trên phải trong chi tiết món ăn ở mobile */}
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/95 border border-green-900 text-green-900 shadow-md flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="grid md:grid-cols-2 gap-5 p-4 md:p-5">
              <div>
                <div className="rounded-3xl overflow-hidden h-48 md:h-[250px] bg-gray-100">
                  <img
                    src={selectedDish.image}
                    alt={selectedDish.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* MOBILE TITLE */}
                <div className="md:hidden mt-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[32px] leading-none font-black text-green-900">
                      {selectedDish.name}
                    </h2>

                    {selectedDish.tag && (
                      <span className="inline-flex bg-[#f4ead6] text-[#b88935] text-xs font-bold px-3 py-1 rounded-full">
                        {selectedDish.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-[#b88935] text-2xl font-black mt-4">
                    {formatPrice(selectedDish.price)}
                  </p>

                  <p className="text-gray-600 mt-4 leading-relaxed">
                    {selectedDish.desc}
                  </p>
                </div>

                <div className="mt-5 border border-green-900 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-3 text-center text-sm font-black">
                    <button
                      onClick={() => setActiveDetailTab("description")}
                      className={`py-3 ${
                        activeDetailTab === "description"
                          ? "text-green-800 border-b-4 border-green-800"
                          : "text-gray-500"
                      }`}
                    >
                      MÔ TẢ
                    </button>

                    <button
                      onClick={() => setActiveDetailTab("ingredients")}
                      className={`py-3 ${
                        activeDetailTab === "ingredients"
                          ? "text-green-800 border-b-4 border-green-800"
                          : "text-gray-500"
                      }`}
                    >
                      THÀNH PHẦN
                    </button>

                    <button
                      onClick={() => setActiveDetailTab("taste")}
                      className={`py-3 ${
                        activeDetailTab === "taste"
                          ? "text-green-800 border-b-4 border-green-800"
                          : "text-gray-500"
                      }`}
                    >
                      HƯƠNG VỊ
                    </button>
                  </div>

                  <div className="border-t border-green-900 p-4 text-gray-600 leading-relaxed min-h-[120px]">
                    {activeDetailTab === "description" && (
                      <p>
                        {selectedDish.desc} Món ăn được chế biến từ nguyên liệu
                        tươi ngon, giữ trọn hương vị đặc trưng của đặc sản dê
                        Hương Sơn.
                      </p>
                    )}

                    {activeDetailTab === "ingredients" && (
                      <ul className="space-y-2">
                        <li>• Thịt dê tươi Hương Sơn</li>
                        <li>• Sả, ớt, hành tím</li>
                        <li>• Rau thơm ăn kèm</li>
                        <li>• Nước chấm đặc biệt</li>
                      </ul>
                    )}

                    {activeDetailTab === "taste" && (
                      <p>
                        Hương vị đậm đà, thơm nhẹ, thịt mềm ngọt tự nhiên, phù
                        hợp khẩu vị gia đình và thực khách yêu thích đặc sản dê
                        núi.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-0">
                <h2 className="hidden md:block text-2xl md:text-3xl font-black text-green-900 pr-10">
                  {selectedDish.name}
                </h2>

                {selectedDish.tag && (
                  <span className="hidden md:inline-flex mt-3 bg-[#f4ead6]text-[#b88935] text-xs font-bold px-3 py-1 rounded-full">
                    {selectedDish.tag}
                  </span>
                )}

                <p className="hidden md:block text-[#b88935] text-2xl font-black mt-4">
                  {formatPrice(selectedDish.price)}
                </p>

                <p className="hidden md:block text-gray-600 mt-4 leading-relaxed">
                  {selectedDish.desc}
                </p>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-[#fbf7ec] rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Khẩu phần</p>
                    <p className="font-bold text-green-900">2 - 3 người</p>
                  </div>

                  <div className="bg-[#fbf7ec] rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Chế biến</p>
                    <p className="font-bold text-green-900">Nóng hổi</p>
                  </div>

                  <div className="bg-[#fbf7ec] rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Thời gian</p>
                    <p className="font-bold text-green-900">15 - 20 phút</p>
                  </div>
                </div>

                <div className="mt-5 bg-[#fbf7ec] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-green-900">Số lượng</p>

                    <div className="w-32 h-10 rounded-xl border border-[#eadfcd] flex items-center justify-between px-3 bg-white">
                      <button
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-black">{detailQty}</span>

                      <button onClick={() => setDetailQty(detailQty + 1)}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCartItems((prev) => {
                        const existed = prev.find(
                          (item) => item.id === selectedDish.id,
                        );

                        if (existed) {
                          return prev.map((item) =>
                            item.id === selectedDish.id
                              ? { ...item, qty: detailQty }
                              : item,
                          );
                        }

                        return [
                          ...prev,
                          {
                            ...selectedDish,
                            qty: detailQty,
                            desc:
                              selectedDish.desc ||
                              "Món ăn gợi ý dùng kèm trong bữa chính.",
                          },
                        ];
                      });

                      setSelectedDish(null);
                    }}
                    className="mt-4 w-full h-12 rounded-xl bg-green-900 text-white font-black hover:bg-green-950"
                  >
                    {cartItems.some((item) => item.id === selectedDish.id)
                      ? "Cập nhật giỏ hàng"
                      : "Thêm vào giỏ hàng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* thông báo xác nhận xóa món ăn */}
      {/* CONFIRM CLEAR CART */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-center text-green-950 mt-5">
              Xóa tất cả sản phẩm?
            </h2>

            <p className="text-gray-500 text-center mt-3 leading-relaxed">
              Tất cả món ăn trong giỏ hàng sẽ bị xóa.
              <br />
              Bạn có chắc chắn muốn tiếp tục?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="h-12 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </button>

              <button
                onClick={() => {
                  setCartItems([]);
                  setShowClearConfirm(false);
                }}
                className="h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Service({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-white text-[#b88935] flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h3 className="font-black text-sm text-green-900">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{text}</p>
      </div>
    </div>
  );
}

export default CartPage;
