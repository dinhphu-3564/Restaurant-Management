import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import hero1 from "../assets/images/Home/hero-1.png";
import hero2 from "../assets/images/Home/hero-2.png";
import hero3 from "../assets/images/Home/hero-3.png";
import hero4 from "../assets/images/Home/hero-4.png";
import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import deXaoLan from "../assets/images/menu/de-xao-lan.jpg";
import deHapTiaTo from "../assets/images/menu/de-hap-tia-to.jpg";
import {
  Leaf,
  ShoppingCart,
  ShieldCheck,
  CalendarDays,
  ChefHat,
  Heart,
  Star,
  MapPin,
  Phone,
  Clock,
  Mountain,
  CookingPot,
  Users,
  Award,
  Truck,
  PlayCircle,
  Menu,
  X,
  User,
  UserRound,
  ClipboardList,
  CalendarCheck,
  LogOut,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const heroImages = [hero1, hero2, hero3, hero4];

  const [currentHero, setCurrentHero] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); //state mở menu profile
  const [addCartToast, setAddCartToast] = useState(null);
  const [flyItem, setFlyItem] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const totalCartQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const parsePrice = (price) => {
    return Number(price.replace(/[^\d]/g, ""));
  };

  const addToCart = (dish, event) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const cartDish = {
      id: dish.id,
      name: dish.name,
      desc: dish.description,
      price: parsePrice(dish.price),
      qty: 1,
      image: dish.image,
      tag: dish.tag || "",
    };

    const existed = cartItems.find((item) => item.id === cartDish.id);

    const newCart = existed
      ? cartItems.map((item) =>
          item.id === cartDish.id ? { ...item, qty: item.qty + 1 } : item,
        )
      : [...cartItems, cartDish];

    setCartItems(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));

    const imageRect = event.currentTarget
      .closest(".dish-card")
      ?.querySelector("img")
      ?.getBoundingClientRect();

    const cartRect = cartIconRef.current?.getBoundingClientRect();

    if (imageRect && cartRect) {
      setFlyItem({
        image: dish.image,
        startX: imageRect.left + imageRect.width / 2,
        startY: imageRect.top + imageRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      });

      setTimeout(() => setFlyItem(null), 900);
    }

    setAddCartToast(`Đã thêm ${dish.name} vào giỏ hàng`);

    setTimeout(() => {
      setAddCartToast(null);
    }, 3000);
  };
  const profileMenuRef = useRef(null);
  const cartIconRef = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");

    if (loginStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowLoginToast(true);

      setTimeout(() => {
        setShowLoginToast(false);
      }, 3000);
    }
  }, [location]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);
  //  Nhấn vào bất kỳ đâu ngoài menu profile sẽ đóng menu lại
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const updateCartQty = () => {
      const savedCart = localStorage.getItem("cartItems");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    window.addEventListener("storage", updateCartQty);
    window.addEventListener("cartUpdated", updateCartQty);

    updateCartQty();

    return () => {
      window.removeEventListener("storage", updateCartQty);
      window.removeEventListener("cartUpdated", updateCartQty);
    };
  }, []);
  const dishes = [
    {
      id: 101,
      name: "Dê hấp tía tô",
      description: "Thịt dê hấp cùng lá tía tô, giữ trọn vị ngọt tự nhiên.",
      price: "250.000đ",
      tag: "Bán chạy",
      image: deHapTiaTo,
    },
    {
      id: 102,
      name: "Dê nướng tảng",
      description: "Thịt dê tươi tảng ướp 12 loại gia vị.",
      price: "399.000đ",
      tag: "Bán chạy",
      image: deNuongTang,
    },
    {
      id: 103,
      name: "Lẩu dê Hương Sơn",
      description: "Nước lẩu đậm đà từ xương dê hầm.",
      price: "399.000đ",
      image: lauDe,
    },
    {
      id: 104,
      name: "Dê xào sả ớt",
      description: "Thịt dê xào cùng sả, ớt cay thơm.",
      price: "289.000đ",
      image: deXaoLan,
    },
  ];

  const reasons = [
    {
      icon: <Leaf />,
      title: "Thịt dê tươi mỗi ngày",
      text: "Đảm bảo độ tươi ngon, không đông lạnh",
    },
    {
      icon: <ChefHat />,
      title: "Đầu bếp giàu kinh nghiệm",
      text: "Nhiều năm kinh nghiệm chế biến chuẩn vị",
    },
    {
      icon: <Clock />,
      title: "Phục vụ nhanh chóng",
      text: "Quy trình chuyên nghiệp, tiết kiệm thời gian",
    },
    {
      icon: <Award />,
      title: "Giá cả hợp lý",
      text: "Chất lượng xứng đáng với giá tiền",
    },
    {
      icon: <Users />,
      title: "Khách hàng là ưu tiên",
      text: "Tận tâm phục vụ, trải nghiệm hài lòng",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {showLoginToast && (
        <div className="fixed top-24 right-5 z-[999] bg-green-700 text-white px-5 py-3 rounded-xl shadow-2xl animate-bounce">
          Đăng nhập thành công!
        </div>
      )}
      {addCartToast && (
        <div className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 bg-green-900 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold animate-bounce text-center">
          {addCartToast}
        </div>
      )}

      {flyItem && (
        <img
          src={flyItem.image}
          alt=""
          className="fixed z-[9999] w-14 h-14 rounded-full object-cover pointer-events-none shadow-2xl animate-fly-to-cart"
          style={{
            left: flyItem.startX,
            top: flyItem.startY,
            "--end-x": `${flyItem.endX - flyItem.startX}px`,
            "--end-y": `${flyItem.endY - flyItem.startY}px`,
          }}
        />
      )}

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
            <a
              className="text-green-800 border-b-2 border-green-800 pb-2"
              href="#"
            >
              Trang chủ
            </a>
            <Link to="/menu">Thực đơn</Link>
            <Link to="/reservation">Đặt bàn</Link>
            <a href="#">Khuyến mãi</a>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
          </nav>

          <div className="hidden md:flex gap-3">
            {isLoggedIn ? (
              <div className="relative flex items-center gap-3">
                <Link
                  ref={cartIconRef}
                  to="/cart"
                  className="relative text-green-900"
                >
                  <ShoppingCart className="w-5 h-5" />

                  {totalCartQty > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center">
                      {totalCartQty}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-11 h-11 rounded-full bg-green-50 text-green-800 flex items-center justify-center border border-green-700 hover:bg-green-100 transition"
                >
                  <User className="w-6 h-6" />
                </button>
                {/* menu profile */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999]">
                    <Link
                      to="/profile"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <UserRound className="w-6 h-6" />
                      Thông tin tài khoản
                    </Link>

                    <Link
                      to="/order-history"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <ClipboardList className="w-6 h-6" />
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      to="/my-booking"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <CalendarCheck className="w-6 h-6" />
                      Đặt bàn của tôi
                    </Link>

                    <button
                      onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        setIsLoggedIn(false);
                        setIsProfileOpen(false);
                        setIsMenuOpen(false);
                        navigate("/home");
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 text-red-600 font-medium border-t"
                    >
                      <LogOut className="w-6 h-6" />
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
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-md">
            <nav className="px-5 py-4 flex flex-col gap-4 text-sm font-semibold text-green-950">
              <Link to="/home">Trang chủ</Link>
              <Link to="/menu">Thực đơn</Link>
              <Link to="/reservation">Đặt bàn</Link>
              <Link to="/deals">Khuyến mãi</Link>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/contact">Liên hệ</Link>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                {isLoggedIn ? (
                  <div ref={profileMenuRef} className="w-full">
                    <div className="flex items-center gap-4">
                      <Link to="/cart" className="relative text-green-900">
                        <ShoppingCart className="w-5 h-5" />

                        {totalCartQty > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center">
                            {totalCartQty}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full bg-green-50 text-green-800 flex items-center justify-center border border-green-700 hover:bg-green-100 transition"
                      >
                        <User className="w-7 h-7" />
                      </button>
                    </div>

                    {isProfileOpen && (
                      <div className="w-full mt-3 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
                        <Link
                          to="/profile"
                          className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition"
                        >
                          <UserRound className="w-5 h-5" />
                          Thông tin tài khoản
                        </Link>

                        <Link
                          to="/order-history"
                          className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium border-t"
                        >
                          <ClipboardList className="w-5 h-5" />
                          Lịch sử đơn hàng
                        </Link>

                        <Link
                          to="/my-booking"
                          className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium border-t"
                        >
                          <CalendarCheck className="w-5 h-5" />
                          Đặt bàn của tôi
                        </Link>

                        <button
                          onClick={() => {
                            localStorage.removeItem("isLoggedIn");
                            setIsLoggedIn(false);
                            setIsProfileOpen(false);
                            setIsMenuOpen(false);
                            navigate("/home");
                          }}
                          className="w-full flex items-center gap-4 px-4 py-3 text-red-600 font-medium border-t"
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
                      className="flex-1 border border-green-800 text-green-800 px-4 py-2 rounded-lg font-semibold text-center"
                    >
                      Đăng nhập
                    </Link>

                    <Link
                      to="/register"
                      className="flex-1 bg-green-800 text-white px-4 py-2 rounded-lg font-semibold text-center"
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
      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        {/* BACKGROUND SLIDER */}
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Dê Hương Sơn"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[2500ms] ease-in-out ${
              index === currentHero
                ? "opacity-100 scale-105"
                : "opacity-0 scale-100"
            }`}
          />
        ))}

        {/* OVERLAY CINEMATIC */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#fbf7ec]/45"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf7ec]/35 via-transparent to-transparent"></div>

        {/* LỚP MỜ CHỈ Ở GIỮA NỬA BÊN TRÁI */}
        <div
          className="
    absolute
    left-[6%]
    top-[48%]
    -translate-y-1/2
    w-[42%]
    h-[72%]
    rounded-full
    bg-white/45
    blur-3xl
  "
        ></div>
        <div className="relative max-w-7xl mx-auto px-5 pt-36 md:pt-48 pb-24 md:pb-36">
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="text-center max-w-2xl">
              <p
                className="text-5xl md:text-8xl text-green-800 mb-0 leading-none drop-shadow-sm"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Đặc sản
              </p>

              <h2 className="text-4xl md:text-7xl font-black text-green-900 uppercase leading-tight">
                Dê Hương Sơn
              </h2>

              <h3 className="text-2xl md:text-4xl font-bold text-green-800 tracking-[0.25em] mt-2">
                Hà Tĩnh
              </h3>

              <div className="flex items-center justify-center gap-4 my-5">
                <div className="w-28 h-px bg-green-700"></div>
                <Leaf className="w-6 h-6 text-green-800" />
                <div className="w-28 h-px bg-green-700"></div>
              </div>

              <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-7 leading-relaxed px-2">
                Thưởng thức hương vị dê núi Hương Sơn
                <br /> đậm đà bản sắc – tươi ngon, bổ dưỡng.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => navigate("/menu")}
                  className="bg-green-800 hover:bg-green-900 text-white px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold"
                >
                  <Leaf className="w-4 h-4 inline mr-2" />
                  Khám phá ngay
                </button>

                <button
                  onClick={() => navigate("/reservation")}
                  className="bg-[#c99a45] hover:bg-[#b88935] text-white px-5 py-2 rounded-full font-semibold shadow-lg border-2 border-white transition"
                >
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  Đặt bàn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-5 -mt-16 md:-mt-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
          <Feature
            icon={<Mountain />}
            title="Nguồn gốc rõ ràng"
            text="Dê núi Hương Sơn thả tự nhiên"
          />
          <Feature
            icon={<Leaf />}
            title="Nguyên liệu tươi"
            text="Tuyển chọn mỗi ngày, đảm bảo chất lượng"
          />
          <Feature
            icon={<CookingPot />}
            title="Chế biến truyền thống"
            text="Công thức gia truyền, chuẩn vị đặc trưng"
          />
          <Feature
            icon={<Heart />}
            title="An toàn vệ sinh"
            text="Đảm bảo vệ sinh, an tâm thưởng thức"
          />
        </div>
      </section>
      {/* DISHES */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-xl md:text-3xl font-black uppercase">
              Món ngon nổi bật
            </h2>
            <p className="text-xs md:text-base text-gray-600 mt-1">
              Những món ăn được yêu thích nhất tại Dê Hương Sơn
            </p>
          </div>

          <Link
            to="/menu"
            className="hidden md:block text-green-800 text-sm font-bold hover:text-green-900"
          >
            Xem tất cả thực đơn →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.name}
              className="dish-card bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 transition"
            >
              <div className="relative h-28 md:h-44 overflow-hidden">
                {dish.tag && (
                  <span className="absolute top-3 left-3 z-10 bg-green-800 text-white text-xs px-3 py-1 rounded-full uppercase">
                    {dish.tag}
                  </span>
                )}

                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-3 md:p-4">
                <h3 className="font-bold mb-1 text-sm md:text-base">
                  {dish.name}
                </h3>
                <p className="text-green-800 font-bold mb-3 md:mb-4 text-sm md:text-base">
                  {dish.price}
                </p>

                <button
                  onClick={(e) => addToCart(dish, e)}
                  className="w-full border border-green-800 text-green-800 rounded-lg py-2 text-sm font-semibold hover:bg-green-800 hover:text-white transition"
                >
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  Đặt món
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <span className="w-2 h-2 rounded-full bg-green-800"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        </div>
      </section>
      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-4 md:px-5 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="min-h-[420px] bg-amber-100 rounded-3xl flex items-center justify-center text-green-800 font-bold shadow-md">
            Khu vực ảnh nhà hàng / đầu bếp
          </div>

          <div className="bg-[#fffaf0] rounded-3xl p-8 md:p-10 shadow-md">
            <p
              className="text-4xl md:text-6xl text-green-700 text-center mb-3 leading-none"
              style={{ fontFamily: "'Allura', cursive" }}
            >
              Về chúng tôi
            </p>

            <h2 className="text-4xl font-black text-green-900 text-center mt-2 mb-5 uppercase">
              Dê Hương Sơn Hà Tĩnh
            </h2>

            <p className="text-gray-700 leading-relaxed mb-8 text-center">
              Chúng tôi tự hào mang đến đặc sản dê núi Hương Sơn với hương vị
              đậm đà, thơm ngon và bổ dưỡng. Từ khâu chọn nguyên liệu đến chế
              biến, mỗi món ăn đều được chăm chút bằng cả tâm huyết.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 text-center">
              <Info icon={<Mountain />} title="Đặc sản dê núi" />
              <Info icon={<Leaf />} title="Nguyên liệu tươi" />
              <Info icon={<CookingPot />} title="Chế biến truyền thống" />
              <Info icon={<Heart />} title="Không gian ấm cúng" />
            </div>

            <div className="text-center mt-8">
              <button className="bg-green-800 text-white px-7 py-3 rounded-full font-semibold hover:bg-green-900">
                Tìm hiểu thêm về chúng tôi →
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* WHY */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="bg-white rounded-3xl shadow-md p-5 md:p-8">
          <h2 className="text-lg md:text-2xl font-black text-center uppercase mb-5 md:mb-8">
            Vì sao chọn chúng tôi?
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 text-center">
            {reasons.map((item, index) => (
              <div
                key={item.title}
                className={
                  index === reasons.length - 1
                    ? "col-span-2 flex justify-center lg:col-span-1"
                    : ""
                }
              >
                <Why icon={item.icon} title={item.title} text={item.text} />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* PROMO + SPACE + REVIEWS */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-green-900 text-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase">
                Khuyến mãi hấp dẫn
              </h2>
              <PlayCircle className="w-6 h-6" />
            </div>

            <Promo title="Combo gia đình" discount="-20%" price="1.199.000đ" />
            <Promo
              title="Giảm giá đặt online"
              discount="-15%"
              price="Đặt ngay"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase">
                Không gian nhà hàng
              </h2>
              <div className="flex gap-2">
                <button className="w-7 h-7 rounded-full border">‹</button>
                <button className="w-7 h-7 rounded-full border">›</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="h-40 bg-amber-100 rounded-2xl flex items-center justify-center text-green-800 font-semibold col-span-2">
                Ảnh không gian lớn
              </div>
              <div className="h-28 bg-amber-100 rounded-2xl flex items-center justify-center text-sm">
                Ảnh 1
              </div>
              <div className="h-28 bg-amber-100 rounded-2xl flex items-center justify-center text-sm">
                Ảnh 2
              </div>
            </div>

            <button className="mt-5 w-full border border-green-800 text-green-800 py-2 rounded-lg font-semibold">
              Xem thêm hình ảnh
            </button>
          </div>

          <div className="bg-[#fffaf0] rounded-3xl p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-black uppercase mb-4 md:mb-5">
              Khách hàng nói về chúng tôi
            </h2>

            <Review
              name="Anh Minh"
              text="Món dê ở đây rất ngon, thịt mềm ngọt, không bị hôi."
            />
            <Review
              name="Chị Trang"
              text="Không gian ấm cúng, nhân viên nhiệt tình."
            />
            <Review
              name="Anh Quốc"
              text="Đặt bàn online tiện lợi, lên món nhanh."
            />
          </div>
        </div>
      </section>
      {/* SERVICE BAR */}
      <section className="max-w-7xl mx-auto px-5 pb-10">
        <div className="bg-white rounded-3xl shadow-md grid sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
          <Service
            icon={<ChefHat />}
            title="100% dê núi Hương Sơn"
            text="Nguồn gốc rõ ràng"
          />
          <Service
            icon={<Award />}
            title="Cam kết chất lượng"
            text="Tươi ngon mỗi ngày"
          />
          <Service
            icon={<Truck />}
            title="Giao hàng nhanh"
            text="Trong nội thành"
          />
          <Service
            icon={<Phone />}
            title="Hotline đặt bàn"
            text="076 877 4619"
          />
        </div>
      </section>
      {/* FOOTER */}
      <footer className="bg-green-950 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-7 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div>
            <Link
              to="/home"
              onClick={scrollToTop}
              className="flex items-center gap-2 mb-3"
            >
              <Leaf className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold leading-5">Dê Hương Sơn</h3>
              </div>
            </Link>

            <p className="text-white/75 text-sm leading-relaxed mb-2 md:mb-5 max-w-xs">
              Dê núi Hương Sơn – đậm đà bản sắc, tươi ngon, bổ dưỡng.
            </p>
          </div>

          {/* Thông tin liên hệ */}
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

          {/* Giờ mở cửa */}
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

          {/* Kết nối với chúng tôi */}
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
      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => navigate("/login")}
        />
      )}
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="p-4 md:p-6 border border-gray-100 text-center">
      <div className="w-10 h-10 md:w-13 md:h-13 rounded-full border border-green-800 flex items-center justify-center text-green-800 mb-2 md:mb-3 mx-auto">
        {icon}
      </div>

      <h3 className="font-bold mb-1 text-sm md:text-base leading-snug">
        {title}
      </h3>

      <p className="text-[13px] md:text-sm text-gray-600 leading-snug">
        {text}
      </p>
    </div>
  );
}

function Info({ icon, title }) {
  return (
    <div>
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-2 md:mb-3 text-green-800">
        {icon}
      </div>
      <h3 className="font-bold text-green-900 text-[13px] md:text-sm leading-snug">
        {title}
      </h3>
      <p className="text-[11px] md:text-xs text-gray-600 mt-1">
        Chuẩn vị đặc trưng
      </p>
    </div>
  );
}

function Why({ icon, title, text }) {
  return (
    <div className="px-1 md:px-3">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-green-800 flex items-center justify-center mx-auto mb-2 md:mb-3 text-green-800">
        {icon}
      </div>

      <h3 className="font-bold mb-1 text-[13px] md:text-sm leading-snug">
        {title}
      </h3>

      <p className="text-[11px] md:text-xs text-gray-600 leading-snug">
        {text}
      </p>
    </div>
  );
}

function Promo({ title, discount, price }) {
  return (
    <div className="bg-white text-green-950 rounded-2xl p-4 mb-4 flex items-center gap-4">
      <div className="w-24 h-24 bg-amber-100 rounded-2xl flex items-center justify-center text-xs text-green-800">
        Ảnh món
      </div>

      <div className="flex-1">
        <span className="bg-green-800 text-white px-3 py-1 rounded-full text-xs font-bold">
          {discount}
        </span>
        <h3 className="font-bold mt-2">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">
          Ưu đãi đặc biệt dành cho khách hàng.
        </p>
        <p className="font-black text-green-800 mt-2">{price}</p>
      </div>
    </div>
  );
}

function Review({ name, text }) {
  return (
    <div className="bg-white rounded-2xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="font-bold text-green-900 text-sm">{name}</p>
        <div className="text-yellow-500 text-xs md:text-sm">★★★★★</div>
      </div>

      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function Service({ icon, title, text }) {
  return (
    <div className="p-5 flex items-center gap-4 border-b lg:border-r border-gray-100 last:border-r-0">
      <div className="w-11 h-11 rounded-full bg-green-50 text-green-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{text}</p>
      </div>
    </div>
  );
}

function FooterItem({ icon, title, text }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          {icon}
        </span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-white/75 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
function LoginRequiredModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 py-8 text-center relative">
        <div className="w-28 h-28 rounded-full bg-[#fbf3df] mx-auto flex items-center justify-center relative">
          <div className="w-16 h-16 rounded-2xl border-4 border-green-800 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-4 border-green-800"></div>
          </div>

          <div className="absolute right-4 bottom-5 w-12 h-12 rounded-xl bg-[#d6a84f] flex items-center justify-center text-white text-xl">
            🔒
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-black text-green-950 leading-tight">
          Vui lòng đăng nhập
          <br />
          để đặt món và đặt bàn
        </h2>

        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-20 h-px bg-[#d6a84f]"></div>
          <span className="text-[#b88935]">🐐</span>
          <div className="w-20 h-px bg-[#d6a84f]"></div>
        </div>

        <p className="text-sm text-gray-500 mt-5 leading-relaxed">
          Đăng nhập để lưu thông tin, theo dõi đơn hàng
          <br />
          và nhận nhiều ưu đãi hấp dẫn từ Dê Hương Sơn.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={onClose}
            className="
      h-14 rounded-2xl
      border-2 border-[#e7d8bb]
      text-gray-700
      font-bold
      hover:bg-[#faf7ef]
      transition
    "
          >
            Bỏ qua
          </button>

          <button
            onClick={onLogin}
            className="
      h-14 rounded-2xl
      bg-green-900
      text-white
      font-bold
      hover:bg-green-950
      transition
      shadow-lg
    "
          >
            Đăng nhập / Đăng ký
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-gray-500">
          <p>Không đặt món, đặt bàn</p>
          <p>Tiếp tục đặt món, đặt bàn</p>
        </div>
      </div>
    </div>
  );
}
export default Home;
