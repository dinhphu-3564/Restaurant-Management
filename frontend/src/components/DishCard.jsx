import { Plus } from "lucide-react";
import RatingStars from "./RatingStars";

function DishCard({ dish, onOpenDetail, onAddToCart }) {
  const hasReviews = Number(dish.reviews || 0) > 0;

  return (
    <div
      onClick={() => onOpenDetail(dish)}
      className={`dish-card relative w-full min-w-0 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border border-gray-100 overflow-hidden grid grid-cols-[110px_minmax(0,1fr)] md:flex md:flex-col md:min-h-[320px] cursor-pointer ${
        dish.status === "paused" ? "opacity-75 grayscale-[0.2]" : ""
      }`}
    >
      {dish.status === "paused" && (
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-danger text-white text-[9px] md:text-[10px] font-bold px-2 md:px-2.5 py-1 rounded-full shadow-md whitespace-nowrap">
          <span className="md:hidden">TẠM HẾT</span>
          <span className="hidden md:inline">TẠM HẾT</span>
        </div>
      )}

      {dish.status === "low" && (
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-warning text-white text-[9px] md:text-[10px] font-bold px-2 md:px-2.5 py-1 rounded-full shadow-md whitespace-nowrap">
          SẮP HẾT
        </div>
      )}

      <div className="w-full h-28 md:h-36 overflow-hidden md:shrink-0 bg-gray-50">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>

      <div className="p-3 md:p-4 min-w-0 flex flex-col md:flex-1">
        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
          {dish.name}
        </h3>

        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2 overflow-hidden break-words">
          {dish.shortDescription ||
            dish.description ||
            "Món ăn đặc trưng của nhà hàng"}
        </p>

        {/* Đánh giá */}
        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
          <RatingStars rating={dish.rating} size={11} />

          {hasReviews ? (
            <span className="text-[10px] md:text-[11px] font-medium text-gray-500">
              {Number(dish.rating || 0).toFixed(1)} • {dish.reviews} lượt
            </span>
          ) : (
            <span className="text-[10px] md:text-[11px] font-medium text-gray-400">
              Chưa có
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 mt-2">
          <p className="font-bold text-secondary text-sm md:text-base">
            {dish.price}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish, 1, e);
            }}
            disabled={dish.status === "paused"}
            className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-sm ${
              dish.status === "paused"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-light hover:shadow-md hover:scale-105 active:scale-95"
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DishCard;
