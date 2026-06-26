import { Plus } from "lucide-react";
import RatingStars from "./RatingStars";

function DishCard({ dish, onOpenDetail, onAddToCart }) {
  const hasReviews = Number(dish.reviews || 0) > 0;

  return (
    <div
      onClick={() => onOpenDetail(dish)}
      className={`dish-card relative w-full min-w-0 bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden transition grid grid-cols-[110px_minmax(0,1fr)] md:flex md:flex-col md:min-h-[390px] cursor-pointer ${
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
        <h3 className="font-black text-green-900 text-sm md:text-base line-clamp-1">
          {dish.name}
        </h3>

        <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2 leading-relaxed line-clamp-2 overflow-hidden break-words">
          {dish.shortDescription ||
            dish.description ||
            "Món ăn đặc trưng của nhà hàng"}
        </p>

        {/* Đánh giá */}
        <div className="mt-2 md:mt-3 flex items-center gap-1.5 flex-wrap">
          <RatingStars rating={dish.rating} size={13} />

          {hasReviews ? (
            <span className="text-[11px] md:text-xs font-bold text-gray-500">
              {Number(dish.rating || 0).toFixed(1)} • {dish.reviews} lượt
            </span>
          ) : (
            <span className="text-[11px] md:text-xs font-bold text-gray-400">
              Chưa có đánh giá
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <p className="font-black text-[#c99a45] text-xs md:text-base">
            {dish.price}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish, 1, e);
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
  );
}

export default DishCard;
