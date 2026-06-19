import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import LoginRequiredModal from "../components/LoginRequiredModal";

import goatIcon from "../assets/images/Icon_De.png";
import hero1 from "../assets/images/Home/hero-1.png";
import hero2 from "../assets/images/Home/hero-2.png";
import hero3 from "../assets/images/Home/hero-3.png";
import hero4 from "../assets/images/Home/hero-4.png";
import homeSpace from "../assets/images/Home/home-space.png";

import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import deXaoLan from "../assets/images/menu/de-xao-lan.jpg";
import deHapTiaTo from "../assets/images/menu/de-hap-tia-to.jpg";

import comboCardImg from "../assets/images/Deals/combo-card.png";
import onlineCardImg from "../assets/images/Deals/online-card.png";

import tangTret from "../assets/images/About/tang-tret.png";
import tangTret1 from "../assets/images/About/tang-tret-1.png";
import tangTret2 from "../assets/images/About/tang-tret-2.png";
import tangTret3 from "../assets/images/About/tang-tret-3.png";
import tangTret4 from "../assets/images/About/tang-tret-4.png";
import tangTret5 from "../assets/images/About/tang-tret-5.png";

import tangHai from "../assets/images/About/tang-hai.png";
import tangHai1 from "../assets/images/About/tang-hai-1.png";
import tangHai2 from "../assets/images/About/tang-hai-2.png";
import tangHai3 from "../assets/images/About/tang-hai-3.png";
import tangHai4 from "../assets/images/About/tang-hai-4.png";
import tangHai5 from "../assets/images/About/tang-hai-5.png";

import phongVip from "../assets/images/About/phong-vip.png";
import phongVip1 from "../assets/images/About/phong-vip-1.png";
import phongVip2 from "../assets/images/About/phong-vip-2.png";
import phongVip3 from "../assets/images/About/phong-vip-3.png";
import phongVip4 from "../assets/images/About/phong-vip-4.png";
import phongVip5 from "../assets/images/About/phong-vip-5.png";

import {
  Leaf,
  ShoppingCart,
  CalendarDays,
  ChefHat,
  Heart,
  Phone,
  Clock,
  Mountain,
  CookingPot,
  X,
  Users,
  Award,
  Truck,
} from "lucide-react";

const SPACE_TABS = [
  {
    key: "ground",
    label: "Tầng trệt",
    images: [tangTret, tangTret1, tangTret2, tangTret3, tangTret4, tangTret5],
  },
  {
    key: "floor2",
    label: "Tầng 2",
    images: [tangHai, tangHai1, tangHai2, tangHai3, tangHai4, tangHai5],
  },
  {
    key: "vip",
    label: "Phòng VIP",
    images: [phongVip, phongVip1, phongVip2, phongVip3, phongVip4, phongVip5],
  },
];

