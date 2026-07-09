import React from "react";
import { X, Leaf, ShieldCheck, Truck, Plus } from "lucide-react";
import RatingStars from "./RatingStars";

export default function DishDetailModal({
  selectedDish,
  setSelectedDish,
  selectedImage,
  setSelectedImage,
  quantity,
  setQuantity,
  activeTab,
  setActiveTab,
  isLoadingReviews,
  dishReviews,
  isLoggedIn,
  setShowLoginModal,
  addToCart,
  navigate,
  modalScrollRef,
  previewImages,
  setSelectedImageIndex,
  fetchDishReviews,
  setIsImagePreviewOpen,
  dishes
}) {
  if (!selectedDish) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-3 py-5 overflow-hidden text-left"
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
                {selectedDish.status === "paused" && (
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
                    className={`h-12 md:h-16 rounded-xl overflow-hidden border-2 transition ${selectedImage === img
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
                <div className="grid grid-cols-4 text-center text-xs font-bold border-b">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`py-3 ${activeTab === "description"
                        ? "text-green-800 border-b-2 border-green-800"
                        : "text-gray-500"
                      }`}
                  >
                    MÔ TẢ
                  </button>

                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`py-3 ${activeTab === "ingredients"
                        ? "text-green-800 border-b-2 border-green-800"
                        : "text-gray-500"
                      }`}
                  >
                    THÀNH PHẦN
                  </button>

                  <button
                    onClick={() => setActiveTab("taste")}
                    className={`py-3 ${activeTab === "taste"
                        ? "text-green-800 border-b-2 border-green-800"
                        : "text-gray-500"
                      }`}
                  >
                    HƯƠNG VỊ
                  </button>

                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-3 ${activeTab === "reviews"
                        ? "text-green-800 border-b-2 border-green-800"
                        : "text-gray-500"
                      }`}
                  >
                    ĐÁNH GIÁ
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
                      {(selectedDish.ingredients
                        ? selectedDish.ingredients.split("\n")
                        : [
                          "Thịt dê tươi Hương Sơn",
                          "Sả, ớt, hành tím",
                          "Rau thơm ăn kèm",
                          "Nước chấm đặc biệt",
                        ]
                      )
                        .filter((item) => item.trim())
                        .map((item, index) => (
                          <li key={index}>• {item.trim()}</li>
                        ))}
                    </ul>
                  )}

                  {activeTab === "taste" && (
                    <p>
                      {selectedDish.flavor ||
                        "Hương vị đậm đà, thơm nhẹ, thịt mềm ngọt tự nhiên, phù hợp khẩu vị gia đình và thực khách yêu thích đặc sản dê núi."}
                    </p>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-3">
                      {isLoadingReviews ? (
                        <p className="text-gray-500 font-bold">
                          Đang tải đánh giá...
                        </p>
                      ) : dishReviews.length === 0 ? (
                        <p className="text-gray-500 font-bold">
                          Chưa có đánh giá cho món ăn này.
                        </p>
                      ) : (
                        dishReviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-xl border border-[#eadfcd] bg-[#fbf7ec] p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-black text-green-900">
                                {review.user_name || "Khách hàng"}
                              </p>

                              <div className="flex items-center gap-2">
                                <RatingStars
                                  rating={review.rating}
                                  size={14}
                                />
                                <span className="text-sm font-black text-green-900">
                                  {review.rating}
                                </span>
                              </div>
                            </div>

                            {review.comment && (
                              <p className="text-gray-600 mt-2 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))
                      )}

                      <p className="text-xs text-gray-400 font-semibold">
                        Bạn có thể đánh giá món sau khi đơn hàng hoàn thành.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md:h-[440px] md:flex md:flex-col">
              <h2 className="text-xl md:text-3xl font-black text-green-900">
                {selectedDish.name}
              </h2>
              {/* Đánh giá + Sao */}
              <div className="flex items-center gap-2 mt-2 text-sm">
                <RatingStars rating={selectedDish.rating} size={16} />

                {Number(selectedDish.reviews || 0) > 0 ? (
                  <>
                    <span className="font-bold text-green-900">
                      {Number(selectedDish.rating || 0).toFixed(1)}
                    </span>

                    <span className="text-gray-500">
                      ({selectedDish.reviews} đánh giá)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 font-bold">
                    Chưa có đánh giá
                  </span>
                )}
              </div>

              <p className="text-[#c99a45] text-xl md:text-3xl font-black mt-2">
                {selectedDish.price}
              </p>

              <p className="text-gray-600 mt-3 leading-relaxed text-sm">
                {selectedDish.shortDescription ||
                  `${selectedDish.description} Hương vị đậm đà, thơm ngon, phù hợp dùng trong bữa ăn gia đình và tiệc nhỏ.`}
              </p>

              {/* INFO */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4">
                <div className="bg-[#fbf7ec] rounded-xl p-2 md:p-3 text-center">
                  <p className="text-xs text-gray-500">Khẩu phần</p>
                  <p className="text-sm font-bold text-green-900">
                    {selectedDish.portion || "2 - 3 người"}
                  </p>
                </div>

                <div className="bg-[#fbf7ec] rounded-xl p-2 md:p-3 text-center">
                  <p className="text-xs text-gray-500">Chế biến</p>
                  <p className="text-sm font-bold text-green-900">
                    {selectedDish.cooking || "Nóng hổi"}
                  </p>
                </div>

                <div className="bg-[#fbf7ec] rounded-xl p-2 md:p-3 text-center">
                  <p className="text-xs text-gray-500">Thời gian</p>
                  <p className="text-sm font-bold text-green-900">
                    {selectedDish.time || "15 - 20 phút"}
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
                    disabled={selectedDish.status === "paused"}
                    onClick={(e) => {
                      addToCart(selectedDish, quantity, e);
                      setSelectedDish(null);
                    }}
                    className={`py-3 rounded-xl font-bold transition-all shadow-sm ${selectedDish.status === "paused"
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-primary text-white hover:bg-primary-light hover:-translate-y-1 hover:shadow-md active:scale-95"
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

                      navigate("/booking", {
                        state: {
                          selectedDish,
                          cartItems,
                        },
                      });

                      setSelectedDish(null);
                    }}
                    className="py-3 rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm hover:-translate-y-1 hover:shadow-md active:scale-95"
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
              {dishes
                .filter((item) => item.id !== selectedDish.id)
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      setSelectedDish(item);
                      setSelectedImage(item.image);
                      setQuantity(1);
                      setSelectedImageIndex(0);
                      setActiveTab("description");
                      fetchDishReviews(item.id);

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
                          disabled={item.status === "paused"}
                          className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition shrink-0 ${item.status === "paused"
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
  );
}
