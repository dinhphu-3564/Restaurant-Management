import { Plus } from "lucide-react";
import RatingStars from "./RatingStars";

function DishCard({ dish, onOpenDetail, onAddToCart }) {
  const hasReviews = Number(dish.reviews || 0) > 0;

  return (
    <div
      onClick={() => onOpenDetail(dish)}
      className={`dish-card relative w-full min-w-0 bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border border-gray-100 overflow-hidden grid grid-cols-[110px_minmax(0,1fr)] md:flex md:flex-col md:min-h-[390px] cursor-pointer ${
        dish.status === "soldout" ? "opacity-75 grayscale-[0.2]" : ""
      }`}
    >
      {dish.status === "soldout" && (
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-danger text-white text-[9px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-md whitespace-nowrap">
          <span className="md:hidden">TẠM HẾT</span>
          <span className="hidden md:inline">MÓN ĂN TẠM HẾT</span>
        </div>
      )}

      {dish.status === "low" && (
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-warning text-white text-[9px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-md whitespace-nowrap">
          SẮP HẾT
        </div>
      )}

      <div className="w-full h-28 md:h-48 overflow-hidden md:shrink-0 bg-gray-50">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>

      <div className="p-4 md:p-5 min-w-0 flex flex-col md:flex-1">
        <h3 className="font-bold text-gray-900 text-sm md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
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
            <span className="text-[11px] md:text-xs font-medium text-gray-500">
              {Number(dish.rating || 0).toFixed(1)} • {dish.reviews} lượt
            </span>
          ) : (
            <span className="text-[11px] md:text-xs font-medium text-gray-400">
              Chưa có đánh giá
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 md:pt-5 border-t border-gray-50 mt-2">
          <p className="font-bold text-secondary text-sm md:text-lg">
            {dish.price}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish, 1, e);
            }}
            disabled={dish.status === "soldout"}
            className={`w-9 h-9 md:w-11 md:h-11 rounded-full transition-all duration-200 flex items-center justify-center shadow-sm ${
              dish.status === "soldout"
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
