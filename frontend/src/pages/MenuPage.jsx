import { checkLogin } from "../utils/auth";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { dishes } from "../data/menuData";
import { categories } from "../data/menuCategories";
import DishCard from "../components/DishCard";
import LoginRequiredModal from "../components/LoginRequiredModal";

import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Leaf,
  X,
  Clock,
  ShieldCheck,
  Truck,
  ShoppingCart,
} from "lucide-react";

import goatIcon from "../assets/images/Icon_De.png";
import bannermenu from "../assets/images/menu/banner-menu.jpg";

function MenuPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả món");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openCategory, setOpenCategory] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");
  const modalScrollRef = useRef(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  }); // profile menu
  const [toast, setToast] = useState(null);

  const previewImages =
    selectedDish?.images?.length > 0
      ? selectedDish.images
      : [selectedDish?.image];
  const [showLoginModal, setShowLoginModal] = useState(false);
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
  // kiểm tra đăng nhập
  useEffect(() => {
    setIsLoggedIn(checkLogin());
  }, []);

  // lưu giỏ hàng vào localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // hàm chuyển giá từ string sang number để tính tổng tiền
  const parsePrice = (price) => {
    return Number(price.replace(/[^\d]/g, ""));
  };
  // hàm hiển thị toast thông báo với tự động ẩn sau 3 giây
  const showToast = (dishName) => {
    setToast({
      dishName,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  {
    /* hàm thêm món vào giỏ hàng */
  }
  const addToCart = (dish, qty = 1, event = null) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const cartDish = {
      id: dish.id,
      name: dish.name,
      desc: dish.description,
      price: parsePrice(dish.price),
      qty: qty,
      image: dish.image,
      tag: dish.status === "low" ? "Đặc trưng" : "",
    };

    setCartItems((prev) => {
      const existed = prev.find((item) => item.id === cartDish.id);

      if (existed) {
        return prev.map((item) =>
          item.id === cartDish.id ? { ...item, qty: item.qty + qty } : item,
        );
      }

      return [...prev, cartDish];
    });

    window.dispatchEvent(new Event("cartUpdated"));

    // hiển thị toast khi thêm món vào giỏ hàng
    showToast(dish.name);
  };
  // lọc món ăn theo danh mục
  const filteredDishes = dishes.filter((dish) => {
    const matchCategory =
      selectedCategory === "Tất cả món" || dish.category === selectedCategory;

    const matchSearch =
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategory && matchSearch;
  });

  //Danh sách khi lọc
  const displayedDishes = [...filteredDishes].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);

    if (sortType === "newest") {
      return b.id - a.id;
    }

    if (sortType === "price-asc") {
      return priceA - priceB;
    }

    if (sortType === "price-desc") {
      return priceB - priceA;
    }

    if (sortType === "name-asc") {
      return a.name.localeCompare(b.name, "vi");
    }

    if (sortType === "name-desc") {
      return b.name.localeCompare(a.name, "vi");
    }

    return 0;
  });

  //Mở chi tiết món ăn
  const handleOpenDishDetail = (dish) => {
    setSelectedDish(dish);
    setSelectedImage(dish.image);
    setQuantity(1);
    setSelectedImageIndex(0);
    setActiveTab("description");
  };
  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {/* Toast thông báo */}
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

      {/* BANNER */}
      <section
        className="
relative
py-6 md:py-10
overflow-hidden
bg-center
bg-no-repeat
bg-cover
xl:bg-[length:100%_auto]

