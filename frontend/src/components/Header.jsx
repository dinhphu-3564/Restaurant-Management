import { checkLogin } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import goatIcon from "../assets/images/Icon_De.png";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  UserRound,
  ClipboardList,
  CalendarCheck,
  LogOut,
} from "lucide-react";

function Header({ currentPage = "home" }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => checkLogin());
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const navRef = useRef(null);

  const [indicatorStyle, setIndicatorStyle] = useState({
    x: 0,
    width: 0,
  });

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const menus = [
    { name: "Trang chủ", path: "/home", key: "home" },
    { name: "Thực đơn", path: "/menu", key: "menu" },
    { name: "Đặt bàn", path: "/reservation", key: "reservation" },
    { name: "Khuyến mãi", path: "/deals", key: "deals" },
    { name: "Giới thiệu", path: "/about", key: "about" },
    { name: "Liên hệ", path: "/contact", key: "contact" },
  ];

  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(checkLogin());
    };

    updateLoginStatus();

    const updateCart = () => {
      const savedCart = localStorage.getItem("cartItems");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    window.addEventListener("storage", updateCart);

    window.addEventListener("loginStatusChanged", updateLoginStatus);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("loginStatusChanged", updateLoginStatus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const outsideDesktop =
        desktopProfileRef.current &&
        !desktopProfileRef.current.contains(event.target);

      const outsideMobile =
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(event.target);

      if (outsideDesktop && outsideMobile) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //thanh xanh trượt
  useEffect(() => {
    const moveIndicator = () => {
      const activeItem = navRef.current?.querySelector(`[data-active="true"]`);

      if (activeItem) {
        setIndicatorStyle({
          x: activeItem.offsetLeft,
          width: activeItem.offsetWidth,
        });
      }
    };

    moveIndicator();

    window.addEventListener("resize", moveIndicator);

    return () => {
      window.removeEventListener("resize", moveIndicator);
    };
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUser");

    setIsLoggedIn(false);
    setIsProfileOpen(false);
    setIsMenuOpen(false);

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/home");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
        <Link
          to="/home"
          onClick={scrollToTop}
          className="flex items-center gap-2"
        >
          <img
            src={goatIcon}
            alt="Dê Hương Sơn"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="font-bold text-green-800 leading-4">Dê Hương Sơn</h1>
            <p className="text-xs text-green-700 font-medium">HÀ TĨNH</p>
          </div>
        </Link>

        <nav
          ref={navRef}
          className="hidden lg:flex gap-8 text-sm font-semibold relative items-center pb-1"
        >
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-green-800 rounded-full transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{
              width: `${indicatorStyle.width}px`,
              transform: `translateX(${indicatorStyle.x}px)`,
            }}
          />
          {menus.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              data-active={currentPage === item.key}
              className={`pb-3 transition-all duration-300 ${
                currentPage === item.key
                  ? "text-green-800"
                  : "text-green-950 hover:text-green-800"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex gap-3">
          {isLoggedIn ? (
            <div
              ref={desktopProfileRef}
              className="relative flex items-center gap-3"
            >
              <Link to="/cart" className="relative text-green-900">
                <ShoppingCart className="w-5 h-5" />

                {totalCartQty > 0 && (
                  <span className="absolute -top-5 -right-4 min-w-[22px] h-[22px] px-1.5 bg-red-600 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
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

              {isProfileOpen && <ProfileMenu onLogout={handleLogout} />}
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
            {menus.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={
                  currentPage === item.key ? "text-green-800 font-black" : ""
                }
              >
                {item.name}
              </Link>
            ))}

            <div className="flex gap-3 pt-3 border-t border-gray-100">
              {isLoggedIn ? (
                <div ref={mobileProfileRef} className="w-full">
                  <div className="flex items-center gap-4">
                    <Link to="/cart" className="relative text-green-900">
                      <ShoppingCart className="w-5 h-5" />

                      {totalCartQty > 0 && (
                        <span className="absolute -top-5 -right-4 min-w-[22px] h-[22px] px-1.5 bg-red-600 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                          {totalCartQty}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-12 h-12 rounded-full bg-green-50 text-green-800 flex items-center justify-center border border-green-700"
                    >
                      <User className="w-7 h-7" />
                    </button>
                  </div>

                  {isProfileOpen && (
                    <div className="mt-3">
                      <ProfileMenu onLogout={handleLogout} mobile />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 text-center border border-green-800 text-green-800 px-4 py-2 rounded-lg font-semibold"
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    to="/register"
                    className="flex-1 text-center bg-green-800 text-white px-4 py-2 rounded-lg font-semibold"
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
  );
}

function ProfileMenu({ onLogout, mobile = false }) {
  return (
    <div
      className={
        mobile
          ? "w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md"
          : "absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999]"
      }
    >
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
        onClick={onLogout}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 text-red-600 font-medium border-t"
      >
        <LogOut className="w-5 h-5" />
        Đăng xuất
      </button>
    </div>
  );
}

export default Header;
