import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Leaf,
  Menu,
  X,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { GiMeat, GiCampCookingPot, GiBarbecue } from "react-icons/gi";

import {
  PiBowlFoodLight,
  PiCookingPotLight,
  PiCoffeeLight,
} from "react-icons/pi";

import { TbSoup } from "react-icons/tb";

import deTaiChanh from "../assets/images/menu/de-tai-chanh.jpg";
import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import deXaoLan from "../assets/images/menu/de-xao-lan.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import deHapTiaTo from "../assets/images/menu/de-hap-tia-to.jpg";
import suonDeNuong from "../assets/images/menu/suon-de-nuong.jpg";

function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả món");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState("Món khác");
  const [selectedDish, setSelectedDish] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");
  const modalScrollRef = useRef(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const previewImages =
    selectedDish?.images?.length > 0
      ? selectedDish.images
      : [selectedDish?.image];
  useEffect(() => {
    if (selectedDish) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDish]);
  //chuyển về đầu trang menu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const categories = [
    {
      name: "Tất cả món",
      icon: <GiMeat className="w-5 h-5" />,
    },

    {
      name: "Món khai vị",
      icon: <TbSoup className="w-5 h-5" />,
    },

    {
      name: "Dê hấp",
      icon: <PiCookingPotLight className="w-5 h-5" />,
    },

    {
      name: "Dê nướng",
      icon: <GiBarbecue className="w-5 h-5" />,
    },

    {
      name: "Dê xào",
      icon: <PiBowlFoodLight className="w-5 h-5" />,
    },

    {
      name: "Dê lẩu",
      icon: <GiCampCookingPot className="w-5 h-5" />,
    },

    {
      name: "Món khác",
      icon: <PiBowlFoodLight className="w-5 h-5" />,
      children: ["Hải sản", "Bò", "Heo", "Gà", "Vịt", "Ếch", "Cá", "Món chay"],
    },

    {
      name: "Đồ uống",
      icon: <PiCoffeeLight className="w-5 h-5" />,
    },
  ];
  const dishes = [
    {
      name: "Dê tái chanh",
      description: "Thịt dê tươi tái chanh, thơm ngon, đậm vị.",
      price: "129.000đ",
      category: "Món khai vị",
      image: deTaiChanh,
      status: "available",
    },
    {
      name: "Dê nướng tảng",
      description: "Thịt dê nướng tảng ướp gia vị đặc biệt.",
      price: "399.000đ",
      category: "Dê nướng",
      image: deNuongTang,
      status: "low",
    },
    {
      name: "Dê xào lăn",
      description: "Thịt dê xào cùng sả, ớt, hành tây, thơm nồng.",
      price: "289.000đ",
      category: "Dê xào",
      image: deXaoLan,
      status: "available",
    },
    {
      name: "Lẩu dê Hương Sơn",
      description: "Nước lẩu đậm đà từ xương dê, ăn kèm rau tươi.",
      price: "399.000đ",
      category: "Dê lẩu",
      image: lauDe,
      status: "soldout",
    },
    {
      name: "Dê hấp tía tô",
      description: "Thịt dê hấp cùng lá tía tô, giữ trọn vị ngọt tự nhiên.",
      price: "399.000đ / đĩa",
      category: "Dê hấp",
      image: deHapTiaTo,
      status: "available",
    },
    {
      name: "Sườn dê nướng",
      description: "Sườn dê nướng thơm lừng, mềm ngọt tự nhiên.",
      price: "449.000đ / đĩa",
      category: "Dê nướng",
      image: suonDeNuong,
      status: "soldout",
    },
  ];

  const filteredDishes =
    selectedCategory === "Tất cả món"
      ? dishes
      : dishes.filter((dish) => dish.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-sm">
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
            <Link to="/">Trang chủ</Link>
            <Link
              to="/menu"
              className="text-green-800 border-b-2 border-green-800 pb-2"
            >
              Thực đơn
            </Link>
            <a href="#">Đặt bàn</a>
            <a href="#">Khuyến mãi</a>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
          </nav>

          <div className="hidden md:flex gap-3">
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
              <Link to="/">Trang chủ</Link>
              <Link to="/menu">Thực đơn</Link>
              <a href="#">Đặt bàn</a>
              <a href="#">Khuyến mãi</a>
              <a href="#">Giới thiệu</a>
              <a href="#">Liên hệ</a>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
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
              </div>
            </nav>
          </div>
        )}
      </header>
      <div className="h-16"></div>

      {/* BANNER */}
      <section className="bg-[#f6ecd8] py-6 md:py-8 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-5 grid md:grid-cols-2 gap-5 md:gap-8 items-center">
          <div className="text-center md:text-left">
            <p
              className="text-4xl text-[#c99a45] mb-1"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Menu
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-green-900 leading-tight">
              Thực đơn đặc sắc
            </h1>

            <p className="mt-4 text-gray-600 max-w-xl">
              Tinh hoa ẩm thực dê núi Hương Sơn – tươi ngon, đậm vị, chuẩn đặc
              sản Hà Tĩnh.
            </p>
          </div>

          <div className="h-36 md:h-52 rounded-3xl bg-white shadow-md overflow-hidden">
            <img
              src={deNuongTang}
              alt="Thực đơn dê Hương Sơn"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="w-full max-w-[1800px] mx-auto px-0 md:px-6 2xl:px-10 py-8 md:py-10">
        <div className="grid lg:grid-cols-[250px_1fr] gap-6">
          {/* SIDEBAR */}
          <aside className="hidden lg:block bg-white rounded-3xl shadow-md p-4 h-fit lg:sticky lg:top-24 lg:self-start overflow-hidden">
            <h2 className="font-black text-lg mb-4 text-green-900">
              Danh mục món
            </h2>

            <div className="flex lg:block gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:space-y-2">
              {categories.map((category) => (
                <div key={category.name}>
                  {/* CATEGORY BUTTON */}
                  <button
                    onClick={() => {
                      if (category.children) {
                        setOpenCategory(
                          openCategory === category.name ? "" : category.name,
                        );
                      } else {
                        setSelectedCategory(category.name);
                      }
                    }}
                    className={`shrink-0 lg:w-full flex items-center justify-between gap-2 md:gap-3 px-4 py-2.5 lg:py-3 rounded-xl font-semibold transition text-sm md:text-base w-full ${
                      selectedCategory === category.name
                        ? "bg-green-800 text-white"
                        : "text-green-900 hover:bg-[#f6ecd8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {category.icon}
                      <span>{category.name}</span>
                    </div>

                    {category.children &&
                      (openCategory === category.name ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </button>

                  {/* SUB MENU */}
                  {category.children && openCategory === category.name && (
                    <div className="ml-7 mt-3 space-y-3 border-l border-[#e7dcc6] pl-5">
                      {category.children.map((child) => (
                        <button
                          key={child}
                          onClick={() => setSelectedCategory(child)}
                          className={`block text-left text-sm transition ${
                            selectedCategory === child
                              ? "text-[#c99a45] font-bold"
                              : "text-gray-600 hover:text-green-800"
                          }`}
                        >
                          • {child}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* LIST MENU */}
          <main className="w-full min-w-0 lg:pr-3">
            {/* TOP BAR */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-md p-5 mb-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-green-900">
                    {categories.find((item) =>
                      item.children?.includes(selectedCategory),
                    )
                      ? `Món khác > ${selectedCategory}`
                      : selectedCategory}
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Chọn món yêu thích và thêm vào giỏ hàng.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="h-11 bg-[#fbf7ec] rounded-xl px-4 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm món ăn..."
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>

                  <button className="h-11 bg-[#fbf7ec] rounded-xl px-4 flex items-center gap-2 text-sm font-semibold">
                    Sắp xếp: Món mới
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* MOBILE CATEGORY BAR */}
            <div className="lg:hidden mb-5 px-4">
              {/* HEADER */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-black text-green-900">
                  {categories.find((item) =>
                    item.children?.includes(selectedCategory),
                  )
                    ? `Món khác > ${selectedCategory}`
                    : selectedCategory}
                </h2>

                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-green-800">
                    <Search className="w-4 h-4" />
                  </button>

                  <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-green-800">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CATEGORY LIST */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      if (category.children) {
                        setOpenCategory(
                          openCategory === category.name ? "" : category.name,
                        );
                        setSelectedCategory(category.name);
                      } else {
                        setSelectedCategory(category.name);
                        setOpenCategory("");
                      }
                    }}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold ${
                      selectedCategory === category.name
                        ? "bg-green-800 text-white"
                        : "bg-white text-green-900 border border-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* SUB CATEGORY */}
              {openCategory === "Món khác" && (
                <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
                  {categories
                    .find((item) => item.name === "Món khác")
                    ?.children.map((child) => (
                      <button
                        key={child}
                        onClick={() => setSelectedCategory(child)}
                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold ${
                          selectedCategory === child
                            ? "bg-[#c99a45] text-white"
                            : "bg-white text-green-900 border border-gray-100"
                        }`}
                      >
                        {child}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {/* DISH GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5 min-[2200px]:grid-cols-6 gap-3 md:gap-5 px-4 md:px-0">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.name}
                  onClick={() => {
                    setSelectedDish(dish);
                    setSelectedImage(dish.image);
                    setQuantity(1);
                    setSelectedImageIndex(0);
                    setActiveTab("description");
                  }}
                  className={`relative w-full min-w-0 bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden transition grid grid-cols-[110px_minmax(0,1fr)] md:flex md:flex-col md:min-h-[370px] cursor-pointer ${
                    dish.status === "soldout" ? "" : "hover:-translate-y-1"
                  }`}
                >
                  {dish.status === "soldout" && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-red-600 text-white text-[9px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                      <span className="md:hidden">TẠM HẾT</span>
                      <span className="hidden md:inline">MÓN ĂN TẠM HẾT</span>
                    </div>
                  )}

                  {dish.status === "low" && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-yellow-500 text-white text-[9px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                      SẮP HẾT
                    </div>
                  )}

                  <div className="w-full h-28 md:h-48 overflow-hidden md:shrink-0">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="p-3 md:p-5 min-w-0 flex flex-col md:flex-1">
                    <h3 className="font-black text-green-900 text-sm md:text-base">
                      {dish.name}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2 leading-relaxed line-clamp-2 overflow-hidden break-words">
                      {dish.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <p className="font-black text-[#c99a45] text-xs md:text-base">
                        {dish.price}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        disabled={dish.status === "soldout"}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full transition flex items-center justify-center ${
                          dish.status === "soldout"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "border border-[#c99a45] text-[#c99a45] hover:bg-[#c99a45] hover:text-white"
                        }`}
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA ĐẶT BÀN */}
            <div className="hidden md:flex mt-10 bg-green-900 rounded-3xl p-6 md:p-8 flex-col md:flex-row gap-5 items-center justify-between text-center md:text-left overflow-hidden">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[#d6a84f] uppercase">
                  Đặt bàn ngay hôm nay
                </h2>

                <p className="text-white/80 mt-2">
                  Thưởng thức những món ngon từ dê núi Hương Sơn cùng gia đình.
                </p>
              </div>

              <button className="bg-[#d6a84f] hover:bg-[#c99a45] text-green-950 font-bold px-7 py-3 rounded-xl">
                Đặt bàn ngay
              </button>
            </div>
          </main>
        </div>
      </section>

      {/* Xem nhanh chi tiết món ăn */}
      {/* QUICK VIEW MODAL */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-3 py-5 overflow-hidden"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-6xl w-full h-[88vh] shadow-2xl relative text-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-green-900 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div ref={modalScrollRef} className="h-full overflow-y-auto pr-2">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 p-4 md:p-6">
                {/* LEFT */}
                <div className="rounded-2xl overflow-hidden">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-[#d6a84f] h-52 md:h-[360px] shrink-0">
                    {selectedDish.status === "soldout" && (
                      <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MÓN ĂN TẠM HẾT
                      </div>
                    )}

                    {selectedDish.status === "low" && (
                      <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SẮP HẾT
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsImagePreviewOpen(true)}
                      className="w-full h-full cursor-zoom-in"
                    >
                      <img
                        src={selectedImage || selectedDish.image}
                        alt={selectedDish.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                  {/* THUMBNAILS */}
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {previewImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(img);
                          setSelectedImageIndex(index);
                        }}
                        className={`h-12 md:h-16 rounded-xl overflow-hidden border-2 transition ${
                          selectedImage === img
                            ? "border-[#d6a84f]"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  {/* TABS */}
                  <div className="mt-5 bg-white border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-3 text-center text-xs font-bold border-b">
                      <button
                        onClick={() => setActiveTab("description")}
                        className={`py-3 ${
                          activeTab === "description"
                            ? "text-green-800 border-b-2 border-green-800"
                            : "text-gray-500"
                        }`}
                      >
                        MÔ TẢ
                      </button>

                      <button
                        onClick={() => setActiveTab("ingredients")}
                        className={`py-3 ${
                          activeTab === "ingredients"
                            ? "text-green-800 border-b-2 border-green-800"
                            : "text-gray-500"
                        }`}
                      >
                        THÀNH PHẦN
                      </button>

                      <button
                        onClick={() => setActiveTab("taste")}
                        className={`py-3 ${
                          activeTab === "taste"
                            ? "text-green-800 border-b-2 border-green-800"
                            : "text-gray-500"
                        }`}
                      >
                        HƯƠNG VỊ
                      </button>
                    </div>

                    <div className="p-4 text-sm text-gray-600 leading-relaxed min-h-[130px] md:min-h-[120px]">
                      {activeTab === "description" && (
                        <div>
                          <p>
                            {selectedDish.description} Món ăn được chế biến từ
                            nguyên liệu tươi ngon, giữ trọn hương vị đặc trưng
                            của đặc sản dê Hương Sơn.
                          </p>
                          <p className="mt-3">
                            Phù hợp dùng trong bữa ăn gia đình, tiệc nhỏ hoặc
                            đặt món online.
                          </p>
                        </div>
                      )}

                      {activeTab === "ingredients" && (
                        <ul className="space-y-2">
                          <li>• Thịt dê tươi Hương Sơn</li>
                          <li>• Sả, ớt, hành tím</li>
                          <li>• Rau thơm ăn kèm</li>
                          <li>• Nước chấm đặc biệt</li>
                        </ul>
                      )}

                      {activeTab === "taste" && (
                        <p>
                          Hương vị đậm đà, thơm nhẹ, thịt mềm ngọt tự nhiên, phù
                          hợp khẩu vị gia đình và thực khách yêu thích đặc sản
                          dê núi.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="md:h-[440px] md:flex md:flex-col">
                  <h2 className="text-xl md:text-3xl font-black text-green-900">
                    {selectedDish.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="text-[#d6a84f]">★★★★★</span>
                    <span className="font-bold text-green-900">4.9</span>
                    <span className="text-gray-500">(128 đánh giá)</span>
                  </div>

                  <p className="text-[#c99a45] text-xl md:text-3xl font-black mt-2">
                    {selectedDish.price}
                  </p>

                  <p className="text-gray-600 mt-3 leading-relaxed text-sm">
                    {selectedDish.description} Hương vị đậm đà, thơm ngon, phù
                    hợp dùng trong bữa ăn gia đình và tiệc nhỏ.
                  </p>

                  {/* INFO */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4">
                    <div className="bg-[#fbf7ec] rounded-xl p-2 md:p-3 text-center">
                      <p className="text-xs text-gray-500">Khẩu phần</p>
                      <p className="text-sm font-bold text-green-900">
                        2 - 3 người
                      </p>
                    </div>

                    <div className="bg-[#fbf7ec] rounded-xl p-2 md:p-3 text-center">
                      <p className="text-xs text-gray-500">Chế biến</p>
                      <p className="text-sm font-bold text-green-900">
                        Nóng hổi
                      </p>
                    </div>

                    <div className="bg-[#fbf7ec] rounded-xl p-2 md:p-3 text-center">
                      <p className="text-xs text-gray-500">Thời gian</p>
                      <p className="text-sm font-bold text-green-900">
                        15 - 20 phút
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#fbf7ec] rounded-2xl p-3 md:p-4 max-w-[100%]">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-green-900">Số lượng</p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 rounded-xl border border-green-800 text-green-900 hover:bg-green-50"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">
                          {quantity}
                        </span>

                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-9 h-9 rounded-xl border border-green-800 text-green-900 hover:bg-green-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <button
                        disabled={selectedDish.status === "soldout"}
                        className={`py-3 rounded-xl font-bold transition ${
                          selectedDish.status === "soldout"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-800 text-white hover:bg-green-900"
                        }`}
                      >
                        Thêm vào giỏ hàng
                      </button>

                      <button className="py-3 rounded-xl font-bold border border-green-800 text-green-800 hover:bg-white">
                        Đặt bàn ngay
                      </button>
                    </div>
                  </div>

                  {/* INGREDIENTS */}
                  <div className="mt-5 bg-[#fff8e8] rounded-2xl p-4">
                    <h3 className="font-black text-green-900 mb-3">
                      Thành phần chính
                    </h3>

                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Thịt dê tươi Hương Sơn</li>
                      <li>• Sả, ớt, hành tím</li>
                      <li>• Rau thơm ăn kèm</li>
                      <li>• Nước chấm đặc biệt</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* RECOMMEND */}
              <div className="px-4 md:px-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5 text-green-800" />
                  <h3 className="font-black text-green-900 text-lg">
                    Món ăn kèm gợi ý
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dishes.slice(0, 4).map((item) => (
                    <div
                      key={item.name}
                      onClick={() => {
                        setSelectedDish(item);
                        setSelectedImage(item.image);
                        setQuantity(1);
                        setActiveTab("description");

                        setTimeout(() => {
                          modalScrollRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }, 0);
                      }}
                      className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:-translate-y-1 hover:shadow-md transition grid grid-cols-[90px_minmax(0,1fr)] h-[110px]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="p-3 min-w-0 flex flex-col h-full">
                        <p className="text-sm font-black text-green-900 line-clamp-2 min-h-[40px]">
                          {item.name}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                          <p className="text-sm font-black text-[#c99a45]">
                            {item.price}
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDish(item);
                              setSelectedImage(item.image);
                              setQuantity(1);
                              setActiveTab("description");
                            }}
                            disabled={item.status === "soldout"}
                            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition shrink-0 ${
                              item.status === "soldout"
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "border border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTTOM INFO */}
              <div className="w-full rounded-xl py-3 px-3 md:px-4 flex items-center justify-center gap-1.5 md:gap- text-[11px] sm:text-xs md:text-sm font-medium text-green-900">
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span>
                  Chất lượng món ăn là ưu tiên hàng đầu của chúng tôi !
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {isImagePreviewOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center">
          {/* CLOSE */}
          <button
            onClick={() => setIsImagePreviewOpen(false)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {/* PREV */}
          <button
            onClick={() => {
              const newIndex =
                selectedImageIndex === 0
                  ? previewImages.length - 1
                  : selectedImageIndex - 1;

              setSelectedImageIndex(newIndex);
              setSelectedImage(previewImages[newIndex]);
            }}
            className="absolute left-4 md:left-8 z-20 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center"
          >
            ❮
          </button>

          {/* IMAGE */}
          <img
            src={selectedImage}
            alt=""
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-2xl"
          />

          {/* NEXT */}
          <button
            onClick={() => {
              const newIndex =
                selectedImageIndex === previewImages.length - 1
                  ? 0
                  : selectedImageIndex + 1;

              setSelectedImageIndex(newIndex);
              setSelectedImage(previewImages[newIndex]);
            }}
            className="absolute right-4 md:right-8 z-20 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center"
          >
            ❯
          </button>
        </div>
      )}

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
    </div>
  );
}

export default MenuPage;