function Home() {
  const navigate = useNavigate();
  const heroImages = [hero1, hero2, hero3, hero4];

  const [currentHero, setCurrentHero] = useState(0);

  const location = useLocation();
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [toast, setToast] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);

  const [activeSpaceTab, setActiveSpaceTab] = useState("ground");
  const [previewImage, setPreviewImage] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const parsePrice = (price) => {
    return Number(price.replace(/[^\d]/g, ""));
  };

  const addToCart = (dish) => {
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

    setToast({ dishName: dish.name });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [dishSlide, setDishSlide] = useState(0);

  useEffect(() => {
    if (location.state?.openSpace) {
      setActiveSpaceTab(location.state.openSpace);
      setShowSpaceModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    const loginStatus =
      localStorage.getItem("isLoggedIn") === "true" ||
      sessionStorage.getItem("isLoggedIn") === "true";

    setIsLoggedIn(loginStatus);
  }, [location.pathname]);

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

  const activeSpace =
    SPACE_TABS.find((item) => item.key === activeSpaceTab) || SPACE_TABS[0];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (previewImage) {
          setPreviewImage(null);
          return;
        }

        if (showSpaceModal) {
          setShowSpaceModal(false);
        }
      }

      if (!previewImage) return;

      if (e.key === "ArrowLeft") {
        const newIndex =
          previewIndex === 0 ? activeSpace.images.length - 1 : previewIndex - 1;

        setPreviewIndex(newIndex);
        setPreviewImage(activeSpace.images[newIndex]);
      }

      if (e.key === "ArrowRight") {
        const newIndex =
          previewIndex === activeSpace.images.length - 1 ? 0 : previewIndex + 1;

        setPreviewIndex(newIndex);
        setPreviewImage(activeSpace.images[newIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage, previewIndex, activeSpace, showSpaceModal]);
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
    {
      id: 105,
      name: "Sườn dê nướng",
      description: "Sườn dê ướp gia vị đặc biệt, nướng thơm trên than hoa.",
      price: "269.000đ",
      image: deNuongTang,
    },
    {
      id: 106,
      name: "Dê tái chanh",
      description: "Thịt dê tái chanh chua nhẹ, ăn kèm rau thơm.",
      price: "229.000đ",
      image: deHapTiaTo,
    },
    {
      id: 107,
      name: "Dê xào lăn",
      description: "Thịt dê xào lăn béo thơm, đậm vị.",
      price: "289.000đ",
      image: deXaoLan,
    },
    {
      id: 108,
      name: "Lẩu dê thuốc bắc",
      description: "Lẩu dê hầm cùng thuốc bắc, bổ dưỡng.",
      price: "429.000đ",
      image: lauDe,
    },
  ];

  //danh sách món
  const dishesPerSlide = 4;
  const totalDishSlides = Math.ceil(dishes.length / dishesPerSlide);

  const visibleDishes = dishes.slice(
    dishSlide * dishesPerSlide,
    dishSlide * dishesPerSlide + dishesPerSlide,
  );

  // khuyến mãi
  const promos = [
    {
      id: "family-combo",
      title: "Combo gia đình",
      discount: "-20%",
      price: "Đặt ngay",
      image: comboCardImg,
      desc: "Ưu đãi đặc biệt dành cho khách đi theo nhóm gia đình.",
    },
    {
      id: "online-order",
      title: "Giảm giá đặt online",
      discount: "-10%",
      price: "Đặt ngay",
      image: onlineCardImg,
      desc: "Ưu đãi khi đặt món online qua website.",
    },
  ];

  const reasons = [
    {
      icon: (
        <img
          src={goatIcon}
          alt="Dê Hương Sơn"
          className="w-7 h-7 object-contain"
        />
      ),
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
      {/* SƯƠNG MỜ */}
      <div className="fog fog-1"></div>
      <div className="fog fog-2"></div>
      <div className="leaf-float">
        <span>🍂</span>
        <span>🍁</span>
        <span>🍂</span>
        <span>🍁</span>
        <span>🍂</span>
        <span>🍁</span>
        <span>🍂</span>
        <span>🍁</span>
      </div>
      {showLoginToast && (
        <div className="fixed top-24 right-5 z-[999] bg-green-700 text-white px-5 py-3 rounded-xl shadow-2xl animate-bounce">
          Đăng nhập thành công!
        </div>
      )}

      {/* // Toast thông báo thêm món vào giỏ hàng */}
      {toast && (
        <div className="fixed top-20 right-5 z-[9999]">
          <div className="bg-white border border-[#eadfcd] shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 w-[330px] max-w-[calc(100vw-32px)] animate-[slideIn_.25s_ease-out]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-50">
              <ShoppingCart className="w-5 h-5 text-green-700" />
            </div>

            <div>
              <p className="font-black text-green-900 tracking-wide">
                Đã thêm vào giỏ hàng
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-black text-[#b88935]">
                  "{toast.dishName}"
                </span>{" "}
                đã được thêm vào giỏ hàng
              </p>
            </div>
          </div>
        </div>
      )}

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

        {/* OVERLAY SÁNG NHẸ */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbf7ec]/35"></div>

        {/* LỚP MỜ NHẸ Ở NỬA BÊN TRÁI */}
        <div className="absolute left-[4%] top-[48%] -translate-y-1/2 w-[48%] h-[78%] rounded-full bg-white/75 blur-3xl"></div>
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
                <img
                  src={goatIcon}
                  alt="Dê Hương Sơn"
                  className="w-10 h-10 object-contain"
                />
                <div className="w-28 h-px bg-green-700"></div>
              </div>

              <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-7 leading-relaxed px-2">
                Thưởng thức hương vị dê núi Hương Sơn
                <br /> đậm đà bản sắc – tươi ngon, bổ dưỡng.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => navigate("/about")}
                  className="bg-green-800 text-white px-5 md:px-7 py-2.5 md:py-3 rounded-full font-semibold border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                >
                  <Leaf className="w-4 h-4 inline mr-2" />
                  Khám phá ngay
                </button>

                <div className="booking-wrapper">
                  <button
                    onClick={() => navigate("/booking")}
                    className=" bg-[#c99a45] hover:bg-[#b88935] text-white px-5 md:px-7 py-2.5 md:py-3 rounded-full font-bold text-sm md:text-base border-2 border-white shadow-lg transition-all duration-300"
                  >
                    <CalendarDays className="w-4 h-4 inline mr-2" />
                    Đặt bàn ngay
                  </button>
                </div>
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
            icon={
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-7 h-7 object-contain"
              />
            }
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
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p
              className="text-3xl md:text-4xl text-[#c99a45] leading-none mb-1"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Món ngon
            </p>

            <h2 className="text-2xl md:text-4xl font-black uppercase text-green-700">
              Món ngon nổi bật
            </h2>

            <p className="text-sm md:text-base text-gray-600 mt-2">
              Những món ăn được yêu thích nhất tại Dê Hương Sơn
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() =>
                  setDishSlide((prev) =>
                    prev === 0 ? totalDishSlides - 1 : prev - 1,
                  )
                }
                className="w-11 h-11 rounded-full border border-green-800 text-green-800 flex items-center justify-center text-2xl hover:bg-green-800 hover:text-white transition"
              >
                ‹
              </button>

              <button
                onClick={() =>
                  setDishSlide((prev) =>
                    prev === totalDishSlides - 1 ? 0 : prev + 1,
                  )
                }
                className="w-11 h-11 rounded-full border border-green-800 text-green-800 flex items-center justify-center text-2xl hover:bg-green-800 hover:text-white transition"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div
          key={dishSlide}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-[fadeIn_.35s_ease-out]"
        >
          {visibleDishes.map((dish) => (
            <div
              key={dish.id}
              className="dish-card bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 hover:shadow-xl transition duration-300"
            >
              <div className="relative h-32 md:h-48 overflow-hidden">
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
                <h3 className="font-black text-green-950 mb-1 text-sm md:text-lg line-clamp-1">
                  {dish.name}
                </h3>

                <p className="text-green-800 font-black mb-3 md:mb-5 text-base md:text-xl">
                  {dish.price}
                </p>

                <button
                  onClick={() => addToCart(dish)}
                  className="w-full border border-green-800 text-green-800 rounded-xl py-2.5 text-sm md:text-base font-black hover:bg-green-800 hover:text-white transition"
                >
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  Đặt món
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE ARROWS */}
        <div className="md:hidden flex justify-center gap-3 mt-6">
          <button
            onClick={() =>
              setDishSlide((prev) =>
                prev === 0 ? totalDishSlides - 1 : prev - 1,
              )
            }
            className="w-10 h-10 rounded-full border border-green-800 text-green-800 flex items-center justify-center text-2xl"
          >
            ‹
          </button>

          <button
            onClick={() =>
              setDishSlide((prev) =>
                prev === totalDishSlides - 1 ? 0 : prev + 1,
              )
            }
            className="w-10 h-10 rounded-full border border-green-800 text-green-800 flex items-center justify-center text-2xl"
          >
            ›
          </button>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalDishSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setDishSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dishSlide === index
                  ? "w-8 bg-green-800"
                  : "w-2 bg-gray-300 hover:bg-green-300"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-green-800 text-green-800 font-bold hover:bg-green-800 hover:text-white transition"
          >
            Xem tất cả thực đơn →
          </Link>
        </div>
      </section>
      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-4 md:px-5 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="min-h-[420px] rounded-3xl overflow-hidden shadow-md">
            <img
              src={homeSpace}
              alt="Không gian nhà hàng Dê Hương Sơn"
              className="w-full h-full object-cover"
            />
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
              <Info
                icon={
                  <img
                    src={goatIcon}
                    alt="Dê Hương Sơn"
                    className="w-7 h-7 object-contain"
                  />
                }
                title="Nguyên liệu tươi"
              />
              <Info icon={<CookingPot />} title="Chế biến truyền thống" />
              <Info icon={<Heart />} title="Không gian ấm cúng" />
            </div>

            <div className="text-center mt-8">
              <Link
                to="/about"
                className="group inline-flex items-center justify-center bg-green-800 text-white px-5.5 py-2.5 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Tìm hiểu thêm về chúng tôi
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* WHY */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="bg-white rounded-3xl shadow-md p-5 md:p-8">
          <h2 className="text-lg md:text-2xl font-black text-center uppercase mb-5 md:mb-8 text-green-700">
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
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-7 h-7 object-contain brightness-0 invert"
              />
            </div>

            {promos.map((promo) => (
              <Promo
                key={promo.id}
                {...promo}
                onClick={() => navigate(`/deals/${promo.id}`)}
              />
            ))}

            <div className="flex justify-center">
              <Link
                to="/deals"
                className="group inline-flex items-center justify-center bg-white text-green-800 px-4.5 py-2 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
              >
                Xem tất cả khuyến mãi
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase text-green-700">
                Không gian nhà hàng
              </h2>

              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition">
                  ‹
                </button>
                <button className="w-8 h-8 rounded-full border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition">
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setActiveSpaceTab("ground");
                  setShowSpaceModal(true);
                }}
                className="relative h-40 rounded-2xl overflow-hidden col-span-2 group"
              >
                <img
                  src={tangTret}
                  alt="Không gian nhà hàng"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/25" />
                <p className="absolute bottom-4 left-4 text-white font-black">
                  Khu vực tầng trệt
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveSpaceTab("floor2");
                  setShowSpaceModal(true);
                }}
                className="relative h-28 rounded-2xl overflow-hidden group"
              >
                <img
                  src={tangHai}
                  alt="Khu vực tầng 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/25" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-bold">
                  Tầng 2
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveSpaceTab("vip");
                  setShowSpaceModal(true);
                }}
                className="relative h-28 rounded-2xl overflow-hidden group"
              >
                <img
                  src={phongVip}
                  alt="Phòng VIP"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/25" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-bold">
                  Phòng VIP
                </p>
              </button>
            </div>

            <button
              onClick={() => {
                setActiveSpaceTab("ground");
                setShowSpaceModal(true);
              }}
              className="mt-5 w-full border border-green-800 text-green-800 py-2 rounded-lg font-semibold hover:bg-green-800 hover:text-white transition"
            >
              Xem thêm hình ảnh
            </button>
          </div>

          <div className="bg-[#fffaf0] rounded-3xl p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-black uppercase mb-4 md:mb-5 text-green-700">
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
            text="038 713 6878"
          />
        </div>
      </section>

      {/*xem không gian*/}
      {showSpaceModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowSpaceModal(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-[#fffaf0] rounded-3xl shadow-2xl p-5 md:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSpaceModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-green-900 text-white flex items-center justify-center hover:bg-green-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl md:text-3xl font-black text-green-900 uppercase text-center">
              Không gian nhà hàng
            </h2>

            <div className="flex items-center justify-center gap-3 mt-3 mb-6">
              <div className="w-16 h-px bg-[#d6a84f]" />
              <img src={goatIcon} alt="" className="w-7 h-7 object-contain" />
              <div className="w-16 h-px bg-[#d6a84f]" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {SPACE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSpaceTab(tab.key)}
                  className={`h-11 rounded-xl border font-black transition ${
                    activeSpaceTab === tab.key
                      ? "bg-green-900 text-white border-green-900"
                      : "bg-white text-green-900 border-[#eadfcd] hover:bg-green-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[430px] overflow-y-auto pr-1">
              {activeSpace.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPreviewImage(image);
                    setPreviewIndex(index);
                  }}
                  className="h-32 md:h-44 rounded-2xl overflow-hidden border border-[#eadfcd] group"
                >
                  <img
                    src={image}
                    alt={activeSpace.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Nhấn vào ảnh để xem lớn hơn
            </p>
          </div>
        </div>
      )}

      {/* popup xem ảnh toàn màn hình */}
      {previewImage && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center px-4">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white text-green-900 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              const newIndex =
                previewIndex === 0
                  ? activeSpace.images.length - 1
                  : previewIndex - 1;

              setPreviewIndex(newIndex);
              setPreviewImage(activeSpace.images[newIndex]);
            }}
            className="absolute left-5 w-12 h-12 rounded-full bg-white/90 text-green-900 text-3xl flex items-center justify-center"
          >
            ‹
          </button>

          <img
            src={previewImage}
            alt=""
            className="max-w-[90vw] max-h-[82vh] object-contain rounded-2xl shadow-2xl"
          />

          <button
            onClick={() => {
              const newIndex =
                previewIndex === activeSpace.images.length - 1
                  ? 0
                  : previewIndex + 1;

              setPreviewIndex(newIndex);
              setPreviewImage(activeSpace.images[newIndex]);
            }}
            className="absolute right-5 w-12 h-12 rounded-full bg-white/90 text-green-900 text-3xl flex items-center justify-center"
          >
            ›
          </button>

          <div className="absolute top-6 left-6 text-white font-bold">
            {activeSpace.label} - {previewIndex + 1} /{" "}
            {activeSpace.images.length}
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            ← → Chuyển ảnh • ESC Đóng
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

function SpaceItem({ image, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl overflow-hidden border border-[#eadfcd] bg-[#fffaf0] text-left hover:-translate-y-1 hover:shadow-xl transition"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-4">
        <h3 className="font-black text-green-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
    </button>
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

function Promo({ title, discount, price, image, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white text-green-950 rounded-2xl p-4 mb-4 flex items-center gap-4 text-left hover:-translate-y-1 hover:shadow-xl transition group"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-100 shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      <div className="flex-1 min-w-0">
        <span className="bg-green-800 text-white px-3 py-1 rounded-full text-xs font-bold">
          {discount}
        </span>

        <h3 className="font-black mt-2 text-green-950 line-clamp-1">{title}</h3>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{desc}</p>

        <p className="font-black text-green-800 mt-2">{price}</p>
      </div>
    </button>
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

export default Home;