after:absolute
after:bottom-0
after:left-0
after:w-full
after:h-24
after:bg-gradient-to-b
after:from-transparent
after:to-[#f6f0e3]
after:pointer-events-none
"
        style={{
          backgroundImage: `
    linear-gradient(
      to right,
      rgba(246,240,227,0.88) 0%,
      rgba(246,240,227,0.20) 18%,
      rgba(0,0,0,0) 40%,
      rgba(0,0,0,0) 60%,
      rgba(246,240,227,0.20) 82%,
      rgba(246,240,227,0.88) 100%
    ),
    url(${bannermenu})
  `,
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-5">
          <div className="text-center md:text-left max-w-3xl">
            <p
              className="text-4xl md:text-5xl text-[#c99a45] mb-2"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Menu
            </p>

            <h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-[62px] text-green-900 leading-none tracking-[-1px]"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 800,
              }}
            >
              Thực đơn đặc sắc
            </h1>

            <p
              className="mt-1 text-base sm:text-lg md:text-2xl lg:text-[38px] text-[#d7b36a] opacity-80 max-w-5xl leading-[2] tracking-[3px]"
              style={{
                fontFamily: "'Allura', cursive",
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              Tinh hoa ẩm thực từ dê núi Hương Sơn
            </p>

            <p className="mt-2 text-gray-700 max-w-lg text-xs md:text-base leading-7">
              Những món ăn được chế biến từ dê núi tươi ngon,
              <br /> đậm đà hương vị đặc trưng của vùng đất Hà Tĩnh.
            </p>
            <div className="mt-0 flex justify-center md:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 180 40"
                className="w-24 md:w-32"
                fill="none"
              >
                <path
                  d="M15 20C25 20 28 10 38 10C30 15 30 25 38 30"
                  stroke="#d4b06a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M48 20C58 20 61 10 71 10C63 15 63 25 71 30"
                  stroke="#d4b06a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M81 20C91 20 94 10 104 10C96 15 96 25 104 30"
                  stroke="#d4b06a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M114 20C124 20 127 10 137 10"
                  stroke="#d4b06a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
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
                      {category.icon && <category.icon className="w-5 h-5" />}
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm món ăn..."
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>
                  {/* Sắp xếp destop */}
                  <div className="h-11 bg-[#fbf7ec] rounded-xl px-4 flex items-center gap-2 text-sm font-semibold">
                    <select
                      value={sortType}
                      onChange={(e) => setSortType(e.target.value)}
                      className="bg-transparent outline-none cursor-pointer"
                    >
                      <option value="newest">Món mới</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                      <option value="name-asc">Tên A-Z</option>
                      <option value="name-desc">Tên Z-A</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* MOBILE CATEGORY BAR */}
            <div className="lg:hidden mb-5 px-4">
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
              {/* tìm kiếm món ăn */}
              <div className="h-11 bg-white rounded-xl px-4 flex items-center gap-2 shadow-sm mb-3">
                <Search className="w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm món ăn..."
                  className="bg-transparent outline-none text-sm w-full"
                />
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
            {displayedDishes.length === 0 ? (
              <div className="min-h-[430px] bg-white/70 border border-[#eadfcd] rounded-3xl shadow-sm flex flex-col items-center justify-center text-center px-5">
                <div className="w-24 h-24 rounded-full bg-[#fbf0dc] flex items-center justify-center mb-5 opacity-80">
                  <img
                    src={goatIcon}
                    alt=""
                    className="w-14 h-14 object-contain opacity-40"
                  />
                </div>

                <h3 className="text-xl md:text-2xl font-black text-green-900">
                  {searchTerm
                    ? "Không tìm thấy món ăn"
                    : "Chưa có món ăn trong danh mục này"}
                </h3>

                <p className="text-gray-500 mt-2 max-w-md leading-relaxed">
                  {searchTerm ? (
                    <>
                      Không có món nào phù hợp với từ khóa{" "}
                      <span className="font-bold text-[#b88935]">
                        "{searchTerm}"
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      Hiện tại nhà hàng chưa cập nhật món ăn cho mục{" "}
                      <span className="font-bold text-[#b88935]">
                        "{selectedCategory}"
                      </span>
                      .
                    </>
                  )}
                </p>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Tất cả món");
                  }}
                  className="mt-6 px-6 py-3 rounded-xl bg-green-900 text-white font-bold hover:bg-green-950 transition"
                >
                  Xem tất cả món
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5 min-[2200px]:grid-cols-6 gap-3 md:gap-5 px-4 md:px-0">
                {displayedDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onOpenDetail={handleOpenDishDetail}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}

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

              <div className="booking-highlight inline-block rounded-xl">
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginModal(true);
                      return;
                    }

                    navigate("/reservation");
                  }}
                  className="booking-btn bg-[#d6a84f] hover:bg-[#c99a45] text-green-950 font-bold px-7 py-3 rounded-xl"
                >
                  Đặt bàn ngay
                </button>
              </div>
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
            className="bg-white rounded-3xl max-w-6xl w-full h-[88vh] shadow-2xl relative text-sm overflow-hidden quick-view-content"
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
                        onClick={(e) => {
                          addToCart(selectedDish, quantity, e);
                          setSelectedDish(null);
                        }}
                        className={`py-3 rounded-xl font-bold transition ${
                          selectedDish.status === "soldout"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-800 text-white hover:bg-green-900"
                        }`}
                      >
                        Thêm vào giỏ hàng
                      </button>

                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            setShowLoginModal(true);
                            return;
                          }

                          const cartItems =
                            JSON.parse(localStorage.getItem("cartItems")) || [];

                          navigate("/reservation", {
                            state: {
                              selectedDish,
                              cartItems,
                            },
                          });

                          setSelectedDish(null);
                        }}
                        className="py-3 rounded-xl font-bold border border-green-800 text-green-800 hover:bg-white"
                      >
                        Đặt bàn ngay
                      </button>
                    </div>
                  </div>

                  {/* INGREDIENTS */}
                  <div className="mt-5 border border-gray-200 rounded-2xl bg-white overflow-visible">
                    <div className="grid grid-cols-3">
                      {/* ITEM */}
                      <div className="min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 px-3 py-4 text-center border-r border-gray-200">
                        <Leaf className="w-5 h-5 text-green-800 shrink-0" />

                        <span className="text-xs sm:text-sm md:text-base font-semibold text-green-900 leading-snug">
                          Nguyên liệu
                          <br />
                          tươi ngon
                        </span>
                      </div>

                      {/* ITEM */}
                      <div className="min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 px-3 py-4 text-center border-r border-gray-200">
                        <ShieldCheck className="w-5 h-5 text-green-800 shrink-0" />

                        <span className="text-xs sm:text-sm md:text-base font-semibold text-green-900 leading-snug">
                          Không chất
                          <br />
                          bảo quản
                        </span>
                      </div>

                      {/* ITEM */}
                      <div className="min-h-[90px] md:min-h-[100px] flex flex-col items-center justify-center gap-2 px-3 py-4 text-center">
                        <Truck className="w-5 h-5 text-green-800 shrink-0" />

                        <span className="text-xs sm:text-sm md:text-base font-semibold text-green-900 leading-snug">
                          Giao hàng
                          <br />
                          nhanh chóng
                        </span>
                      </div>
                    </div>
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
                      className="dish-card relative bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:-translate-y-1 hover:shadow-md transition grid grid-cols-[90px_minmax(0,1fr)] h-[110px]"
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
                              addToCart(item, 1, e);
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
              <div className="w-full rounded-xl py-3 px-3 md:px-4 flex items-center justify-center gap-1.5 md:gap- text-xs sm:text-sm md:text-base font-medium text-green-900">
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

      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => navigate("/login")}
        />
      )}
    </div>
  );
}

export default MenuPage;
