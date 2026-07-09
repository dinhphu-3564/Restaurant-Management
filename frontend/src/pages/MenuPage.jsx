import { checkLogin } from "../utils/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingStars from "../components/RatingStars";
import { removeVietnameseTones } from "../utils/string";

import { ICON_MAP } from "../data/menuCategories";
import DishCard from "../components/DishCard";
import LoginRequiredModal from "../components/LoginRequiredModal";
import DishDetailModal from "../components/DishDetailModal";

import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Leaf,
  X,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Utensils,
} from "lucide-react";

import goatIcon from "../assets/images/Icon_De.png";
import bannermenu from "../assets/images/menu/banner-menu.jpg";
const API_URL = "http://localhost:5001/api/menu-items";

function MenuPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả món");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [dishes, setDishes] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openCategory, setOpenCategory] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");
  const modalScrollRef = useRef(null);
  const dishesContainerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (dishesContainerRef.current) {
      const elementPosition = dishesContainerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, [selectedCategory]);

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [dishReviews, setDishReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

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
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/categories");
      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  //hàm lấy món từ backend
  const fetchMenuItems = async () => {
    try {
      setIsLoadingMenu(true);
      setMenuError("");

      const res = await fetch(API_URL);
      const result = await res.json();

      if (!result.success) {
        setMenuError(result.message || "Không thể tải danh sách món ăn.");
        setDishes([]);
        return;
      }

      setDishes(result.data || []);
    } catch (error) {
      console.error("Lỗi tải menu:", error);
      setMenuError("Không thể kết nối backend.");
      setDishes([]);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

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

  // hàm chuyển giá từ string sang number để tính tổng tiền
  const parsePrice = (price) => {
    if (typeof price === "number") return price;

    return Number(String(price || "").replace(/[^\d]/g, ""));
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

      let updatedCart;

      if (existed) {
        updatedCart = prev.map((item) =>
          item.id === cartDish.id ? { ...item, qty: item.qty + qty } : item,
        );
      } else {
        updatedCart = [...prev, cartDish];
      }

      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));

      return updatedCart;
    });

    // hiển thị toast khi thêm món vào giỏ hàng
    showToast(dish.name);
  };
  // lọc món ăn theo danh mục
  const otherChildren =
    categories.find((item) => item.name === "Món khác")?.children?.map(c => c.name) || [];

  const filteredDishes = dishes.filter((dish) => {
    const matchCategory =
      selectedCategory === "Tất cả món" ||
      dish.category === selectedCategory ||
      dish.parentCategory === selectedCategory ||
      dish.subCategory === selectedCategory ||
      (selectedCategory === "Món khác" &&
        (dish.parentCategory === "Món khác" ||
          otherChildren.includes(dish.category) ||
          otherChildren.includes(dish.subCategory)));

    const rawKeyword = String(searchTerm || "").trim();
    const keyword = removeVietnameseTones(rawKeyword);

    const cleanName = removeVietnameseTones(dish.name);
    const cleanDesc = removeVietnameseTones(dish.description);
    const cleanShortDesc = removeVietnameseTones(dish.shortDescription);

    const matchSearch =
      !keyword ||
      cleanName.includes(keyword) ||
      cleanDesc.includes(keyword) ||
      cleanShortDesc.includes(keyword);

    return matchCategory && matchSearch;
  });

  //Danh sách khi lọc
  const displayedDishes = [...filteredDishes].sort((a, b) => {
    const priceA = a.priceNumber || parsePrice(a.price);
    const priceB = b.priceNumber || parsePrice(b.price);

    const idA = Number(String(a.id || "").replace(/\D/g, "")) || 0;
    const idB = Number(String(b.id || "").replace(/\D/g, "")) || 0;

    if (sortType === "newest") {
      return idB - idA;
    }

    if (sortType === "price-asc") {
      return priceA - priceB;
    }

    if (sortType === "price-desc") {
      return priceB - priceA;
    }

    if (sortType === "name-asc") {
      return String(a.name || "").localeCompare(String(b.name || ""), "vi");
    }

    if (sortType === "name-desc") {
      return String(b.name || "").localeCompare(String(a.name || ""), "vi");
    }

    return 0;
  });
  // hàm lấy review
  const fetchDishReviews = async (dishCode) => {
    try {
      setIsLoadingReviews(true);

      const res = await fetch(`${API_URL}/${dishCode}/reviews`);
      const result = await res.json();

      if (result.success) {
        setDishReviews(result.data || []);
      } else {
        setDishReviews([]);
      }
    } catch (error) {
      console.error("Lỗi lấy đánh giá món:", error);
      setDishReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  //Mở chi tiết món ăn
  const handleOpenDishDetail = (dish) => {
    setSelectedDish(dish);
    setSelectedImage(dish.image);
    setQuantity(1);
    setSelectedImageIndex(0);
    setActiveTab("description");
    fetchDishReviews(dish.id);
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
          <aside className="hidden lg:block bg-white rounded-3xl shadow-md p-4 lg:sticky lg:top-24 lg:self-start w-full">
            <h2 className="font-black text-lg mb-4 text-green-900">
              Danh mục món
            </h2>

            <div className="flex lg:block gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-180px)] pb-2 lg:pb-10 lg:space-y-2 custom-scrollbar pr-1">
              {categories.map((category) => (
                <div key={category.name}>
                  {/* CATEGORY BUTTON */}
                  <button
                    onClick={() => {
                      if (category.children && category.children.length > 0) {
                        setOpenCategory(
                          openCategory === category.name ? "" : category.name,
                        );
                      } else {
                        setSelectedCategory(category.name);
                      }
                    }}
                    className={`shrink-0 lg:w-full flex items-center justify-between gap-2 md:gap-3 px-4 py-2.5 lg:py-3 rounded-xl font-semibold transition text-sm md:text-base w-full ${selectedCategory === category.name
                        ? "bg-green-800 text-white"
                        : "text-green-900 hover:bg-[#f6ecd8]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = ICON_MAP[category.icon] || Utensils;
                        return <Icon className="w-5 h-5" />;
                      })()}
                      <span>{category.name}</span>
                    </div>

                    {category.children && category.children.length > 0 &&
                      (openCategory === category.name ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </button>

                  {/* SUB MENU */}
                  {category.children && category.children.length > 0 && openCategory === category.name && (
                    <div className="ml-7 mt-3 space-y-3 border-l border-[#e7dcc6] pl-5">
                      {category.children.map((child) => {
                        const ChildIcon = ICON_MAP[child.icon] || Utensils;

                        return (
                          <button
                            key={child.id}
                            onClick={() => setSelectedCategory(child.name)}
                            className={`w-full flex items-center gap-2 text-left text-sm transition ${selectedCategory === child.name
                                ? "text-[#c99a45] font-bold"
                                : "text-gray-600 hover:text-green-800"
                              }`}
                          >
                            <ChildIcon className="w-4 h-4 shrink-0" />
                            <span>{child.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* LIST MENU */}
          <main ref={dishesContainerRef} className="w-full min-w-0 lg:pr-3">
            {/* TOP BAR */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-md p-5 mb-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-green-900">
                    {categories.find((item) =>
                      item.name === "Món khác" && item.children?.some(c => c.name === selectedCategory)
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
                      if (category.children && category.children.length > 0) {
                        setOpenCategory(
                          openCategory === category.name ? "" : category.name,
                        );
                        setSelectedCategory(category.name);
                      } else {
                        setSelectedCategory(category.name);
                        setOpenCategory("");
                      }
                    }}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold ${selectedCategory === category.name
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
              {categories.some(c => c.name === "Món khác" && openCategory === "Món khác" && c.children && c.children.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
                  {categories
                    .find((item) => item.name === "Món khác")
                    ?.children.map((child) => {
                      const ChildIcon = ICON_MAP[child.icon] || Utensils;

                      return (
                        <button
                          key={child.id}
                          onClick={() => setSelectedCategory(child.name)}
                          className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 ${selectedCategory === child.name
                              ? "bg-[#c99a45] text-white"
                              : "bg-white text-green-900 border border-gray-100"
                            }`}
                        >
                          <ChildIcon className="w-3.5 h-3.5" />
                          {child.name}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
            {/* DISH GRID */}
            {isLoadingMenu ? (
              <div className="min-h-[430px] bg-white/70 border border-[#eadfcd] rounded-3xl shadow-sm flex flex-col items-center justify-center text-center px-5">
                <p className="text-green-900 font-black text-xl">
                  Đang tải danh sách món ăn...
                </p>
              </div>
            ) : menuError ? (
              <div className="min-h-[430px] bg-white/70 border border-[#eadfcd] rounded-3xl shadow-sm flex flex-col items-center justify-center text-center px-5">
                <h3 className="text-xl md:text-2xl font-black text-red-600">
                  Không thể tải menu
                </h3>
                <p className="text-gray-500 mt-2">{menuError}</p>
                <button
                  onClick={fetchMenuItems}
                  className="mt-6 px-6 py-3 rounded-xl bg-green-900 text-white font-bold hover:bg-green-950 transition"
                >
                  Tải lại
                </button>
              </div>
            ) : displayedDishes.length === 0 ? (
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
                      Hiện tại nhà hàng chưa cập nhật món ăn cho mục<br></br>{" "}
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
                  className="mt-6 px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-light shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  Xem tất cả món
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-0">
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

                    navigate("/booking");
                  }}
                  className="bg-secondary hover:bg-secondary-light text-white font-bold px-8 py-3 rounded-full shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
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
      <DishDetailModal
        selectedDish={selectedDish}
        setSelectedDish={setSelectedDish}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        quantity={quantity}
        setQuantity={setQuantity}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoadingReviews={isLoadingReviews}
        dishReviews={dishReviews}
        isLoggedIn={isLoggedIn}
        setShowLoginModal={setShowLoginModal}
        addToCart={addToCart}
        navigate={navigate}
        modalScrollRef={modalScrollRef}
        previewImages={previewImages}
        setSelectedImageIndex={setSelectedImageIndex}
        fetchDishReviews={fetchDishReviews}
        setIsImagePreviewOpen={setIsImagePreviewOpen}
        dishes={dishes}
      />
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
